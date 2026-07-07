import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, SignalHigh, MonitorSmartphone, User, PlayCircle,
  FileText, CheckCircle2, Circle, ExternalLink, Eye, Award,
} from 'lucide-react'
import { useStore } from '../store.jsx'
import { Badge, Button, Avatar, ProgressBar, inputCls } from '../components/ui.jsx'
import { toEmbedUrl } from '../lib/embed.js'
import { platformMeta } from '../lib/video.jsx'

function VideoEmbed({ url, title }) {
  const embed = toEmbedUrl(url)
  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100">
        <PlayCircle className="h-4 w-4" /> Ver video <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )
  }
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

export default function CourseView() {
  const { courseId } = useParams()
  const { data, courseById, enrollments } = useStore()
  const course = courseById(courseId)
  const [viewerId, setViewerId] = useState(data.talents[0]?.id || '')
  const [openModule, setOpenModule] = useState(null)

  if (!course) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Este curso ya no existe.</p>
        <Link to="/app/cursos" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a cursos
        </Link>
      </div>
    )
  }

  const viewer = data.talents.find((t) => t.id === viewerId)
  const enrollment = data.enrollments.find((e) => e.talentId === viewerId && e.courseId === course.id)
  const completed = enrollment?.completedModules || []
  const total = course.modules.length
  const doneCount = course.modules.filter((m) => completed.includes(m.id)).length
  const progress = total ? Math.round((doneCount / total) * 100) : (enrollment?.progress || 0)

  const linkedSeminars = data.seminars
    .filter((s) => s.courseId === course.id && s.status !== 'Cancelado' && s.status !== 'Finalizado')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))

  const enroll = () => {
    enrollments.add({
      talentId: viewerId,
      courseId: course.id,
      progress: 0,
      status: 'En curso',
      completedModules: [],
      enrolledAt: new Date().toISOString().slice(0, 10),
    })
  }

  const toggleModule = (moduleId) => {
    const next = completed.includes(moduleId)
      ? completed.filter((id) => id !== moduleId)
      : [...completed, moduleId]
    const nextDone = course.modules.filter((m) => next.includes(m.id)).length
    const nextProgress = total ? Math.round((nextDone / total) * 100) : 0
    const patch = {
      completedModules: next,
      progress: nextProgress,
      status: nextProgress >= 100 ? 'Completado' : 'En curso',
    }
    if (enrollment) enrollments.update(enrollment.id, patch)
    else enrollments.add({
      talentId: viewerId, courseId: course.id, ...patch,
      enrolledAt: new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <div>
      {/* Barra superior */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/cursos" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a cursos
        </Link>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <Eye className="h-4 w-4" /> Viendo como:
          <select className={`${inputCls} w-auto py-1.5`} value={viewerId} onChange={(e) => setViewerId(e.target.value)}>
            {data.talents.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {/* Hero del curso */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {course.coverImageUrl ? (
          <img src={course.coverImageUrl} alt="" className="h-44 w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <div className="h-24 bg-gradient-to-r from-brand-700 via-brand-600 to-sky-600" />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{course.category}</Badge>
            <Badge tone="violet">{course.level}</Badge>
            <Badge tone={course.status === 'Publicado' ? 'green' : 'amber'}>{course.status}</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{course.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-600">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {course.instructor || 'Sin instructor'}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.durationHours} horas</span>
            <span className="inline-flex items-center gap-1.5"><SignalHigh className="h-4 w-4" /> {course.level}</span>
            <span className="inline-flex items-center gap-1.5"><MonitorSmartphone className="h-4 w-4" /> {course.modality}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {course.introVideoUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-900">Video introductorio</h2>
              <VideoEmbed url={course.introVideoUrl} title={`Intro — ${course.title}`} />
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 font-semibold text-slate-900">Contenido del curso</h2>
            <p className="mb-4 text-sm text-slate-500">{total} módulos · marcá cada módulo al completarlo</p>
            {total === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                Este curso todavía no tiene módulos cargados.
              </p>
            ) : (
              <ol className="space-y-2">
                {course.modules.map((m, i) => {
                  const isDone = completed.includes(m.id)
                  const isOpen = openModule === m.id
                  return (
                    <li key={m.id} className={`rounded-xl border ${isDone ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-3 p-3">
                        <button
                          onClick={() => toggleModule(m.id)}
                          className={isDone ? 'text-emerald-500' : 'text-slate-300 hover:text-brand-500'}
                          title={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </button>
                        <button className="min-w-0 flex-1 text-left" onClick={() => setOpenModule(isOpen ? null : m.id)}>
                          <p className={`text-sm font-medium ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {i + 1}. {m.title}
                          </p>
                          {m.description && !isOpen && <p className="truncate text-xs text-slate-400">{m.description}</p>}
                        </button>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {m.videoUrl && <PlayCircle className="h-4 w-4 text-sky-500" title="Incluye video" />}
                          {m.fileUrl && <FileText className="h-4 w-4 text-amber-500" title="Incluye material" />}
                        </div>
                      </div>
                      {isOpen && (
                        <div className="space-y-3 border-t border-slate-100 p-4">
                          {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
                          {m.videoUrl && <VideoEmbed url={m.videoUrl} title={m.title} />}
                          {m.fileUrl && (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100">
                              <FileText className="h-4 w-4" /> Descargar material del módulo
                            </a>
                          )}
                          {!m.description && !m.videoUrl && !m.fileUrl && (
                            <p className="text-sm text-slate-400">Este módulo no tiene contenido adicional.</p>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>

        {/* Sidebar del participante */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar name={viewer?.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{viewer?.name}</p>
                <p className="truncate text-xs text-slate-500">{viewer?.role}</p>
              </div>
            </div>
            {enrollment || doneCount > 0 ? (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Tu avance</p>
                <ProgressBar value={progress} />
                <p className="mt-2 text-xs text-slate-500">{doneCount} de {total} módulos completados</p>
                {progress >= 100 && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    <Award className="h-4 w-4" /> ¡Curso completado!
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-slate-500">Todavía no estás inscripto/a en este curso.</p>
                <Button className="mt-3 w-full" onClick={enroll}>Inscribirme</Button>
              </div>
            )}
          </section>

          {(course.attachments?.length || 0) > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Material del curso</h2>
              <ul className="space-y-2">
                {course.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={a.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700">
                      <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="truncate">{a.name}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {linkedSeminars.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Próximas sesiones en vivo</h2>
              <ul className="space-y-3">
                {linkedSeminars.map((s) => {
                  const m = platformMeta[s.platform]
                  return (
                    <li key={s.id} className="rounded-xl border border-slate-100 p-3">
                      <Link to={`/app/seminarios/${s.id}/vista`} className="flex items-start gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.bg}`}>
                          <m.Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700">{s.title}</span>
                          <span className="block text-xs text-slate-500">{s.date} · {s.time} hs · {m.name}</span>
                        </span>
                      </Link>
                      {s.link && (
                        <a href={s.link} target="_blank" rel="noreferrer"
                          className="mt-2 block rounded-lg bg-brand-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-700">
                          Unirse a {m.name}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
