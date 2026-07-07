import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { Badge, Avatar, ProgressBar, PageHeader } from '../components/ui.jsx'
import { platformMeta } from './Seminars.jsx'

function Stat({ label, value, sub, icon, to }) {
  return (
    <Link to={to} className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </Link>
  )
}

export default function Dashboard() {
  const { data, talentById, courseById } = useStore()
  const { talents, courses, seminars, plans, enrollments } = data

  const active = enrollments.filter((e) => e.status === 'En curso')
  const completed = enrollments.filter((e) => e.status === 'Completado')
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length)
    : 0

  const upcoming = [...seminars]
    .filter((s) => s.status !== 'Finalizado')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 4)

  const recentEnrollments = [...enrollments]
    .sort((a, b) => (b.enrolledAt || '').localeCompare(a.enrolledAt || ''))
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Una mirada general al upskilling de tu equipo."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Talento" value={talents.length} sub={`${talents.filter((t) => t.status === 'Activo').length} activos`} icon="👥" to="/app/talento" />
        <Stat label="Cursos" value={courses.length} sub={`${courses.filter((c) => c.status === 'Publicado').length} publicados`} icon="📚" to="/app/cursos" />
        <Stat label="Inscripciones activas" value={active.length} sub={`${completed.length} completadas`} icon="📈" to="/app/seguimiento" />
        <Stat label="Progreso promedio" value={`${avgProgress}%`} sub={`${plans.length} planes de carrera`} icon="🎯" to="/app/planes" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Próximos seminarios */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Próximos seminarios</h2>
            <Link to="/app/seminarios" className="text-sm font-medium text-brand-600 hover:text-brand-700">Ver todos →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No hay seminarios programados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((s) => {
                const meta = platformMeta[s.platform]
                return (
                  <li key={s.id} className="flex items-center gap-4 py-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${meta.bg}`}>{meta.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-500">{s.date} · {s.time} hs · {meta.name}</p>
                    </div>
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                        Unirse
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Actividad reciente */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Últimas inscripciones</h2>
            <Link to="/app/seguimiento" className="text-sm font-medium text-brand-600 hover:text-brand-700">Ver seguimiento →</Link>
          </div>
          {recentEnrollments.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Todavía no hay inscripciones.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentEnrollments.map((e) => {
                const talent = talentById(e.talentId)
                const course = courseById(e.courseId)
                return (
                  <li key={e.id} className="flex items-center gap-4 py-3">
                    <Avatar name={talent?.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{talent?.name || 'Perfil eliminado'}</p>
                      <p className="truncate text-xs text-slate-500">{course?.title || 'Curso eliminado'}</p>
                    </div>
                    <div className="w-28 shrink-0">
                      <ProgressBar value={e.progress} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Planes de carrera */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Planes de carrera en curso</h2>
          <Link to="/app/planes" className="text-sm font-medium text-brand-600 hover:text-brand-700">Gestionar →</Link>
        </div>
        {plans.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Todavía no hay planes de carrera creados.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.slice(0, 4).map((p) => {
              const talent = talentById(p.talentId)
              const done = p.milestones.filter((m) => m.done).length
              const pct = p.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0
              return (
                <div key={p.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={talent?.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{p.title}</p>
                      <p className="truncate text-xs text-slate-500">{talent?.name} → {p.targetRole}</p>
                    </div>
                    <span className="ml-auto"><Badge tone={p.status === 'Completado' ? 'green' : 'brand'}>{p.status}</Badge></span>
                  </div>
                  <div className="mt-3"><ProgressBar value={pct} /></div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
