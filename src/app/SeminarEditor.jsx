import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Save, Rocket, Radio, Flag, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store.jsx'
import { Badge, Button } from '../components/ui.jsx'
import { isValidLink } from '../lib/video.jsx'
import { SeminarFields, initSeminarForm, buildSeminarPayload } from '../components/forms/SeminarFormModal.jsx'
import { seminarStatusTone } from './Seminars.jsx'

export default function SeminarEditor() {
  const { seminarId } = useParams()
  const { data, seminars } = useStore()
  const seminar = data.seminars.find((s) => s.id === seminarId)
  const [form, setForm] = useState(() => initSeminarForm(seminar))
  const [savedAt, setSavedAt] = useState(null)

  if (!seminar) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Este seminario ya no existe.</p>
        <Link to="/app/seminarios" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a seminarios
        </Link>
      </div>
    )
  }

  const linkOk = isValidLink(form.platform, form.link)
  const dirty = JSON.stringify(buildSeminarPayload(form)) !== JSON.stringify(buildSeminarPayload(initSeminarForm(seminar)))

  const save = (extra = {}) => {
    if (!linkOk) return
    const payload = { ...buildSeminarPayload(form), ...extra }
    seminars.update(seminar.id, payload)
    if (extra.status) setForm((f) => ({ ...f, status: extra.status }))
    setSavedAt(Date.now())
    setTimeout(() => setSavedAt(null), 2500)
  }

  const status = form.status

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/seminarios" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a seminarios
        </Link>
        <Link to={`/app/seminarios/${seminar.id}/vista`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">
          <Eye className="h-3.5 w-3.5" /> Vista del participante
        </Link>
      </div>

      {/* Encabezado del instructor */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Editor de seminario · Vista de instructor</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{seminar.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={seminarStatusTone[status] || 'slate'}>{status}</Badge>
            {dirty && <Badge tone="amber">Cambios sin guardar</Badge>}
            {savedAt && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Guardado
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === 'Borrador' && (
            <Button onClick={() => save({ status: 'Programado' })} disabled={!linkOk || !form.title.trim()}>
              <Rocket className="h-4 w-4" /> Publicar seminario
            </Button>
          )}
          {status === 'Programado' && (
            <Button variant="secondary" onClick={() => save({ status: 'En vivo' })}>
              <Radio className="h-4 w-4" /> Iniciar en vivo
            </Button>
          )}
          {status === 'En vivo' && (
            <Button variant="secondary" onClick={() => save({ status: 'Finalizado' })}>
              <Flag className="h-4 w-4" /> Finalizar
            </Button>
          )}
          <Button onClick={() => save()} disabled={!dirty || !linkOk || !form.title.trim()}>
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); save() }}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <SeminarFields form={form} setForm={setForm} />
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" disabled={!dirty || !linkOk}>
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
