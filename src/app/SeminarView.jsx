import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Clock, Timer, Mic, FileText, ExternalLink,
  Eye, PlayCircle, BookOpen, CheckCircle2, UserPlus,
} from 'lucide-react'
import { useStore } from '../store.jsx'
import { Badge, Button, Avatar, inputCls } from '../components/ui.jsx'
import { platformMeta } from '../lib/video.jsx'
import { seminarStart } from '../lib/calendar.js'
import { toEmbedUrl } from '../lib/embed.js'
import { AddToCalendar, seminarStatusTone } from './Seminars.jsx'

function countdown(seminar) {
  if (!seminar.date) return null
  const diff = seminarStart(seminar).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `Comienza en ${days} día${days === 1 ? '' : 's'} y ${hours} h`
  if (hours > 0) return `Comienza en ${hours} h ${minutes} min`
  return `¡Comienza en ${minutes} minutos!`
}

export default function SeminarView() {
  const { seminarId } = useParams()
  const { data, seminars, courseById, talentById } = useStore()
  const seminar = data.seminars.find((s) => s.id === seminarId)
  const [viewerId, setViewerId] = useState(data.talents[0]?.id || '')

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

  const meta = platformMeta[seminar.platform]
  const course = seminar.courseId ? courseById(seminar.courseId) : null
  const viewer = talentById(viewerId)
  const isAttendee = seminar.attendees.includes(viewerId)
  const remaining = countdown(seminar)
  const isLive = seminar.status === 'En vivo'
  const videoEmbed = seminar.videoUrl ? toEmbedUrl(seminar.videoUrl) : null

  const joinAttendees = () =>
    seminars.update(seminar.id, { attendees: [...seminar.attendees, viewerId] })

  return (
    <div>
      {/* Barra superior */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/seminarios" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a seminarios
        </Link>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <Eye className="h-4 w-4" /> Viendo como:
          <select className={`${inputCls} w-auto py-1.5`} value={viewerId} onChange={(e) => setViewerId(e.target.value)}>
            {data.talents.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {seminar.imageUrl ? (
          <img src={seminar.imageUrl} alt="" className="h-44 w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <div className={`h-24 bg-gradient-to-r ${seminar.platform === 'zoom' ? 'from-sky-700 to-sky-500' : 'from-emerald-700 to-emerald-500'}`} />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.bg}`}>
              <meta.Icon className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={seminarStatusTone[seminar.status]}>{seminar.status}</Badge>
                <Badge tone="slate">{meta.name}</Badge>
                {course && <Badge tone="brand">Parte de un curso</Badge>}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">{seminar.title}</h1>
              {seminar.description && <p className="mt-2 max-w-3xl text-slate-600">{seminar.description}</p>}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {seminar.date || 'Sin fecha'}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {seminar.time || '--:--'} hs</span>
                <span className="inline-flex items-center gap-1.5"><Timer className="h-4 w-4" /> {seminar.durationMin} minutos</span>
                {seminar.host && <span className="inline-flex items-center gap-1.5"><Mic className="h-4 w-4" /> {seminar.host}</span>}
              </div>
            </div>
          </div>

          {/* CTA principal */}
          <div className={`mt-6 rounded-2xl p-5 ${isLive ? 'bg-emerald-50 ring-2 ring-emerald-300' : 'bg-slate-50'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {isLive ? (
                  <p className="flex items-center gap-2 font-semibold text-emerald-700">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                    </span>
                    ¡El seminario está en vivo ahora!
                  </p>
                ) : remaining ? (
                  <p className="font-semibold text-slate-800">{remaining}</p>
                ) : (
                  <p className="font-semibold text-slate-800">{seminar.status === 'Finalizado' ? 'Este seminario ya finalizó.' : 'Fecha de inicio alcanzada.'}</p>
                )}
                <p className="mt-0.5 text-sm text-slate-500">
                  {isAttendee
                    ? <span className="inline-flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Estás en la lista de asistentes</span>
                    : 'Todavía no estás en la lista de asistentes.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!isAttendee && seminar.status !== 'Finalizado' && (
                  <Button variant="secondary" onClick={joinAttendees}>
                    <UserPlus className="h-4 w-4" /> Anotarme
                  </Button>
                )}
                <AddToCalendar seminar={seminar} />
                {seminar.link ? (
                  <a href={seminar.link} target="_blank" rel="noreferrer"
                    className={`rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm ${isLive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
                    Unirse a {meta.name} →
                  </a>
                ) : (
                  <Badge tone="amber">El anfitrión todavía no cargó el enlace</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {seminar.videoUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-900">Video introductorio</h2>
              {videoEmbed ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
                  <iframe src={videoEmbed} title={seminar.title} className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              ) : (
                <a href={seminar.videoUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100">
                  <PlayCircle className="h-4 w-4" /> Ver video <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </section>
          )}

          {(seminar.materials?.length || 0) > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-900">Materiales del seminario</h2>
              <ul className="space-y-2">
                {seminar.materials.map((m) => (
                  <li key={m.id}>
                    <a href={m.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700">
                      <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="truncate">{m.name}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-900">Curso vinculado</h2>
              <Link to={`/app/cursos/${course.id}/vista`}
                className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 hover:border-brand-200 hover:bg-brand-50/40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-slate-900">{course.title}</span>
                  <span className="mt-0.5 block text-sm text-slate-500">{course.modules.length} módulos · {course.durationHours} hs · {course.instructor}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-600">Ir al curso →</span>
                </span>
              </Link>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar name={viewer?.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{viewer?.name}</p>
                <p className="truncate text-xs text-slate-500">{viewer?.role}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Las notificaciones de este seminario se envían a {viewer?.notifyEmail || viewer?.email}.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Asistentes ({seminar.attendees.length})</h2>
            {seminar.attendees.length === 0 ? (
              <p className="text-sm text-slate-400">Todavía no hay asistentes anotados.</p>
            ) : (
              <ul className="space-y-2">
                {seminar.attendees.map((id) => {
                  const t = talentById(id)
                  if (!t) return null
                  return (
                    <li key={id} className="flex items-center gap-3">
                      <Avatar name={t.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                        <p className="truncate text-xs text-slate-500">{t.role}</p>
                      </div>
                      {id === viewerId && <Badge tone="brand">Vos</Badge>}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
