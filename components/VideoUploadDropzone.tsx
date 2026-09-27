'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Film, FileText, Loader2, UploadCloud, MapPinOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { parseGpsFile, GpsParseError } from '@/lib/gps-parse'
import { extractEmbeddedGps, type EmbeddedGpsSource } from '@/lib/embedded-gps'
import { extractKeyframes, KEYFRAME_INTERVAL_SECONDS } from '@/lib/keyframes'
import RouteSummaryCard from './RouteSummaryCard'
import type { RouteProgress, RouteSummary, User, Waypoint } from '@/types'

const MAX_VIDEO_MB = 500
const POLL_INTERVAL_MS = 12_000
// Processing is entirely server-side once uploaded — persisting just the routeId lets polling
// resume correctly after a refresh or navigating away and back, instead of losing all trace of
// an in-flight route (the component's own state doesn't survive either of those).
const PENDING_ROUTE_KEY = 'hh_pending_route'

function savePendingRoute(routeId: string) {
  try {
    localStorage.setItem(PENDING_ROUTE_KEY, routeId)
  } catch {
    // best-effort — worst case, a refresh mid-processing loses the in-progress view
  }
}
function clearPendingRoute() {
  try {
    localStorage.removeItem(PENDING_ROUTE_KEY)
  } catch {
    // ignore
  }
}
function loadPendingRoute(): string | null {
  try {
    return localStorage.getItem(PENDING_ROUTE_KEY)
  } catch {
    return null
  }
}

const SOURCE_LABEL: Record<Exclude<EmbeddedGpsSource, null>, string> = {
  novatek: 'embedded GPS (Novatek/Viofo/70mai format)',
  'blackvue-nmea': 'embedded GPS (BlackVue NMEA format)',
}

type Phase =
  | { name: 'idle' }
  | { name: 'scanning-video' }
  | { name: 'parsing-gps' }
  | { name: 'extracting'; done: number; total: number }
  | { name: 'uploading' }
  | { name: 'processing'; progress: RouteProgress | null }
  | { name: 'done'; summary: RouteSummary }
  | { name: 'error'; message: string }

interface Props {
  onRouteComplete?: (user: User) => void
}

