import { useEffect, useState } from 'react'
import { PlayCircle, ExternalLink, Upload, X, Film } from 'lucide-react'
import { toEmbedUrl } from '../lib/embed.js'
import { isLocalVideo, saveVideo, resolveVideoUrl } from '../lib/videoStore.js'
import { inputCls } from './ui.jsx'

const MAX_UPLOAD_MB = 80

// Reproduce cualquier fuente de video: propio (subido), YouTube/Vimeo (embed)
// o un enlace externo.
export default function VideoPlayer({ url, title }) {
  const [localUrl, setLocalUrl] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let alive = true
    setLocalUrl(null)
    setMissing(false)
    if (isLocalVideo(url)) {
      resolveVideoUrl(url).then((u) => {
        if (!alive) return
        if (u) setLocalUrl(u)
        else setMissing(true)
      })
    }
    return () => { alive = false }
  }, [url])

  if (isLocalVideo(url)) {
    if (missing) {
      return (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          El video propio no está disponible en este dispositivo (los videos subidos se guardan localmente en la demo).
        </p>
      )
    }
    if (!localUrl) return <div className="aspect-video animate-pulse rounded-xl bg-slate-200" aria-label="Cargando video" />
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video controls src={localUrl} className="aspect-video w-full rounded-xl bg-slate-900" title={title} />
    )
  }

  const embed = toEmbedUrl(url)
  if (embed) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
        <iframe
          src={embed}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100">
      <PlayCircle className="h-4 w-4" /> Ver video <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}

// Campo de video: URL (YouTube/Vimeo/interno) o subida de un archivo propio.
export function VideoInput({ value, onChange, placeholder = 'https://youtube.com/…' }) {
  const [uploading, setUploading] = useState(false)
  const local = isLocalVideo(value)

  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      alert(`El video supera el máximo de ${MAX_UPLOAD_MB} MB de la demo. Usá un enlace (YouTube/Vimeo/Drive) para videos más grandes.`)
      return
    }
    setUploading(true)
    try {
      onChange(await saveVideo(file))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {local ? (
        <span className="inline-flex flex-1 items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <Film className="h-4 w-4" /> Video propio cargado
          <button type="button" onClick={() => onChange('')} className="ml-auto rounded p-0.5 text-emerald-600 hover:bg-emerald-100" aria-label="Quitar video propio">
            <X className="h-4 w-4" />
          </button>
        </span>
      ) : (
        <input
          className={inputCls}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Upload className="h-4 w-4" /> {uploading ? 'Subiendo…' : 'Subir video propio'}
        <input type="file" accept="video/*" className="hidden" onChange={upload} />
      </label>
    </div>
  )
}
