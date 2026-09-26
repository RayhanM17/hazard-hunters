'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { toast } from 'sonner'
import { UploadCloud, ImageIcon, Loader2, MapPin, MapPinOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import ResultCard from './ResultCard'
import { didGetExplorationBonus } from '@/lib/scoring'
import type { UploadResult } from '@/types'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10

const STATUS_MESSAGES: Record<number, string> = {
  400: 'That file type isn’t supported.',
  401: 'Your session expired — please log in again.',
  409: 'You’ve already uploaded this image.',
  413: `File is larger than ${MAX_MB} MB.`,
  502: 'AI processing failed — please try again.',
  500: 'Something went wrong on our end.',
}

interface Props {
  onResult?: (result: UploadResult) => void
}

type LocationStatus = 'checking' | 'attached' | 'unavailable'

/** Best-effort GPS grab — never blocks the upload longer than the timeout. */
function getLocation(): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60_000 },
    )
  })
}

export default function UploadDropzone({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('checking')

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }
  function handleDragLeave() {
    setDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function processFile(file: File) {
    setResult(null)
    setLocationStatus('checking')

    if (!ACCEPTED.includes(file.type)) {
      toast.error(STATUS_MESSAGES[400])
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(STATUS_MESSAGES[413])
      return
    }

    setPreview(URL.createObjectURL(file))
    uploadFile(file)
  }

  async function uploadFile(file: File) {
    setLoading(true)
    try {
      const coords = await getLocation()
      setLocationStatus(coords ? 'attached' : 'unavailable')

      const form = new FormData()
      form.append('file', file)
      if (coords) {
        form.append('latitude', String(coords.latitude))
        form.append('longitude', String(coords.longitude))
      }

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? STATUS_MESSAGES[res.status] ?? 'Upload failed.')
        return
      }
      const uploadResult = data as UploadResult
      setResult(uploadResult)
      onResult?.(uploadResult)

      if (
        didGetExplorationBonus(
          uploadResult.submission.pointsAwarded,
          uploadResult.submission.severity,
          uploadResult.submission.confidence,
        )
      ) {
        toast.success('+75 New Territory Discovered!', {
          icon: <MapPin size={16} />,
          description: 'First report from this map cell — bonus points awarded.',
        })
      }
    } catch {
      toast.error('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
          dragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-amber-500/30 hover:border-amber-500/60',
          !dragging && !loading && 'animate-pulse-slow',
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            className="mx-auto max-h-48 rounded-xl border border-white/10 object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-4 text-amber-400 shadow-glow-amber">
              <UploadCloud size={28} />
            </div>
            <p className="text-slate-300">
              Drag &amp; drop a dashcam image, or{' '}
              <span className="text-indigo-400 underline underline-offset-2">browse</span>
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <ImageIcon size={12} /> JPEG · PNG · WebP · up to {MAX_MB} MB
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-1.5">
          <p className="flex items-center justify-center gap-2 text-center text-indigo-400">
            <Loader2 size={16} className="animate-spin" /> Analyzing hazard…
          </p>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            {locationStatus === 'checking' && (
              <>
                <Loader2 size={12} className="animate-spin" /> Checking location…
              </>
            )}
            {locationStatus === 'attached' && (
              <>
                <MapPin size={12} className="text-emerald-400" /> Location attached
              </>
            )}
            {locationStatus === 'unavailable' && (
              <>
                <MapPinOff size={12} /> No location — this photo won&rsquo;t reveal map tiles
              </>
            )}
          </p>
        </div>
      )}

      {result && <ResultCard result={result} />}
    </div>
  )
}