export default function VideoUploadDropzone({ onRouteComplete }: Props) {
  const videoInputRef = useRef<HTMLInputElement>(null)
  const gpsInputRef = useRef<HTMLInputElement>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [gpsFile, setGpsFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>({ name: 'idle' })
  const [pollingRouteId, setPollingRouteId] = useState<string | null>(null)

  const busy = phase.name !== 'idle' && phase.name !== 'done' && phase.name !== 'error'

  function reset() {
    setVideoFile(null)
    setGpsFile(null)
    setPhase({ name: 'idle' })
    setPollingRouteId(null)
    clearPendingRoute()
  }

  // Resume polling a route that was still processing when this component last unmounted
  // (a navigation away) or the page was refreshed — see PENDING_ROUTE_KEY above.
  useEffect(() => {
    const routeId = loadPendingRoute()
    if (routeId) {
      setPhase({ name: 'processing', progress: null })
      setPollingRouteId(routeId)
    }
  }, [])

  useEffect(() => {
    if (!pollingRouteId) return
    let cancelled = false

    async function tick() {
      try {
        const [summaryRes, progressRes] = await Promise.all([
          fetch(`/api/routes/${pollingRouteId}`),
          fetch(`/api/routes/${pollingRouteId}/progress`),
        ])
        if (cancelled) return

        if (!summaryRes.ok) {
          if (summaryRes.status === 404) {
            // Stale entry (route deleted, or from a different account) — drop it silently.
            clearPendingRoute()
            setPollingRouteId(null)
            setPhase({ name: 'idle' })
          }
          return
        }

        const summary = (await summaryRes.json()) as RouteSummary
        const progress = progressRes.ok ? ((await progressRes.json()) as RouteProgress) : null
        if (cancelled) return

        if (summary.status === 'PROCESSED') {
          clearPendingRoute()
          setPhase({ name: 'done', summary })
          setPollingRouteId(null)
          try {
            const meRes = await fetch('/api/me')
            if (meRes.ok && !cancelled) onRouteComplete?.(await meRes.json())
          } catch {
            // best-effort — the header just won't reflect the route's points until next refresh
          }
          return
        }
        if (summary.status === 'FAILED') {
          clearPendingRoute()
          setPhase({ name: 'error', message: 'Route processing failed.' })
          setPollingRouteId(null)
          return
        }
        setPhase({ name: 'processing', progress })
      } catch {
        // network hiccup — next interval tick retries
      }
    }

    tick() // check immediately on resume instead of waiting a full interval
    const interval = setInterval(tick, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pollingRouteId, onRouteComplete])

  function handleVideoChange(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file.')
      return
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video exceeds ${MAX_VIDEO_MB} MB.`)
      return
    }
    setVideoFile(file)
    setPhase({ name: 'idle' })
  }

  function handleGpsChange(file: File | null) {
    if (!file) return
    const name = file.name.toLowerCase()
    if (!name.endsWith('.srt') && !name.endsWith('.gpx')) {
      toast.error('GPS file must be .srt or .gpx.')
      return
    }
    setGpsFile(file)
  }

  async function handleSubmit() {
    if (!videoFile) {
      toast.error('Select a dashcam video first.')
      return
    }

    const routeId = crypto.randomUUID()

    try {
      let waypoints: Waypoint[] = []

      // Try pulling GPS straight out of the video file first — most GPS-enabled dashcams embed
      // it directly (Novatek's binary box for Viofo/70mai/etc., or raw NMEA text for BlackVue).
      setPhase({ name: 'scanning-video' })
      const embedded = await extractEmbeddedGps(videoFile)
      if (embedded.source) {
        waypoints = embedded.waypoints
        toast.success(`Found ${SOURCE_LABEL[embedded.source]} — ${waypoints.length} GPS fixes.`)
      } else if (gpsFile) {
        setPhase({ name: 'parsing-gps' })
        try {
          waypoints = await parseGpsFile(gpsFile)
        } catch (err) {
          if (err instanceof GpsParseError) {
            toast.error(err.message)
          } else {
            toast.error('Could not parse the GPS file.')
          }
          setPhase({ name: 'idle' })
          return
        }
        if (waypoints.length === 0) {
          toast.warning('No GPS readings found in that file — uploading without a route trail.')
        }
      } else {
        toast.message('No embedded or sidecar GPS found — keyframes will upload without location.')
      }

      setPhase({ name: 'extracting', done: 0, total: 1 })
      const keyframes = await extractKeyframes(videoFile, routeId, waypoints, (p) =>
        setPhase({ name: 'extracting', done: p.done, total: p.total }),
      )
      if (keyframes.length === 0) {
        setPhase({ name: 'error', message: 'Could not extract any frames from that video.' })
        return
      }

      setPhase({ name: 'uploading' })
      const form = new FormData()
      form.append('routeId', routeId)
      form.append('videoFileName', videoFile.name)
      form.append('durationSeconds', String(keyframes[keyframes.length - 1].timestampSeconds + KEYFRAME_INTERVAL_SECONDS))
      form.append('waypoints', JSON.stringify(waypoints))
      form.append(
        'keyframeMeta',
        JSON.stringify(keyframes.map((k) => ({ fileName: k.fileName, latitude: k.latitude, longitude: k.longitude }))),
      )
      for (const k of keyframes) {
        form.append('keyframe', k.blob, k.fileName)
      }

      const res = await fetch('/api/routes', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setPhase({ name: 'error', message: data.error ?? 'Upload failed.' })
        return
      }

      toast.success('Route uploaded — processing in the background.')
      savePendingRoute(data.routeId as string)
      setPhase({ name: 'processing', progress: null })
      setPollingRouteId(data.routeId as string)
    } catch (err) {
      console.error(err)
      setPhase({ name: 'error', message: 'Something went wrong processing the video.' })
    }
  }

  return (
    <div className="space-y-4">
      {phase.name !== 'done' && (
        <div
          className={cn(
            'space-y-3 rounded-2xl border-2 border-dashed p-6 transition-colors',
            busy ? 'border-slate-700' : 'border-amber-500/30',
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => videoInputRef.current?.click()}
            >
              <Film size={14} /> {videoFile ? videoFile.name : 'Select dashcam video'}
            </Button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => gpsInputRef.current?.click()}
            >
              <FileText size={14} /> {gpsFile ? gpsFile.name : 'GPS sidecar (.srt/.gpx) — fallback only'}
            </Button>
            <input
              ref={gpsInputRef}
              type="file"
              accept=".srt,.gpx"
              className="hidden"
              onChange={(e) => handleGpsChange(e.target.files?.[0] ?? null)}
            />

            {(videoFile || gpsFile) && !busy && (
              <button
                type="button"
                onClick={reset}
                className="text-slate-500 hover:text-slate-300"
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPinOff size={12} /> GPS is read from the video itself first (Novatek/Viofo/70mai or
            BlackVue formats) — the sidecar file above is only used if none is found.
          </p>

          <Button type="button" variant="cta" size="sm" disabled={!videoFile || busy} onClick={handleSubmit}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {busy ? 'Processing…' : 'Upload route'}
          </Button>
        </div>
      )}

      {phase.name === 'scanning-video' && (
        <p className="flex items-center gap-2 text-sm text-indigo-400">
          <Loader2 size={14} className="animate-spin" /> Scanning video for embedded GPS…
        </p>
      )}

      {phase.name === 'parsing-gps' && (
        <p className="flex items-center gap-2 text-sm text-indigo-400">
          <Loader2 size={14} className="animate-spin" /> Parsing GPS sidecar file…
        </p>
      )}

      {phase.name === 'extracting' && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-sm text-indigo-400">
            <Loader2 size={14} className="animate-spin" /> Extracting frame {phase.done}/{phase.total}…
          </p>
          <Progress value={(phase.done / phase.total) * 100} />
        </div>
      )}

      {phase.name === 'uploading' && (
        <p className="flex items-center gap-2 text-sm text-indigo-400">
          <Loader2 size={14} className="animate-spin" /> Uploading route…
        </p>
      )}

      {phase.name === 'processing' && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-sm text-indigo-400">
            <Loader2 size={14} className="animate-spin" /> Analyzing route
            {phase.progress ? ` — ${phase.progress.done}/${phase.progress.total} keyframes classified` : '…'}
          </p>
          {phase.progress && phase.progress.total > 0 && (
            <Progress value={(phase.progress.done / phase.progress.total) * 100} />
          )}
          <p className="text-xs text-slate-500">
            This runs on a ~1 minute cycle — feel free to navigate away or refresh, it&rsquo;ll pick
            back up here when you return.
          </p>
        </div>
      )}

      {phase.name === 'error' && <p className="text-sm text-red-400">{phase.message}</p>}

      {phase.name === 'done' && (
        <div className="space-y-3">
          <RouteSummaryCard summary={phase.summary} />
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Upload another route
          </Button>
        </div>
      )}
    </div>
  )
}
