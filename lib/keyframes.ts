import type { Keyframe, Waypoint } from '@/types'
import { findNearestWaypoint } from './gps-parse'

/** One frame every 5s — spec §3b: ~220ft between frames at 30mph, good enough to catch most hazards. */
export const KEYFRAME_INTERVAL_SECONDS = 5

export interface ExtractProgress {
  done: number
  total: number
}

/**
 * Seeks through the video in the browser, drawing each frame to a canvas and exporting it as a
 * JPEG blob — spec §3b. Runs entirely client-side; no video is ever sent to the server, only the
 * extracted keyframes.
 */
export async function extractKeyframes(
  videoFile: File,
  routeId: string,
  waypoints: Waypoint[],
  onProgress?: (progress: ExtractProgress) => void,
): Promise<Keyframe[]> {
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  const objectUrl = URL.createObjectURL(videoFile)
  video.src = objectUrl
  video.muted = true
  video.playsInline = true

  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => resolve(), { once: true })
      video.addEventListener('error', () => reject(new Error('Could not read video file')), { once: true })
    })

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const total = Math.max(1, Math.ceil(video.duration / KEYFRAME_INTERVAL_SECONDS))
    const keyframes: Keyframe[] = []
    let done = 0

    for (let t = 0; t < video.duration; t += KEYFRAME_INTERVAL_SECONDS) {
      await new Promise<void>((resolve, reject) => {
        video.addEventListener('seeked', () => resolve(), { once: true })
        video.addEventListener('error', () => reject(new Error('Seek failed')), { once: true })
        video.currentTime = t
      })

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
      if (blob) {
        const nearest = findNearestWaypoint(waypoints, t)
        keyframes.push({
          timestampSeconds: t,
          blob,
          fileName: `route_${routeId}_frame_${Math.round(t)}s.jpg`,
          latitude: nearest?.latitude ?? null,
          longitude: nearest?.longitude ?? null,
        })
      }

      done += 1
      onProgress?.({ done, total })
    }

    return keyframes
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
