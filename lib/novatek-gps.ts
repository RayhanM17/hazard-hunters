import type { Waypoint } from '@/types'
import { ddmmToDecimal } from './geo'

/**
 * Extracts GPS waypoints embedded by Novatek-chipset dashcams (Viofo, 70mai, and most budget
 * cameras) directly in the MP4 container. This is NOT a standard subtitle/tx3g track — it's a
 * proprietary structure: a 'gps ' descriptor atom inside 'moov' listing offsets of 'free' atoms
 * (magic 'GPS ') scattered through the file, one per GPS fix.
 *
 * Ported from the reference implementation (Sergei Franco, GPL3):
 * https://sergei.nz/extracting-gps-data-from-viofo-a119-and-other-novatek-powered-cameras/
 * https://sergei.nz/files/nvtk_mp42gpx.py
 *
 * Reads the file lazily via Blob.slice() — only atom headers and GPS payloads are pulled into
 * memory, never the (potentially multi-GB) video data itself.
 */

const KNOTS_TO_MPH = 1.150779

interface RawRecord {
  hour: number
  minute: number
  second: number
  year: number
  month: number
  day: number
  latHemi: string
  lonHemi: string
  latRaw: number
  lonRaw: number
  speedKnots: number
  bearing: number
}

async function readBytes(file: File, offset: number, length: number): Promise<DataView | null> {
  if (offset < 0 || offset + length > file.size) return null
  const buf = await file.slice(offset, offset + length).arrayBuffer()
  if (buf.byteLength < length) return null
  return new DataView(buf)
}

function readAscii(view: DataView, offset: number, length: number): string {
  let s = ''
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i))
  return s
}

/** Reads an 8-byte ISO-BMFF box header (big-endian size + 4-char type) at `offset`. */
async function readAtomHeader(file: File, offset: number): Promise<{ size: number; type: string } | null> {
  const view = await readBytes(file, offset, 8)
  if (!view) return null
  return { size: view.getUint32(0, false), type: readAscii(view, 4, 4) }
}

/**
 * Finds the byte offset (within a GPS atom's payload) where the actual fixed-length record
 * begins, by scanning backward for the 'A'/hemisphere marker bytes 24 bytes into the record —
 * mirrors get_gps_offset() in the reference script, including its backward-scan quirk that
 * grabs the last valid record when an atom's payload is padded or holds several concatenated
 * samples.
 */
function findRecordOffset(view: DataView): number {
  for (let pointer = view.byteLength - 20; pointer >= 0; pointer--) {
    const active = String.fromCharCode(view.getUint8(pointer))
    const b1 = String.fromCharCode(view.getUint8(pointer + 1))
    const b2 = String.fromCharCode(view.getUint8(pointer + 2))
    if (active === 'A' && (b1 === 'N' || b1 === 'S') && (b2 === 'E' || b2 === 'W')) {
      return pointer - 24
    }
  }
  return -1
}

function parseRecord(view: DataView, recordOffset: number): RawRecord | null {
  if (recordOffset < 0 || recordOffset + 44 > view.byteLength) return null
  let o = recordOffset
  const hour = view.getUint32(o, true)
  const minute = view.getUint32(o + 4, true)
  const second = view.getUint32(o + 8, true)
  const year = view.getUint32(o + 12, true)
  const month = view.getUint32(o + 16, true)
  const day = view.getUint32(o + 20, true)
  o += 24
  // byte[o] = active flag (already validated), byte[o+1] = lat hemisphere, byte[o+2] = lon
  // hemisphere, byte[o+3] = unknown/padding
  const latHemi = String.fromCharCode(view.getUint8(o + 1))
  const lonHemi = String.fromCharCode(view.getUint8(o + 2))
  o += 4
  const latRaw = view.getFloat32(o, true)
  const lonRaw = view.getFloat32(o + 4, true)
  o += 8
  const speedKnots = view.getFloat32(o, true)
  const bearing = view.getFloat32(o + 4, true)

  return { hour, minute, second, year, month, day, latHemi, lonHemi, latRaw, lonRaw, speedKnots, bearing }
}

async function readGpsAtom(file: File, atomPos: number, atomSize: number): Promise<RawRecord | null> {
  if (atomSize < 12 || atomPos <= 0) return null
  const view = await readBytes(file, atomPos, atomSize)
  if (!view) return null

  const declaredSize = view.getUint32(0, false)
  const type = readAscii(view, 4, 4)
  const magic = readAscii(view, 8, 4)
  if (declaredSize !== atomSize || type !== 'free' || magic !== 'GPS ') return null

  const payload = new DataView(view.buffer, view.byteOffset + 12, view.byteLength - 12)
  const recordOffset = findRecordOffset(payload)
  return parseRecord(payload, recordOffset)
}

/** Walks the 'gps ' descriptor atom inside 'moov', reading every 'free'/'GPS ' record it lists. */
async function readGpsDescriptor(file: File, subOffset: number, subAtomSize: number): Promise<RawRecord[]> {
  const records: RawRecord[] = []
  let gpsOffset = subOffset + 16 // skip the 8-byte atom header + 8-byte version/build-date preamble
  const end = subOffset + subAtomSize

  while (gpsOffset < end) {
    const entry = await readBytes(file, gpsOffset, 8)
    if (!entry) break
    const atomPos = entry.getUint32(0, false)
    const atomSize = entry.getUint32(4, false)
    const record = await readGpsAtom(file, atomPos, atomSize)
    if (record) records.push(record)
    gpsOffset += 8
  }

  return records
}

async function findMoovGpsRecords(file: File): Promise<RawRecord[]> {
  let offset = 0
  while (offset + 8 <= file.size) {
    const header = await readAtomHeader(file, offset)
    if (!header || header.size < 8) break

    if (header.type === 'moov') {
      let subOffset = offset + 8
      const moovEnd = offset + header.size
      while (subOffset + 8 <= moovEnd) {
        const sub = await readAtomHeader(file, subOffset)
        if (!sub || sub.size < 8) break
        if (sub.type === 'gps ') {
          return readGpsDescriptor(file, subOffset, sub.size)
        }
        subOffset += sub.size
      }
      return []
    }

    offset += header.size
  }
  return []
}

/**
 * Attempts to extract embedded GPS waypoints from a dashcam video's Novatek metadata box. Returns
 * an empty array (never throws) if the file has no such box — callers should fall back to a
 * sidecar .srt/.gpx file, or proceed without location.
 */
export async function extractEmbeddedGps(videoFile: File): Promise<Waypoint[]> {
  let raw: RawRecord[]
  try {
    raw = await findMoovGpsRecords(videoFile)
  } catch {
    return []
  }
  if (raw.length === 0) return []

  const firstEpoch = Date.UTC(raw[0].year + 2000, raw[0].month - 1, raw[0].day, raw[0].hour, raw[0].minute, raw[0].second)

  return raw.map((r, i) => {
    const epoch = Date.UTC(r.year + 2000, r.month - 1, r.day, r.hour, r.minute, r.second)
    return {
      sequenceNum: i + 1,
      latitude: ddmmToDecimal(r.latRaw, r.latHemi),
      longitude: ddmmToDecimal(r.lonRaw, r.lonHemi),
      speedMph: r.speedKnots * KNOTS_TO_MPH,
      heading: r.bearing,
      capturedAt: new Date(epoch).toISOString(),
      timestampSeconds: (epoch - firstEpoch) / 1000,
    }
  })
}
