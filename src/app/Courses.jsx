import { useMemo, useState } from 'react'
import { Plus, Clock, SignalHigh, MonitorSmartphone, User } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  ConfirmDelete, Button, Badge, EmptyState, PageHeader, IconEdit, IconTrash,
} from '../components/ui.jsx'
import CourseFormModal, { courseStatuses } from '../components/forms/CourseFormModal.jsx'

export const statusTone = { Publicado: 'green', Borrador: 'amber', Archivado: 'slate' }

export function CourseCard({ course, enrolledCount, onEdit, onDelete }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge tone="brand">{course.category}</Badge>
        <Badge tone={statusTone[course.status]}>{course.status}</Badge>
      </div>
      <h3 className="font-semibold text-slate-900">{course.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{course.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.durationHours} hs</span>
        <span className="inline-flex items-center gap-1"><SignalHigh className="h-3.5 w-3.5" /> {course.level}</span>
        <span className="inline-flex items-center gap-1"><MonitorSmartphone className="h-3.5 w-3.5" /> {course.modality}</span>
      </div>
      <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
        <User className="h-3.5 w-3.5" /> {course.instructor || 'Sin instructor asignado'} · {course.modules.length} módulos · {enrolledCount} inscriptos
      </div>
      {course.modules.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          {course.modules.slice(0, 3).map((m, i) => (
            <li key={m.id} className="truncate">{i + 1}. {m.title}</li>
          ))}
          {course.modules.length > 3 && <li className="text-slate-400">+{course.modules.length - 3} módulos más</li>}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-end gap-1 pt-4">
        <button onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="Editar"><IconEdit /></button>
        <button onClick={onDelete} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><IconTrash /></button>
      </div>
    </div>
  )
}

export default function Courses() {
  const { data, courses } = useStore()
  const [filter, setFilter] = useState('Todos')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(
    () => data.courses.filter((c) => filter === 'Todos' || c.status === filter),
    [data.courses, filter],
  )

  const submit = (payload) => {
    if (modal.mode === 'create') courses.add({ ...payload, createdAt: new Date().toISOString().slice(0, 10) })
    else courses.update(modal.item.id, payload)
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Cursos"
        subtitle="Creá y gestioná el catálogo formativo de tu empresa."
        action={<Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Crear curso</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {['Todos', ...courseStatuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No hay cursos en esta vista"
          subtitle="Creá tu primer curso con módulos, nivel y modalidad para empezar a formar a tu equipo."
          action={<Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Crear curso</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              enrolledCount={data.enrollments.filter((e) => e.courseId === c.id).length}
              onEdit={() => setModal({ mode: 'edit', item: c })}
              onDelete={() => setToDelete(c)}
            />
          ))}
        </div>
      )}

      {modal && (
        <CourseFormModal
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
          courses.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
