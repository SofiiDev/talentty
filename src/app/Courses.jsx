import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock, SignalHigh, MonitorSmartphone, User, PlayCircle, FileText, Eye, Star, Search } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  ConfirmDelete, Button, Badge, EmptyState, PageHeader, IconEdit, IconTrash, inputCls,
} from '../components/ui.jsx'
import CourseFormModal, { courseStatuses } from '../components/forms/CourseFormModal.jsx'

export const statusTone = { Publicado: 'green', Borrador: 'amber', Archivado: 'slate' }

export function RatingStars({ value, count }) {
  if (!count) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600" title={`${value.toFixed(1)} de 5 (${count} reseñas)`}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        ))}
      </span>
      {value.toFixed(1)} <span className="text-slate-500">({count})</span>
    </span>
  )
}

export function CourseCard({ course, enrolledCount, rating, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      {course.coverImageUrl && (
        <img src={course.coverImageUrl} alt="" className="h-32 w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
      )}
      <div className="flex flex-1 flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{course.category}</Badge>
          {course.featured && <Badge tone="amber">★ Destacado</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <Badge tone={statusTone[course.status]}>{course.status}</Badge>
          {onToggleFeatured && (
            <button
              onClick={onToggleFeatured}
              className={`rounded-lg p-1.5 ${course.featured ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-500'}`}
              title={course.featured ? 'Quitar de destacados' : 'Destacar curso'}
              aria-label={course.featured ? 'Quitar de destacados' : 'Destacar curso'}
            >
              <Star className={`h-4 w-4 ${course.featured ? 'fill-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-slate-900">{course.title}</h3>
      {rating && <div className="mt-1"><RatingStars value={rating.avg} count={rating.count} /></div>}
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
            <li key={m.id} className="flex items-center gap-1.5">
              <span className="truncate">{i + 1}. {m.title}</span>
              {m.videoUrl && <PlayCircle className="h-3 w-3 shrink-0 text-sky-500" />}
              {m.fileUrl && <FileText className="h-3 w-3 shrink-0 text-amber-500" />}
            </li>
          ))}
          {course.modules.length > 3 && <li className="text-slate-500">+{course.modules.length - 3} módulos más</li>}
        </ul>
      )}
      {((course.attachments?.length || 0) > 0 || course.introVideoUrl) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {course.introVideoUrl && (
            <a href={course.introVideoUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100">
              <PlayCircle className="h-3.5 w-3.5" /> Video introductorio
            </a>
          )}
          {(course.attachments || []).map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
              <FileText className="h-3.5 w-3.5" /> {a.name}
            </a>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-1 pt-4">
        <Link
          to={`/app/cursos/${course.id}/vista`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          title="Ver el curso como lo ve cada participante"
        >
          <Eye className="h-3.5 w-3.5" /> Vista del participante
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Editar"><IconEdit /></button>
          <button onClick={onDelete} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><IconTrash /></button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function Courses() {
  const { data, courses } = useStore()
  const [filter, setFilter] = useState('Todos')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recientes')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const ratings = useMemo(() => {
    const map = {}
    for (const r of data.reviews || []) {
      if (!map[r.courseId]) map[r.courseId] = { sum: 0, count: 0 }
      map[r.courseId].sum += r.rating
      map[r.courseId].count += 1
    }
    for (const k of Object.keys(map)) map[k] = { avg: map[k].sum / map[k].count, count: map[k].count }
    return map
  }, [data.reviews])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const list = data.courses.filter(
      (c) =>
        (filter === 'Todos' || (filter === 'Destacados' ? c.featured : c.status === filter)) &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.instructor || '').toLowerCase().includes(q)),
    )
    const sorters = {
      recientes: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      titulo: (a, b) => a.title.localeCompare(b.title),
      duracion: (a, b) => a.durationHours - b.durationHours,
      valoracion: (a, b) => (ratings[b.id]?.avg || 0) - (ratings[a.id]?.avg || 0),
    }
    return [...list].sort(sorters[sort])
  }, [data.courses, filter, query, sort, ratings])

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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            className={`${inputCls} w-72 pl-9`}
            placeholder="Buscar por título, categoría o instructor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar cursos"
          />
        </div>
        <select className={`${inputCls} w-auto`} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar cursos">
          <option value="recientes">Más recientes</option>
          <option value="valoracion">Mejor valorados</option>
          <option value="titulo">Título (A-Z)</option>
          <option value="duracion">Duración (menor a mayor)</option>
        </select>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {['Todos', 'Destacados', ...courseStatuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s === 'Destacados' ? '★ Destacados' : s}
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
              rating={ratings[c.id]}
              onEdit={() => setModal({ mode: 'edit', item: c })}
              onDelete={() => setToDelete(c)}
              onToggleFeatured={() => courses.update(c.id, { featured: !c.featured })}
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
