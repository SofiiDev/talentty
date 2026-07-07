import { useState } from 'react'
import { Plus, ClipboardList, BookOpen } from 'lucide-react'
import { useStore } from '../../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, ProgressBar, RowActions, IconEdit, IconTrash,
} from '../../components/ui.jsx'

export const itemTypes = ['POE / Procedimiento', 'Curso', 'Seminario', 'Taller', 'Inducción', 'Lectura dirigida']
export const frequencies = ['Única', 'Mensual', 'Trimestral', 'Semestral', 'Anual', 'Bienal']
export const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
export const itemStatuses = ['Pendiente', 'Programado', 'En curso', 'Completado', 'Vencido']
const planStatuses = ['Borrador', 'Aprobado', 'En curso', 'Cerrado']

const uid = () => Math.random().toString(36).slice(2, 10)

const planTone = { Borrador: 'amber', Aprobado: 'green', 'En curso': 'blue', Cerrado: 'slate' }
const itemTone = { Pendiente: 'slate', Programado: 'blue', 'En curso': 'amber', Completado: 'green', Vencido: 'rose' }

const emptyPlan = {
  year: new Date().getFullYear(), title: '', area: '', responsible: '',
  status: 'Borrador', frameworkIds: [], notes: '',
}

const emptyItem = {
  code: '', title: '', type: 'POE / Procedimiento', frequency: 'Anual',
  month: 'Enero', functionIds: [], courseId: '', status: 'Pendiente',
}

