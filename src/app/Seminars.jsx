import { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, RowActions,
} from '../components/ui.jsx'

export const platformMeta = {
  zoom: { name: 'Zoom', icon: '🎦', bg: 'bg-sky-100', newMeeting: 'https://zoom.us/meeting/schedule' },
  meet: { name: 'Google Meet', icon: '📹', bg: 'bg-emerald-100', newMeeting: 'https://meet.google.com/new' },
}

const emptyForm = {
  title: '', courseId: '', platform: 'zoom', link: '',
  date: '', time: '', durationMin: 60, host: '', attendees: [], status: 'Programado',
}

const seminarStatuses = ['Programado', 'En vivo', 'Finalizado', 'Cancelado']

const isValidLink = (platform, link) => {
  if (!link) return true
  if (platform === 'zoom') return /^https:\/\/([\w-]+\.)?zoom\.us\//.test(link)
  return /^https:\/\/meet\.google\.com\//.test(link)
}

export default function Seminars() {
  const { data, seminars, courseById, talentById } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const sorted = useMemo(
    () => [...data.seminars].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
    [data.seminars],
  )

  const openCreate = () => {
    setForm({ ...emptyForm, attendees: [] })
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item, attendees: [...item.attendees] })
    setModal({ mode: 'edit', item })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!isValidLink(form.platform, form.link)) return
    const payload = {
      title: form.title.trim(),
      courseId: form.courseId,
      platform: form.platform,
      link: form.link.trim(),
      date: form.date,
      time: form.time,
      durationMin: Number(form.durationMin) || 60,
      host: form.host.trim(),
      attendees: form.attendees,
      status: form.status,
    }
    if (modal.mode === 'create') seminars.add(payload)
    else seminars.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleAttendee = (id) =>
    setForm((f) => ({
      ...f,
      attendees: f.attendees.includes(id)
        ? f.attendees.filter((a) => a !== id)
        : [...f.attendees, id],
    }))

  const statusTone = { Programado: 'blue', 'En vivo': 'green', Finalizado: 'slate', Cancelado: 'rose' }
  const linkOk = isValidLink(form.platform, form.link)
  const meta = platformMeta[form.platform]

  return (
    <div>
      <PageHeader
        title="Seminarios"
        subtitle="Programá sesiones en vivo y vinculalas con Zoom o Google Meet."
        action={<Button onClick={openCreate}>+ Programar seminario</Button>}
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon="🎥"
          title="No hay seminarios programados"
          subtitle="Creá tu primer seminario profesional y vinculalo con una sala de Zoom o Google Meet."
          action={<Button onClick={openCreate}>+ Programar seminario</Button>}
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((s) => {
            const m = platformMeta[s.platform]
            const course = courseById(s.courseId)
            return (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${m.bg}`}>{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{s.title}</h3>
                      <Badge tone={statusTone[s.status]}>{s.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      📅 {s.date || 'Sin fecha'} · 🕐 {s.time || '--:--'} hs · ⏱ {s.durationMin} min · {m.name}
                      {s.host && <> · 🎙 {s.host}</>}
                    </p>
                    {course && (
                      <p className="mt-1 text-xs text-slate-400">Vinculado al curso: <span className="font-medium text-slate-600">{course.title}</span></p>
                    )}
                    {s.attendees.length > 0 && (
                      <div className="mt-3 flex items-center gap-1">
                        <div className="flex -space-x-2">
                          {s.attendees.slice(0, 5).map((id) => {
                            const t = talentById(id)
                            return t ? <span key={id} className="ring-2 ring-white rounded-full"><Avatar name={t.name} size="sm" /></span> : null
                          })}
                        </div>
                        <span className="ml-2 text-xs text-slate-500">{s.attendees.length} asistentes</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {s.link ? (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        Unirse a {m.name}
                      </a>
                    ) : (
                      <Badge tone="amber">Sin enlace</Badge>
                    )}
                    <RowActions onEdit={() => openEdit(s)} onDelete={() => setToDelete(s)} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Programar seminario' : 'Editar seminario'}
        onClose={() => setModal(null)}
        wide
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título del seminario">
            <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Workshop de arquitectura frontend" />
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

          {/* Plataforma */}
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
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${p.bg}`}>{p.icon}</span>
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
                <a href={meta.newMeeting} target="_blank" rel="noreferrer" className="font-medium text-brand-600 underline">
                  Crear reunión en {meta.name}
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
              placeholder={form.platform === 'zoom' ? 'https://zoom.us/j/…' : 'https://meet.google.com/…'}
            />
            {!linkOk && (
              <span className="mt-1 block text-xs text-rose-600">
                El enlace no parece de {meta.name}. Verificá que empiece con {form.platform === 'zoom' ? 'https://zoom.us/' : 'https://meet.google.com/'}
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

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Asistentes</span>
            {data.talents.length === 0 ? (
              <p className="text-sm text-slate-400">Primero agregá talento a tu organización.</p>
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
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" disabled={!linkOk}>{modal?.mode === 'create' ? 'Programar' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          seminars.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
