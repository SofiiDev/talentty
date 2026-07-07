import { useState } from 'react'
import { ExternalLink, Plus, Trash2, FileText } from 'lucide-react'
import { Modal, Button, Field, inputCls } from '../ui.jsx'
import { platformMeta, isValidLink } from '../../lib/video.jsx'
import { useStore } from '../../store.jsx'

export const seminarStatuses = ['Programado', 'En vivo', 'Finalizado', 'Cancelado']

const uid = () => Math.random().toString(36).slice(2, 10)

const blank = {
  title: '', description: '', courseId: '', platform: 'zoom', link: '',
  videoUrl: '', imageUrl: '', materials: [],
  date: '', time: '', durationMin: 60, host: '', attendees: [], status: 'Programado',
}

// Formulario de alta/edición de seminarios, compartido entre Seminarios y Entrenador.
// Montar solo cuando está abierto: el estado inicial se toma de `initial` al montar.
export default function SeminarFormModal({ mode, initial, onClose, onSubmit }) {
  const { data } = useStore()
  const [form, setForm] = useState(() => ({
    ...blank,
    ...(initial || {}),
    attendees: [...(initial?.attendees || [])],
    materials: (initial?.materials || []).map((m) => ({ ...m })),
  }))
  const [newFile, setNewFile] = useState({ name: '', url: '' })

  const addFile = () => {
    const name = newFile.name.trim()
    const url = newFile.url.trim()
    if (!name || !url) return
    setForm((f) => ({ ...f, materials: [...f.materials, { id: uid(), name, url }] }))
    setNewFile({ name: '', url: '' })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleAttendee = (id) =>
    setForm((f) => ({
      ...f,
      attendees: f.attendees.includes(id)
        ? f.attendees.filter((a) => a !== id)
        : [...f.attendees, id],
    }))

  const linkOk = isValidLink(form.platform, form.link)
  const meta = platformMeta[form.platform]

  const submit = (e) => {
    e.preventDefault()
    if (!linkOk) return
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      videoUrl: form.videoUrl.trim(),
      imageUrl: form.imageUrl.trim(),
      materials: form.materials,
      courseId: form.courseId,
      platform: form.platform,
      link: form.link.trim(),
      date: form.date,
      time: form.time,
      durationMin: Number(form.durationMin) || 60,
      host: form.host.trim(),
      attendees: form.attendees,
      status: form.status,
    })
  }

  return (
    <Modal open title={mode === 'create' ? 'Dar de alta un seminario' : 'Editar seminario'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Título del seminario">
          <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Workshop de integridad de datos" />
        </Field>
        <Field label="Descripción">
          <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} placeholder="Temario, objetivos, a quién está dirigido…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Curso vinculado (opcional)">
            <select className={inputCls} value={form.courseId} onChange={set('courseId')}>
              <option value="">— Sin curso —</option>
              {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="Anfitrión/a">
            <input className={inputCls} value={form.host} onChange={set('host')} placeholder="Ana Torres" />
          </Field>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Plataforma de videollamada</span>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(platformMeta).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, platform: key }))}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                  form.platform === key ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.bg}`}>
                  <p.Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-slate-800">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Field
          label={`Enlace de ${meta.name}`}
          hint={
            <>
              ¿Todavía no tenés sala?{' '}
              <a href={meta.newMeeting} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 underline">
                Crear reunión en {meta.name} <ExternalLink className="h-3 w-3" />
              </a>{' '}
              y pegá el enlace acá.
            </>
          }
        >
          <input
            className={`${inputCls} ${!linkOk ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
            type="url"
            value={form.link}
            onChange={set('link')}
            placeholder={meta.placeholder}
          />
          {!linkOk && (
            <span className="mt-1 block text-xs text-rose-600">
              El enlace no parece de {meta.name}. Verificá que empiece con {meta.urlPrefix}
            </span>
          )}
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Fecha">
            <input className={inputCls} required type="date" value={form.date} onChange={set('date')} />
          </Field>
          <Field label="Hora">
            <input className={inputCls} required type="time" value={form.time} onChange={set('time')} />
          </Field>
          <Field label="Duración (min)">
            <input className={inputCls} type="number" min="15" step="15" value={form.durationMin} onChange={set('durationMin')} />
          </Field>
        </div>

        <Field label="Estado">
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {seminarStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Video introductorio (URL)" hint="YouTube, Vimeo o video interno (opcional)">
            <input className={inputCls} type="url" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://youtube.com/…" />
          </Field>
          <Field label="Imagen (URL)">
            <input className={inputCls} type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…/flyer.jpg" />
          </Field>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Materiales (PDF, presentaciones…)</span>
          {form.materials.length > 0 && (
            <ul className="mb-2 space-y-2">
              {form.materials.map((m) => (
                <li key={m.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="flex-1 truncate">{m.name}</span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, materials: f.materials.filter((x) => x.id !== m.id) }))}
                    className="text-slate-500 hover:text-rose-600"
                    title="Quitar material"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className={inputCls} value={newFile.name} onChange={(e) => setNewFile((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre. Ej: Agenda (PDF)" />
            <input className={inputCls} type="url" value={newFile.url} onChange={(e) => setNewFile((f) => ({ ...f, url: e.target.value }))} placeholder="https://…/archivo.pdf" />
            <Button type="button" variant="secondary" onClick={addFile} disabled={!newFile.name.trim() || !newFile.url.trim()}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Asistentes</span>
          {data.talents.length === 0 ? (
            <p className="text-sm text-slate-500">Primero agregá talento a tu organización.</p>
          ) : (
            <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
              {data.talents.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={form.attendees.includes(t.id)}
                    onChange={() => toggleAttendee(t.id)}
                  />
                  <span className="truncate text-slate-700">{t.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!linkOk}>{mode === 'create' ? 'Dar de alta' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}