function PlanFormModal({ mode, initial, onClose, onSubmit }) {
  const { data } = useStore()
  const [form, setForm] = useState(() => ({ ...emptyPlan, ...(initial || {}), frameworkIds: [...(initial?.frameworkIds || [])] }))
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleFramework = (id) =>
    setForm((f) => ({
      ...f,
      frameworkIds: f.frameworkIds.includes(id) ? f.frameworkIds.filter((x) => x !== id) : [...f.frameworkIds, id],
    }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      year: Number(form.year) || new Date().getFullYear(),
      title: form.title.trim(),
      area: form.area.trim(),
      responsible: form.responsible.trim(),
      status: form.status,
      frameworkIds: form.frameworkIds,
      notes: form.notes.trim(),
    })
  }

  return (
    <Modal open title={mode === 'create' ? 'Crear plan anual de capacitación' : 'Editar plan anual'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Año">
            <input className={inputCls} type="number" min="2020" max="2100" required value={form.year} onChange={set('year')} />
          </Field>
          <Field label="Estado">
            <select className={inputCls} value={form.status} onChange={set('status')}>
              {planStatuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Área alcanzada">
            <input className={inputCls} value={form.area} onChange={set('area')} placeholder="Ej: Toda la planta" />
          </Field>
        </div>
        <Field label="Título del plan">
          <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Plan Anual de Capacitación 2026 — Planta" />
        </Field>
        <Field label="Responsable del plan">
          <input className={inputCls} value={form.responsible} onChange={set('responsible')} placeholder="Ej: Responsable de Garantía de Calidad" />
        </Field>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Marcos normativos aplicables</span>
          <p className="mb-2 text-xs text-slate-400">Configurables desde la pestaña “Marcos normativos”.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.frameworks.map((fw) => (
              <label key={fw.id} className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={form.frameworkIds.includes(fw.id)}
                  onChange={() => toggleFramework(fw.id)}
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800">{fw.code}</span>
                  <span className="block text-xs text-slate-500">{fw.name}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <Field label="Notas / criterios de revisión">
          <textarea className={inputCls} rows={2} value={form.notes} onChange={set('notes')} placeholder="Frecuencia de revisión, archivo de registros, criterios de eficacia…" />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{mode === 'create' ? 'Crear plan' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function ItemFormModal({ mode, initial, onClose, onSubmit }) {
  const { data } = useStore()
  const [form, setForm] = useState(() => ({ ...emptyItem, ...(initial || {}), functionIds: [...(initial?.functionIds || [])] }))
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleFunction = (id) =>
    setForm((f) => ({
      ...f,
      functionIds: f.functionIds.includes(id) ? f.functionIds.filter((x) => x !== id) : [...f.functionIds, id],
    }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      code: form.code.trim(),
      title: form.title.trim(),
      type: form.type,
      frequency: form.frequency,
      month: form.month,
      functionIds: form.functionIds,
      courseId: form.courseId,
      status: form.status,
    })
  }

  return (
    <Modal open title={mode === 'create' ? 'Agregar procedimiento o curso al plan' : 'Editar ítem del plan'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Código" hint="Ej: POE-001, CAP-002">
            <input className={inputCls} value={form.code} onChange={set('code')} placeholder="POE-001" />
          </Field>
          <Field label="Tipo">
            <select className={inputCls} value={form.type} onChange={set('type')}>
              {itemTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className={inputCls} value={form.status} onChange={set('status')}>
              {itemStatuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Título">
          <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Higiene y conducta del personal" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Frecuencia">
            <select className={inputCls} value={form.frequency} onChange={set('frequency')}>
              {frequencies.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Mes planificado">
            <select className={inputCls} value={form.month} onChange={set('month')}>
              {months.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Curso vinculado (opcional)">
            <select className={inputCls} value={form.courseId} onChange={set('courseId')}>
              <option value="">— Sin curso —</option>
              {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Funciones que requieren esta capacitación</span>
          {data.jobFunctions.length === 0 ? (
            <p className="text-sm text-slate-400">Primero definí funciones en la pestaña “Funciones”.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {data.jobFunctions.map((jf) => (
                <label key={jf.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={form.functionIds.includes(jf.id)}
                    onChange={() => toggleFunction(jf.id)}
                  />
                  <span className="truncate text-slate-700">{jf.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{mode === 'create' ? 'Agregar al plan' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function AnnualPlans() {
  const { data, annualPlans, courseById } = useStore()
  const [planModal, setPlanModal] = useState(null) // {mode, item?}
  const [itemModal, setItemModal] = useState(null) // {mode, plan, item?}
  const [toDelete, setToDelete] = useState(null) // {kind:'plan'|'item', plan, item?}

  const frameworkById = (id) => data.frameworks.find((f) => f.id === id)
  const functionById = (id) => data.jobFunctions.find((f) => f.id === id)

  const submitPlan = (payload) => {
    if (planModal.mode === 'create') annualPlans.add({ ...payload, items: [] })
    else annualPlans.update(planModal.item.id, payload)
    setPlanModal(null)
  }

  const submitItem = (payload) => {
    const { plan, mode, item } = itemModal
    const items = mode === 'create'
      ? [...plan.items, { id: uid(), ...payload }]
      : plan.items.map((i) => (i.id === item.id ? { ...i, ...payload } : i))
    annualPlans.update(plan.id, { items })
    setItemModal(null)
  }

  const setItemStatus = (plan, itemId, status) =>
    annualPlans.update(plan.id, {
      items: plan.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
    })

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setPlanModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Nuevo plan anual</Button>
      </div>

      {data.annualPlans.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10 text-slate-300" />}
          title="Todavía no hay planes anuales"
          subtitle="Creá el plan anual de capacitación de tu organización con los procedimientos y cursos requeridos por la normativa aplicable."
          action={<Button onClick={() => setPlanModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Nuevo plan anual</Button>}
        />
      ) : (
        <div className="space-y-6">
          {[...data.annualPlans].sort((a, b) => b.year - a.year).map((plan) => {
            const done = plan.items.filter((i) => i.status === 'Completado').length
            const pct = plan.items.length ? Math.round((done / plan.items.length) * 100) : 0
            return (
              <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="violet">{plan.year}</Badge>
                      <h3 className="font-semibold text-slate-900">{plan.title}</h3>
                      <Badge tone={planTone[plan.status]}>{plan.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {plan.area && <>Área: <span className="font-medium text-slate-700">{plan.area}</span> · </>}
                      {plan.responsible && <>Responsable: <span className="font-medium text-slate-700">{plan.responsible}</span></>}
                    </p>
                    {plan.frameworkIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {plan.frameworkIds.map((id) => {
                          const fw = frameworkById(id)
                          return fw ? <Badge key={id} tone="brand">{fw.code}</Badge> : null
                        })}
                      </div>
                    )}
                  </div>
                  <div className="w-44">
                    <p className="mb-1 text-right text-xs text-slate-500">{done} de {plan.items.length} completados</p>
                    <ProgressBar value={pct} />
                  </div>
                  <RowActions
                    onEdit={() => setPlanModal({ mode: 'edit', item: plan })}
                    onDelete={() => setToDelete({ kind: 'plan', plan })}
                  />
                </div>

                <div className="p-5">
                  {plan.items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                      Sin procedimientos ni cursos cargados. Agregá el primero.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-3 py-2 font-medium">Código</th>
                            <th className="px-3 py-2 font-medium">Capacitación</th>
                            <th className="px-3 py-2 font-medium">Tipo</th>
                            <th className="px-3 py-2 font-medium">Frecuencia</th>
                            <th className="px-3 py-2 font-medium">Mes</th>
                            <th className="px-3 py-2 font-medium">Funciones alcanzadas</th>
                            <th className="px-3 py-2 font-medium">Estado</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {plan.items.map((item) => {
                            const course = item.courseId ? courseById(item.courseId) : null
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/60">
                                <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{item.code || '—'}</td>
                                <td className="px-3 py-2.5">
                                  <p className="font-medium text-slate-800">{item.title}</p>
                                  {course && (
                                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-600">
                                      <BookOpen className="h-3 w-3" /> {course.title}
                                    </p>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-slate-600">{item.type}</td>
                                <td className="px-3 py-2.5 text-slate-600">{item.frequency}</td>
                                <td className="px-3 py-2.5 text-slate-600">{item.month}</td>
                                <td className="px-3 py-2.5">
                                  <div className="flex max-w-52 flex-wrap gap-1">
                                    {item.functionIds.length === 0 && <span className="text-xs text-slate-400">Todas</span>}
                                    {item.functionIds.map((id) => {
                                      const jf = functionById(id)
                                      return jf ? <Badge key={id}>{jf.name}</Badge> : null
                                    })}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <select
                                    value={item.status}
                                    onChange={(e) => setItemStatus(plan, item.id, e.target.value)}
                                    className={`rounded-lg border-0 py-1 pl-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-brand-500/30 ${
                                      { slate: 'bg-slate-100 text-slate-700', blue: 'bg-sky-100 text-sky-700', amber: 'bg-amber-100 text-amber-700', green: 'bg-emerald-100 text-emerald-700', rose: 'bg-rose-100 text-rose-700' }[itemTone[item.status]]
                                    }`}
                                  >
                                    {itemStatuses.map((s) => <option key={s}>{s}</option>)}
                                  </select>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => setItemModal({ mode: 'edit', plan, item })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="Editar"><IconEdit /></button>
                                    <button onClick={() => setToDelete({ kind: 'item', plan, item })} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><IconTrash /></button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Button variant="secondary" onClick={() => setItemModal({ mode: 'create', plan })}>
                      <Plus className="h-4 w-4" /> Agregar procedimiento o curso
                    </Button>
                    {plan.notes && <p className="max-w-xl text-xs text-slate-400">📎 {plan.notes}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {planModal && (
        <PlanFormModal mode={planModal.mode} initial={planModal.item} onClose={() => setPlanModal(null)} onSubmit={submitPlan} />
      )}
      {itemModal && (
        <ItemFormModal mode={itemModal.mode} initial={itemModal.item} onClose={() => setItemModal(null)} onSubmit={submitItem} />
      )}

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.kind === 'plan' ? toDelete.plan.title : toDelete?.item?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete.kind === 'plan') annualPlans.remove(toDelete.plan.id)
          else annualPlans.update(toDelete.plan.id, { items: toDelete.plan.items.filter((i) => i.id !== toDelete.item.id) })
          setToDelete(null)
        }}
      />
    </div>
  )
}
