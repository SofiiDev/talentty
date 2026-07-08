import { useMemo, useState } from 'react'
import { Plus, BookOpen, Video, Users, GraduationCap } from 'lucide-react'
import { useStore } from '../store.jsx'
import { ConfirmDelete, Button, PageHeader, EmptyState, inputCls } from '../components/ui.jsx'
import CourseFormModal from '../components/forms/CourseFormModal.jsx'
import SeminarFormModal from '../components/forms/SeminarFormModal.jsx'
import { CourseCard } from './Courses.jsx'
import { SeminarCard } from './Seminars.jsx'

const ALL = 'Todos los entrenadores'

export default function Trainer() {
  const { data, courses, seminars } = useStore()
  const [trainer, setTrainer] = useState(ALL)
  const [tab, setTab] = useState('cursos')
  const [modal, setModal] = useState(null) // {type:'course'|'seminar', mode, item?}
  const [toDelete, setToDelete] = useState(null) // {type, item}

  const trainers = useMemo(() => {
    const names = new Set()
    data.courses.forEach((c) => c.instructor && names.add(c.instructor))
    data.seminars.forEach((s) => s.host && names.add(s.host))
    ;(data.instructors || []).forEach((i) => names.add(i.name))
    return [ALL, ...[...names].sort()]
  }, [data.courses, data.seminars, data.instructors])

  const myCourses = useMemo(
    () => data.courses.filter((c) => trainer === ALL || c.instructor === trainer),
    [data.courses, trainer],
  )
  const mySeminars = useMemo(
    () =>
      data.seminars
        .filter((s) => trainer === ALL || s.host === trainer)
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
    [data.seminars, trainer],
  )

  const totalStudents = useMemo(() => {
    const courseIds = new Set(myCourses.map((c) => c.id))
    return data.enrollments.filter((e) => courseIds.has(e.courseId)).length
  }, [data.enrollments, myCourses])

  const upcomingCount = mySeminars.filter((s) => s.status === 'Programado' || s.status === 'En vivo').length

  const submitCourse = (payload) => {
    if (modal.mode === 'create') courses.add({ ...payload, units: [], createdAt: new Date().toISOString().slice(0, 10) })
    else courses.update(modal.item.id, payload)
    setModal(null)
  }
  const submitSeminar = (payload) => {
    if (modal.mode === 'create') seminars.add(payload)
    else seminars.update(modal.item.id, payload)
    setModal(null)
  }

  const prefillName = trainer === ALL ? '' : trainer

  const stats = [
    { label: 'Cursos publicados', value: myCourses.filter((c) => c.status === 'Publicado').length, Icon: BookOpen },
    { label: 'Seminarios próximos', value: upcomingCount, Icon: Video },
    { label: 'Profesionales inscriptos', value: totalStudents, Icon: Users },
  ]

  return (
    <div>
      <PageHeader
        title="Estudio del entrenador"
        subtitle="El espacio de los formadores: dá de alta cursos y seminarios y gestioná tu catálogo."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setModal({ type: 'course', mode: 'create' })}>
              <Plus className="h-4 w-4" /> Alta de curso
            </Button>
            <Button onClick={() => setModal({ type: 'seminar', mode: 'create' })}>
              <Plus className="h-4 w-4" /> Alta de seminario
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <GraduationCap className="h-4.5 w-4.5 text-brand-600" /> Entrenador/a:
        </span>
        <select className={`${inputCls} w-auto`} value={trainer} onChange={(e) => setTrainer(e.target.value)}>
          {trainers.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
        {[
          ['cursos', `Cursos (${myCourses.length})`],
          ['seminarios', `Seminarios (${mySeminars.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'cursos' && (
        myCourses.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Este entrenador todavía no tiene cursos"
            subtitle="Dá de alta el primer curso para que aparezca en el catálogo y pueda asignarse en los planes de carrera."
            action={<Button onClick={() => setModal({ type: 'course', mode: 'create' })}><Plus className="h-4 w-4" /> Alta de curso</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {myCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                enrolledCount={data.enrollments.filter((e) => e.courseId === c.id).length}
                onEdit={() => setModal({ type: 'course', mode: 'edit', item: c })}
                onDelete={() => setToDelete({ type: 'course', item: c })}
              />
            ))}
          </div>
        )
      )}

      {tab === 'seminarios' && (
        mySeminars.length === 0 ? (
          <EmptyState
            icon="🎥"
            title="Este entrenador todavía no tiene seminarios"
            subtitle="Dá de alta un seminario y vinculalo con Zoom o Google Meet."
            action={<Button onClick={() => setModal({ type: 'seminar', mode: 'create' })}><Plus className="h-4 w-4" /> Alta de seminario</Button>}
          />
        ) : (
          <div className="space-y-4">
            {mySeminars.map((s) => (
              <SeminarCard
                key={s.id}
                seminar={s}
                onEdit={() => setModal({ type: 'seminar', mode: 'edit', item: s })}
                onDelete={() => setToDelete({ type: 'seminar', item: s })}
              />
            ))}
          </div>
        )
      )}

      {modal?.type === 'course' && (
        <CourseFormModal
          mode={modal.mode}
          initial={modal.item || (prefillName ? { instructor: prefillName } : undefined)}
          onClose={() => setModal(null)}
          onSubmit={submitCourse}
        />
      )}
      {modal?.type === 'seminar' && (
        <SeminarFormModal
          mode={modal.mode}
          initial={modal.item || (prefillName ? { host: prefillName } : undefined)}
          onClose={() => setModal(null)}
          onSubmit={submitSeminar}
        />
      )}

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.item?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete.type === 'course') courses.remove(toDelete.item.id)
          else seminars.remove(toDelete.item.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
