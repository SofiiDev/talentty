import { useState } from 'react'
import { ExternalLink, Plus, Trash2, FileText } from 'lucide-react'
import { Modal, Button, Field, inputCls } from '../ui.jsx'
import { platformMeta, isValidLink } from '../../lib/video.jsx'
import { useStore } from '../../store.jsx'
import RichTextEditor from '../RichTextEditor.jsx'
import { VideoInput } from '../VideoPlayer.jsx'
import InstructorPicker from '../InstructorPicker.jsx'

export const seminarStatuses = ['Borrador', 'Programado', 'En vivo', 'Finalizado', 'Cancelado']

const uid = () => Math.random().toString(36).slice(2, 10)

export const blankSeminar = {
  title: '', description: '', courseId: '', platform: 'zoom', link: '',
  videoUrl: '', imageUrl: '', materials: [], agenda: [],
  date: '', time: '', durationMin: 60, host: '', attendees: [], status: 'Programado',
}

export const initSeminarForm = (initial) => ({
  ...blankSeminar,
  ...(initial || {}),
  attendees: [...(initial?.attendees || [])],
  materials: (initial?.materials || []).map((m) => ({ ...m })),
  agenda: (initial?.agenda || []).map((a) => ({ ...a })),
})

export const buildSeminarPayload = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  videoUrl: form.videoUrl.trim(),
  imageUrl: form.imageUrl.trim(),
  materials: form.materials,
  agenda: form.agenda,
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

// Campos del seminario, compartidos entre el modal de alta y el editor de instructor.
export function SeminarFields({ form, setForm, showStatus = true }) {
  const { data } = useStore()
  const [newFile, setNewFile] = useState({ name: '', url: '' })
  const [newUnit, setNewUnit] = useState({ title: '', description: '', durationMin: 20 })

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

  const addFile = () => {
    const name = newFile.name.trim()
    const url = newFile.url.trim()
    if (!name || !url) return
    setForm((f) => ({ ...f, materials: [...f.materials, { id: uid(), name, url }] }))
    setNewFile({ name: '', url: '' })
  }

  const addUnit = () => {
    const title = newUnit.title.trim()
    if (!title) return
    setForm((f) => ({
      ...f,
      agenda: [...f.agenda, { id: uid(), title, description: newUnit.description.trim(), durationMin: Number(newUnit.durationMin) || 0 }],
    }))
    setNewUnit({ title: '', description: '', durationMin: 20 })
  }

  return (
    <>
      <Field label="Título del seminario">
        <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Workshop de integridad de datos" />
      </Field>
      <Field label="Descripción" as="div">
        <RichTextEditor
          value={form.description}
          onChange={(html) => setForm((f) => ({ ...f, description: html }))}
          placeholder="Temario, objetivos, a quién está dirigido… Usá títulos, listas y justificado."
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Curso vinculado (opcional)">
          <select className={inputCls} value={form.courseId} onChange={set('courseId')}>
            <option value="">— Sin curso —</option>
            {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Anfitrión/a" as="div" hint="Los perfiles se gestionan y acreditan en la sección Instructores">
          <InstructorPicker value={form.host} onChange={(v) => setForm((f) => ({ ...f, host: v }))} ariaLabel="Anfitrión/a" />
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

      {showStatus && (
        <Field label="Estado">
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {seminarStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Temario (unidades temáticas)</span>
        {form.agenda.length > 0 && (
          <ol className="mb-2 space-y-2">
            {form.agenda.map((u, i) => (
              <li key={u.id} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="text-xs font-semibold text-slate-500">{i + 1}.</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{u.title}</span>
                  {u.description && <span className="block truncate text-xs text-slate-500">{u.description}</span>}
                </span>
                {u.durationMin > 0 && <span className="shrink-0 text-xs text-slate-500">{u.durationMin} min</span>}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, agenda: f.agenda.filter((x) => x.id !== u.id) }))}
                  className="text-slate-500 hover:text-rose-600"
                  aria-label="Quitar unidad del temario"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="space-y-2 rounded-xl border border-slate-200 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className={inputCls} value={newUnit.title}
              onChange={(e) => setNewUnit((u) => ({ ...u, title: e.target.value }))}
              placeholder="Título de la unidad. Ej: BPF en la práctica diaria" />
            <input className={`${inputCls} sm:w-32`} type="number" min="5" step="5" value={newUnit.durationMin}
              onChange={(e) => setNewUnit((u) => ({ ...u, durationMin: e.target.value }))}
              aria-label="Duración en minutos" placeholder="Min" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className={inputCls} value={newUnit.description}
              onChange={(e) => setNewUnit((u) => ({ ...u, description: e.target.value }))}
              placeholder="Descripción breve (opcional)" />
            <Button type="button" variant="secondary" onClick={addUnit} disabled={!newUnit.title.trim()}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
        </div>
      </div>

      <Field label="Video introductorio" as="div" hint="Pegá un enlace (YouTube, Vimeo) o subí tu propio archivo de video">
        <VideoInput value={form.videoUrl} onChange={(v) => setForm((f) => ({ ...f, videoUrl: v }))} />
      </Field>
      <Field label="Imagen (URL)">
        <input className={inputCls} type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…/flyer.jpg" />
      </Field>

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
                  aria-label="Quitar material"
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
    </>
  )
}

// Modal de alta rápida / edición, compartido entre Seminarios y Entrenador.
// Montar solo cuando está abierto: el estado inicial se toma de `initial` al montar.
export default function SeminarFormModal({ mode, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => initSeminarForm(initial))
  const linkOk = isValidLink(form.platform, form.link)

  const submit = (e) => {
    e.preventDefault()
    if (!linkOk) return
    onSubmit(buildSeminarPayload(form))
  }

  return (
    <Modal open title={mode === 'create' ? 'Dar de alta un seminario' : 'Editar seminario'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <SeminarFields form={form} setForm={setForm} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!linkOk}>{mode === 'create' ? 'Dar de alta' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}
