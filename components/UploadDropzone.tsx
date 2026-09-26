'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import ResultCard from './ResultCard'
import type { UploadResult } from '@/types'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB   = 10

export default function UploadDropzone() {
  const inputRef                       = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]        = useState(false)
  const [preview, setPreview]          = useState<string | null>(null)
  const [loading, setLoading]          = useState(false)
  const [result, setResult]            = useState<UploadResult | null>(null)
  const [error, setError]              = useState<string | null>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }
  function handleDragLeave() { setDragging(false) }

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
    setError(null)
    setResult(null)

    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are accepted.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB} MB.`)
      return
    }

    setPreview(URL.createObjectURL(file))
    uploadFile(file)
  }

  async function uploadFile(file: File) {
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }
      setResult(data as UploadResult)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition
          ${dragging ? 'border-sky-500 bg-sky-500/10' : 'border-gray-700 hover:border-gray-500'}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="mx-auto max-h-48 rounded-lg object-cover" />
        ) : (
          <>
            <p className="text-4xl mb-2">📷</p>
            <p className="text-gray-400">Drag &amp; drop a dashcam image, or <span className="text-sky-400 underline">browse</span></p>
            <p className="text-xs text-gray-600 mt-1">JPEG · PNG · WebP · up to 10 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <p className="text-center text-sky-400 animate-pulse">Analyzing hazard…</p>
      )}

      {/* Error */}
      {error && <p className="text-center text-red-400">{error}</p>}

      {/* Result */}
      {result && <ResultCard result={result} />}
    </div>
  )
}
