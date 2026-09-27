import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query, queryBatch, putFile, type QueryBind } from '@/lib/snowflake'
import { totalRouteDistanceMeters } from '@/lib/geo'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import type { Waypoint } from '@/types'

export const runtime = 'nodejs'

const MAX_KEYFRAMES = 500
const MAX_KEYFRAME_BYTES = 5 * 1024 * 1024 // 5 MB
const WAYPOINT_CHUNK_SIZE = 500
const ROUTE_ID_RE = /^[0-9a-f-]{8,36}$/i

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

interface KeyframeMetaEntry {
  fileName: string
  latitude: number | null
  longitude: number | null
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const routeId = formData.get('routeId')
  const videoFileName = formData.get('videoFileName')
  const durationSecondsRaw = formData.get('durationSeconds')
  const waypointsRaw = formData.get('waypoints')
  const keyframeMetaRaw = formData.get('keyframeMeta')
  const keyframeFiles = formData.getAll('keyframe') as File[]

  if (
    typeof routeId !== 'string' ||
    !ROUTE_ID_RE.test(routeId) ||
    typeof videoFileName !== 'string' ||
    !videoFileName
  ) {
    return NextResponse.json({ error: 'Missing routeId or videoFileName' }, { status: 400 })
  }

  const durationSeconds = Number(durationSecondsRaw)
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return NextResponse.json({ error: 'Missing or invalid durationSeconds' }, { status: 400 })
  }

  let waypoints: Waypoint[] = []
  try {
    waypoints = typeof waypointsRaw === 'string' ? JSON.parse(waypointsRaw) : []
  } catch {
    return NextResponse.json({ error: 'Malformed waypoints JSON' }, { status: 400 })
  }

  let keyframeMeta: KeyframeMetaEntry[] = []
  try {
    keyframeMeta = typeof keyframeMetaRaw === 'string' ? JSON.parse(keyframeMetaRaw) : []
  } catch {
    return NextResponse.json({ error: 'Malformed keyframeMeta JSON' }, { status: 400 })
  }

  if (keyframeFiles.length === 0) {
    return NextResponse.json({ error: 'No keyframes provided' }, { status: 400 })
  }
  if (keyframeFiles.length > MAX_KEYFRAMES) {
    return NextResponse.json({ error: `Too many keyframes (max ${MAX_KEYFRAMES})` }, { status: 400 })
  }
  // Keyframe file names become both the local tmp-file basename and the staged FILE_NAME, so
  // they're pinned to a strict pattern scoped to this routeId — no path traversal, no collisions
  // with another route's frames.
  const keyframeNameRe = new RegExp(`^route_${routeId}_frame_\\d+s\\.jpg$`)
  for (const f of keyframeFiles) {
    if (f.size > MAX_KEYFRAME_BYTES) {
      return NextResponse.json({ error: 'A keyframe exceeds 5 MB' }, { status: 413 })
    }
    if (!keyframeNameRe.test(f.name)) {
      return NextResponse.json({ error: 'Invalid keyframe file name' }, { status: 400 })
    }
  }

  const metaByFileName = new Map(keyframeMeta.map((m) => [m.fileName, m]))
  const tmpPaths: string[] = []

  try {
    const sortedWaypoints = [...waypoints].sort((a, b) => a.sequenceNum - b.sequenceNum)
    const start = sortedWaypoints[0] ?? null
    const end = sortedWaypoints[sortedWaypoints.length - 1] ?? null
    const distanceMeters = sortedWaypoints.length > 1 ? totalRouteDistanceMeters(sortedWaypoints) : null

    // 1. Create the route row (client-generated ROUTE_ID so waypoints/keyframes can reference it
    // in the same request — spec §4a's "generate UUID client-side" option).
    await query(
      `INSERT INTO ROUTES
         (ROUTE_ID, USER_ID, VIDEO_FILE_NAME, START_LAT, START_LNG, END_LAT, END_LNG,
          DURATION_SECONDS, DISTANCE_METERS, TOTAL_WAYPOINTS, TOTAL_KEYFRAMES)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        routeId,
        userId,
        videoFileName,
        start?.latitude ?? null,
        start?.longitude ?? null,
        end?.latitude ?? null,
        end?.longitude ?? null,
        Math.round(durationSeconds),
        distanceMeters,
        sortedWaypoints.length,
        keyframeFiles.length,
      ],
    )

    // 2. Batch insert GPS waypoints — spec §4b, chunked to keep each INSERT reasonably sized.
    if (sortedWaypoints.length > 0) {
      for (const batch of chunk(sortedWaypoints, WAYPOINT_CHUNK_SIZE)) {
        const rows: QueryBind[][] = batch.map((wp) => [
          routeId,
          userId,
          wp.latitude,
          wp.longitude,
          wp.speedMph,
          wp.heading,
          wp.capturedAt,
          wp.sequenceNum,
        ])
        await queryBatch(
          `INSERT INTO ROUTE_WAYPOINTS
             (ROUTE_ID, USER_ID, LATITUDE, LONGITUDE, SPEED_MPH, HEADING, CAPTURED_AT, SEQUENCE_NUM)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          rows,
        )
      }
    }

    // 3. PUT each keyframe image to the stage — spec §4c. PUT stages a file under its local
    // basename, so the tmp file is written as the keyframe's own (validated) name — that's what
    // ends up in SUBMISSIONS.FILE_NAME below, same pairing as app/api/upload/route.ts. Sequential:
    // all PUTs share one Snowflake connection (lib/snowflake.ts singleton), one statement at a time.
    for (const file of keyframeFiles) {
      const tmpPath = path.join(tmpdir(), file.name)
      tmpPaths.push(tmpPath)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(tmpPath, buffer)
      await putFile(tmpPath, 'dashcam_media')
    }

    // 4. Batch insert keyframe submissions — spec §4d. Each is a normal photo submission with a
    // ROUTE_ID link; PROCESS_SUBMISSIONS_TASK classifies it exactly like a standalone photo.
    const submissionRows: QueryBind[][] = keyframeFiles.map((file) => {
      const meta = metaByFileName.get(file.name)
      return [userId, file.name, meta?.latitude ?? null, meta?.longitude ?? null, routeId]
    })
    await queryBatch(
      `INSERT INTO SUBMISSIONS (USER_ID, FILE_NAME, LATITUDE, LONGITUDE, ROUTE_ID, STATUS)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      submissionRows,
    )

    return NextResponse.json({ routeId }, { status: 202 })
  } catch (err) {
    console.error('[POST /api/routes]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await Promise.all(tmpPaths.map((p) => unlink(p).catch(() => null)))
  }
}
