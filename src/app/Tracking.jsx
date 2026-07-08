import { useMemo, useState } from 'react'
import { Plus, CalendarClock } from 'lucide-react'
import { useStore } from '../store.jsx'
import { fmtDate, fmtDateTime, nowIso, isOverdue } from '../lib/format.js'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, ProgressBar, RowActions,
} from '../components/ui.jsx'

const emptyForm = { talentId: '', courseId: '', progress: 0, status: 'En curso', dueDate: '' }
const enrollStatuses = ['En curso', 'Completado', 'Abandonado']

export default function Tracking() {
  const { data, enrollments, talentById, courseById } = useStore()
  const [filter, setFilter] = useState('Todos')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(
    () => data.enrollments.filter((e) => filter === 'Todos' || e.status === filter),
    [data.enrollments, filter],
  )

  const openCreate = () => {
    setForm({
      ...emptyForm,
      talentId: data.talents[0]?.id || '',
      courseId: data.courses[0]?.id || '',
    })
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...emptyForm, ...item, dueDate: item.dueDate || '' })
    setModal({ mode: 'edit', item })
  }

  const submit = (e) => {
    e.preventDefault()
    const progress = Math.max(0, Math.min(100, Number(form.progress) || 0))
    const done = progress >= 100 || form.status === 'Completado'
    const payload = {
      talentId: form.talentId,
      courseId: form.courseId,
      progress,
      dueDate: form.dueDate,
      status: progress >= 100 ? 'Completado' : form.status,
      // Timestamp de finalización: se conserva el original si ya estaba completada
      completedAt: done ? (modal.item?.completedAt || nowIso()) : null,
    }
    if (modal.mode === 'create') {
      enrollments.add({ ...payload, enrolledAt: new Date().toISOString().slice(0, 10) })
    } else {
      enrollments.update(modal.item.id, payload)
    }
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const statusTone = { 'En curso': 'blue', Completado: 'green', Abandonado: 'rose' }

  const stats = {
    total: data.enrollments.length,
    completed: data.enrollments.filter((e) => e.status === 'Completado').length,
    avg: data.enrollments.length
      ? Math.round(data.enrollments.reduce((a, e) => a + e.progress, 0) / data.enrollments.length)
      : 0,
  }

  return (
    <div>
      <PageHeader
        title="Seguimiento"
        subtitle="Inscripciones y progreso de tu equipo en cada curso."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Inscribir a un curso</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Inscripciones totales', stats.total],
          ['Cursos completados', stats.completed],
          ['Progreso promedio', `${stats.avg}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {['Todos', ...enrollStatuses].map((s) => (
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
          icon="📈"
          title="No hay inscripciones en esta vista"
          subtitle="Inscribí a las personas de tu equipo en cursos del catálogo para hacer seguimiento de su avance."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Inscribir a un curso</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Profesional</th>
                <th className="px-5 py-3 font-medium">Curso</th>
                <th className="px-5 py-3 font-medium">Inscripción</th>
                <th className="px-5 py-3 font-medium">Fecha límite</th>
                <th className="w-52 px-5 py-3 font-medium">Progreso</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Completada</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => {
                const talent = talentById(e.talentId)
                const course = courseById(e.courseId)
                return (
                  <tr key={e.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={talent?.name} size="sm" />
                        <span className="font-medium text-slate-900">{talent?.name || 'Perfil eliminado'}</span>
                      </div>
                    </td>
                    <td className="max-w-56 truncate px-5 py-3 text-slate-700">{course?.title || 'Curso eliminado'}</td>
                    <td className="px-5 py-3 text-slate-500">{e.enrolledAt || '—'}</td>
                    <td className="px-5 py-3">
                      {e.dueDate ? (
                        <span className={`inline-flex items-center gap-1 text-xs ${isOverdue(e.dueDate) && e.status !== 'Completado' ? 'font-semibold text-rose-600' : 'text-slate-600'}`}>
                          <CalendarClock className="h-3.5 w-3.5" /> {fmtDate(e.dueDate)}
                          {isOverdue(e.dueDate) && e.status !== 'Completado' && <Badge tone="rose">Vencida</Badge>}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3"><ProgressBar value={e.progress} /></td>
                    <td className="px-5 py-3"><Badge tone={statusTone[e.status]}>{e.status}</Badge></td>
                    <td className="px-5 py-3 text-xs text-slate-500">{e.completedAt ? fmtDateTime(e.completedAt) : '—'}</td>
                    <td className="px-5 py-3">
                      <RowActions onEdit={() => openEdit(e)} onDelete={() => setToDelete(e)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Inscribir a un curso' : 'Actualizar seguimiento'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Profesional">
            <select className={inputCls} required value={form.talentId} onChange={set('talentId')}>
              <option value="" disabled>Elegí una persona…</option>
              {data.talents.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Curso">
            <select className={inputCls} required value={form.courseId} onChange={set('courseId')}>
              <option value="" disabled>Elegí un curso…</option>
              {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Fecha límite">
              <input className={inputCls} type="date" value={form.dueDate} onChange={set('dueDate')} />
            </Field>
            <Field label="Progreso (%)">
              <input className={inputCls} type="number" min="0" max="100" value={form.progress} onChange={set('progress')} />
            </Field>
            <Field label="Estado">
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {enrollStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Inscribir' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete ? `la inscripción de ${talentById(toDelete.talentId)?.name || 'este perfil'}` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          enrollments.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
