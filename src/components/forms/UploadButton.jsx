import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { isRemoteEnabled, uploadPublicFile } from '../../lib/supabase.js'

// Sube un archivo a Supabase Storage y devuelve su URL pública.
// Solo se muestra cuando el backend está configurado; sin backend, los
// formularios siguen aceptando URLs pegadas a mano.
export default function UploadButton({ onUploaded, folder = 'materiales', accept }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!isRemoteEnabled) return null

  const handle = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const url = await uploadPublicFile(file, folder)
      onUploaded(url, file.name)
    } catch (err) {
      setError(`No se pudo subir: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col">
      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? 'Subiendo…' : 'Subir archivo'}
        <input type="file" className="hidden" accept={accept} onChange={handle} disabled={busy} />
      </label>
      {error && <span className="mt-1 text-xs text-rose-600">{error}</span>}
    </span>
  )
}
