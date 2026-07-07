import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, ProgressBar, RowActions, IconTrash,
} from '../components/ui.jsx'

const emptyForm = {
  talentId: '', title: '', targetRole: '', startDate: '', endDate: '',
  status: 'En curso', notes: '', milestones: [],
}

const planStatuses = ['En curso', 'Pausado', 'Completado']
const uid = () => Math.random().toString(36).slice(2, 10)

export default function CareerPlans() {
  const { data, plans, enrollments, talentById, courseById } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newMilestone, setNewMilestone] = useState({ title: '', courseId: '' })

  const openCreate = () => {
    setForm({ ...emptyForm, milestones: [], talentId: data.talents[0]?.id || '' })
    setNewMilestone({ title: '', courseId: '' })
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item, milestones: item.milestones.map((m) => ({ ...m })) })
    setNewMilestone({ title: '', courseId: '' })
    setModal({ mode: 'edit', item })
  }

  const addMilestone = () => {
    const title = newMilestone.title.trim()
    if (!title) return
    setForm((f) => ({
      ...f,
      milestones: [...f.milestones, { id: uid(), title, courseId: newMilestone.courseId, done: false }],
    }))
    setNewMilestone({ title: '', courseId: '' })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      talentId: form.talentId,
      title: form.title.trim(),
      targetRole: form.targetRole.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      notes: form.notes.trim(),
      milestones: form.milestones,
    }
    if (modal.mode === 'create') plans.add(payload)
    else plans.update(modal.item.id, payload)

    // Inscribir automáticamente a la persona en los cursos asignados como hitos
    for (const m of payload.milestones) {
      if (!m.courseId) continue
      const exists = data.enrollments.some(
        (e) => e.talentId === payload.talentId && e.courseId === m.courseId,
      )
      if (!exists) {
        enrollments.add({
          talentId: payload.talentId,
          courseId: m.courseId,
          progress: 0,
          status: 'En curso',
          enrolledAt: new Date().toISOString().slice(0, 10),
        })
      }
    }
    setModal(null)
  }

  const toggleMilestone = (plan, milestoneId) => {
    const milestones = plan.milestones.map((m) =>
      m.id === milestoneId ? { ...m, done: !m.done } : m,
    )
    const allDone = milestones.length > 0 && milestones.every((m) => m.done)
    plans.update(plan.id, {
      milestones,
      status: allDone ? 'Completado' : plan.status === 'Completado' ? 'En curso' : plan.status,
    })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const statusTone = { 'En curso': 'brand', Pausado: 'amber', Completado: 'green' }

  return (
    <div>
      <PageHeader
        title="Planes de carrera"
        subtitle="Trazá el camino de crecimiento de cada persona con hitos y cursos asociados."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Crear plan</Button>}
      />

      {data.plans.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Todavía no hay planes de carrera"
          subtitle="Definí objetivos de crecimiento con hitos medibles para tu equipo."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Crear plan</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {data.plans.map((p) => {
            const talent = talentById(p.talentId)
            const done = p.milestones.filter((m) => m.done).length
            const pct = p.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0
            return (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={talent?.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{p.title}</h3>
                      <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {talent?.name || 'Perfil eliminado'} → <span className="font-medium text-slate-700">{p.targetRole}</span>
                    </p>
                    <p className="text-xs text-slate-400">{p.startDate || '—'} → {p.endDate || '—'}</p>
                  </div>
                  <RowActions onEdit={() => openEdit(p)} onDelete={() => setToDelete(p)} />
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>{done} de {p.milestones.length} hitos completados</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>

                <ul className="mt-4 space-y-2">
                  {p.milestones.map((m) => {
                    const course = m.courseId ? courseById(m.courseId) : null
                    return (
                      <li key={m.id} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => toggleMilestone(p, m.id)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="min-w-0">
                          <p className={`text-sm ${m.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{m.title}</p>
                          {course && <p className="text-xs text-brand-600">📚 {course.title}</p>}
                        </div>
                      </li>
                    )
                  })}
                  {p.milestones.length === 0 && (
                    <li className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400">
                      Sin hitos definidos. Editá el plan para agregarlos.
                    </li>
                  )}
                </ul>

                {p.notes && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">📝 {p.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Crear plan de carrera' : 'Editar plan de carrera'}
        onClose={() => setModal(null)}
        wide
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Profesional">
              <select className={inputCls} required value={form.talentId} onChange={set('talentId')}>
                <option value="" disabled>Elegí una persona…</option>
                {data.talents.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {planStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Nombre del plan">
            <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Camino a Senior Frontend" />
          </Field>
          <Field label="Rol objetivo">
            <input className={inputCls} required value={form.targetRole} onChange={set('targetRole')} placeholder="Ej: Senior Frontend Developer" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Inicio">
              <input className={inputCls} type="date" value={form.startDate} onChange={set('startDate')} />
            </Field>
            <Field label="Fecha objetivo">
              <input className={inputCls} type="date" value={form.endDate} onChange={set('endDate')} />
            </Field>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Hitos del plan</span>
            <p className="mb-2 text-xs text-slate-400">
              Podés asignar cualquier curso del catálogo (incluidos los dados de alta por los entrenadores).
              Al guardar, la persona queda inscripta automáticamente en los cursos asignados y aparece en Seguimiento.
            </p>
            {form.milestones.length > 0 && (
              <ul className="mb-2 space-y-2">
                {form.milestones.map((m) => {
                  const course = m.courseId ? courseById(m.courseId) : null
                  return (
                    <li key={m.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="flex-1 truncate text-slate-700">
                        {m.title}
                        {course && <span className="ml-2 text-xs text-brand-600">📚 {course.title}</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, milestones: f.milestones.filter((x) => x.id !== m.id) }))}
                        className="text-slate-400 hover:text-rose-600"
                        title="Quitar hito"
                      >
                        <IconTrash />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={inputCls}
                value={newMilestone.title}
                onChange={(e) => setNewMilestone((m) => ({ ...m, title: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone() } }}
                placeholder="Ej: Completar curso de arquitectura"
              />
              <select
                className={`${inputCls} sm:w-56`}
                value={newMilestone.courseId}
                onChange={(e) => setNewMilestone((m) => ({ ...m, courseId: e.target.value }))}
              >
                <option value="">Sin curso asociado</option>
                {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <Button type="button" variant="secondary" onClick={addMilestone}>Agregar</Button>
            </div>
          </div>

          <Field label="Notas (opcional)">
            <textarea className={inputCls} rows={2} value={form.notes} onChange={set('notes')} placeholder="Contexto, acuerdos, feedback…" />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Crear plan' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          plans.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
