import { useMemo, useState } from 'react'
import { Plus, Calendar, Clock, Timer, Mic, CalendarPlus, Download, ExternalLink } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  ConfirmDelete, Button, Badge, EmptyState, PageHeader, Avatar, RowActions,
} from '../components/ui.jsx'
import SeminarFormModal from '../components/forms/SeminarFormModal.jsx'
import { platformMeta } from '../lib/video.jsx'
import { googleCalendarUrl, downloadIcs } from '../lib/calendar.js'

export const seminarStatusTone = { Programado: 'blue', 'En vivo': 'green', Finalizado: 'slate', Cancelado: 'rose' }

export function AddToCalendar({ seminar }) {
  const [open, setOpen] = useState(false)
  const meta = platformMeta[seminar.platform]
  if (!seminar.date) return null
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        title="Añadir al calendario"
      >
        <CalendarPlus className="h-4 w-4" /> Calendario
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <a
              href={googleCalendarUrl(seminar, meta.name)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" /> Google Calendar
            </a>
            <button
              onClick={() => {
                downloadIcs([seminar], () => meta.name, `${seminar.title.toLowerCase().replace(/\s+/g, '-')}.ics`)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-400" /> Descargar .ics (Outlook/Apple)
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function SeminarCard({ seminar, onEdit, onDelete }) {
  const { courseById, talentById } = useStore()
  const m = platformMeta[seminar.platform]
  const course = courseById(seminar.courseId)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
          <m.Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{seminar.title}</h3>
            <Badge tone={seminarStatusTone[seminar.status]}>{seminar.status}</Badge>
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {seminar.date || 'Sin fecha'}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {seminar.time || '--:--'} hs</span>
            <span className="inline-flex items-center gap-1.5"><Timer className="h-4 w-4" /> {seminar.durationMin} min</span>
            <span>{m.name}</span>
            {seminar.host && <span className="inline-flex items-center gap-1.5"><Mic className="h-4 w-4" /> {seminar.host}</span>}
          </p>
          {course && (
            <p className="mt-1 text-xs text-slate-400">Vinculado al curso: <span className="font-medium text-slate-600">{course.title}</span></p>
          )}
          {seminar.attendees.length > 0 && (
            <div className="mt-3 flex items-center gap-1">
              <div className="flex -space-x-2">
                {seminar.attendees.slice(0, 5).map((id) => {
                  const t = talentById(id)
                  return t ? <span key={id} className="rounded-full ring-2 ring-white"><Avatar name={t.name} size="sm" /></span> : null
                })}
              </div>
              <span className="ml-2 text-xs text-slate-500">{seminar.attendees.length} asistentes</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {seminar.link ? (
            <a
              href={seminar.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Unirse a {m.name}
            </a>
          ) : (
            <Badge tone="amber">Sin enlace</Badge>
          )}
          <AddToCalendar seminar={seminar} />
          <RowActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}

export default function Seminars() {
  const { data, seminars } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const sorted = useMemo(
    () => [...data.seminars].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
    [data.seminars],
  )

  const submit = (payload) => {
    if (modal.mode === 'create') seminars.add(payload)
    else seminars.update(modal.item.id, payload)
    setModal(null)
  }

  const exportAll = () => {
    const withDate = data.seminars.filter((s) => s.date && s.status !== 'Cancelado')
    if (withDate.length) downloadIcs(withDate, (s) => platformMeta[s.platform].name)
  }

  return (
    <div>
      <PageHeader
        title="Seminarios"
        subtitle="Programá sesiones en vivo y vinculalas con Zoom o Google Meet."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportAll}><Download className="h-4 w-4" /> Exportar .ics</Button>
            <Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Programar seminario</Button>
          </div>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon="🎥"
          title="No hay seminarios programados"
          subtitle="Creá tu primer seminario profesional y vinculalo con una sala de Zoom o Google Meet."
          action={<Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Programar seminario</Button>}
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((s) => (
            <SeminarCard
              key={s.id}
              seminar={s}
              onEdit={() => setModal({ mode: 'edit', item: s })}
              onDelete={() => setToDelete(s)}
            />
          ))}
        </div>
      )}

      {modal && (
        <SeminarFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSubmit={submit}
        />
      )}

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
