import { useState } from 'react'
import { Plus, ClipboardList, BookOpen, Users, FileDown, Upload, Calendar, Repeat } from 'lucide-react'
import { useStore } from '../../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, ProgressBar, RowActions, IconEdit, IconTrash, Avatar,
} from '../../components/ui.jsx'
import { exportPlanPdf } from '../../lib/planPdf.js'
import BulkImportModal from '../../components/forms/BulkImportModal.jsx'

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
  status: 'Borrador', frameworkIds: [], participantIds: [], notes: '',
}

const emptyItem = {
  code: '', title: '', type: 'POE / Procedimiento', frequency: 'Anual',
  month: 'Enero', functionIds: [], courseId: '', status: 'Pendiente',
}

function PlanFormModal({ mode, initial, onClose, onSubmit }) {
  const { data } = useStore()
  const [form, setForm] = useState(() => ({
    ...emptyPlan,
    ...(initial || {}),
    frameworkIds: [...(initial?.frameworkIds || [])],
    participantIds: [...(initial?.participantIds || [])],
  }))
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleFramework = (id) =>
    setForm((f) => ({
      ...f,
      frameworkIds: f.frameworkIds.includes(id) ? f.frameworkIds.filter((x) => x !== id) : [...f.frameworkIds, id],
    }))
  const toggleParticipant = (id) =>
    setForm((f) => ({
      ...f,
      participantIds: f.participantIds.includes(id) ? f.participantIds.filter((x) => x !== id) : [...f.participantIds, id],
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
      participantIds: form.participantIds,
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
          <p className="mb-2 text-xs text-slate-500">Configurables desde la pestaña “Marcos normativos”.</p>
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

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Personas incluidas en el plan</span>
          <p className="mb-2 text-xs text-slate-500">También podés sumar personas en bloque con la carga masiva de perfiles.</p>
          {data.talents.length === 0 ? (
            <p className="text-sm text-slate-500">Primero agregá talento a tu organización.</p>
          ) : (
            <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
              {data.talents.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={form.participantIds.includes(t.id)}
                    onChange={() => toggleParticipant(t.id)}
                  />
                  <span className="truncate text-slate-700">{t.name}</span>
                  <span className="ml-auto truncate text-xs text-slate-500">{t.role}</span>
                </label>
              ))}
            </div>
          )}
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
            <p className="text-sm text-slate-500">Primero definí funciones en la pestaña “Funciones”.</p>
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

function PeopleModal({ plan, onClose }) {
  const { data, talentById } = useStore()
  const participants = (plan.participantIds || []).map(talentById).filter(Boolean)
  const functionsOf = (talentId) =>
    data.jobFunctions.filter((jf) => jf.members.includes(talentId)).map((jf) => jf.name)

  return (
    <Modal open title={`Personas del plan — ${plan.year}`} onClose={onClose} wide>
      <p className="mb-4 text-sm text-slate-500">
        {participants.length} persona{participants.length === 1 ? '' : 's'} incluida{participants.length === 1 ? '' : 's'} en <span className="font-medium text-slate-700">{plan.title}</span>
      </p>
      {participants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
          Sin personas asignadas. Editá el plan o usá la carga masiva para incluirlas.
        </p>
      ) : (
        <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {participants.map((t) => {
            const fns = functionsOf(t.id)
            return (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <Avatar name={t.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                  <p className="truncate text-xs text-slate-500">{t.role}{t.department && ` · ${t.department}`}</p>
                </div>
                <div className="flex max-w-56 flex-wrap justify-end gap-1">
                  {fns.length === 0 ? <span className="text-xs text-slate-500">Sin función asignada</span> : fns.map((f) => <Badge key={f} tone="violet">{f}</Badge>)}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  )
}

function ItemDetailModal({ plan, item, onClose }) {
  const { data, talentById, courseById } = useStore()
  const functions = item.functionIds.map((id) => data.jobFunctions.find((f) => f.id === id)).filter(Boolean)
  const course = item.courseId ? courseById(item.courseId) : null

  // Personas alcanzadas: miembros de las funciones del ítem; si no tiene funciones,
  // aplica a todas las personas incluidas en el plan
  const covered = functions.length
    ? [...new Set(functions.flatMap((f) => f.members))].map(talentById).filter(Boolean)
    : (plan.participantIds || []).map(talentById).filter(Boolean)

  return (
    <Modal open title={item.title} onClose={onClose} wide>
      <div className="flex flex-wrap items-center gap-2">
        {item.code && <Badge tone="slate">{item.code}</Badge>}
        <Badge tone="brand">{item.type}</Badge>
        <Badge tone={itemTone[item.status]}>{item.status}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500"><Repeat className="h-3.5 w-3.5" /> Frecuencia</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">{item.frequency}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500"><Calendar className="h-3.5 w-3.5" /> Mes planificado</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">{item.month}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500"><BookOpen className="h-3.5 w-3.5" /> Curso vinculado</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{course ? course.title : '—'}</p>
        </div>
      </div>

      {functions.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Funciones alcanzadas</p>
          <div className="flex flex-wrap gap-1.5">
            {functions.map((f) => <Badge key={f.id} tone="violet">{f.name}</Badge>)}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Users className="h-3.5 w-3.5" /> Personas alcanzadas ({covered.length})
          {!functions.length && <span className="normal-case text-slate-500">— todas las del plan</span>}
        </p>
        {covered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
            Nadie alcanzado todavía: asigná funciones al ítem o personas al plan.
          </p>
        ) : (
          <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-100">
            {covered.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2">
                <Avatar name={t.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                  <p className="truncate text-xs text-slate-500">{t.role}{t.department && ` · ${t.department}`}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  )
}

export default function AnnualPlans() {
  const { data, annualPlans, courseById, talentById } = useStore()
  const [planModal, setPlanModal] = useState(null) // {mode, item?}
  const [itemModal, setItemModal] = useState(null) // {mode, plan, item?}
  const [toDelete, setToDelete] = useState(null) // {kind:'plan'|'item', plan, item?}
  const [peopleFor, setPeopleFor] = useState(null) // plan
  const [detail, setDetail] = useState(null) // {plan, item}
  const [importOpen, setImportOpen] = useState(false)

  const frameworkById = (id) => data.frameworks.find((f) => f.id === id)
  const functionById = (id) => data.jobFunctions.find((f) => f.id === id)

  const exportPdf = (plan) => {
    const ok = exportPlanPdf({
      plan,
      frameworks: plan.frameworkIds.map(frameworkById).filter(Boolean),
      participants: (plan.participantIds || []).map(talentById).filter(Boolean),
      functionNameById: (id) => functionById(id)?.name,
      courseTitleById: (id) => courseById(id)?.title,
    })
    if (!ok) alert('El navegador bloqueó la ventana de exportación. Permití ventanas emergentes para este sitio.')
  }

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
      <div className="mb-5 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Carga masiva de perfiles</Button>
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
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {plan.frameworkIds.map((id) => {
                        const fw = frameworkById(id)
                        return fw ? <Badge key={id} tone="brand">{fw.code}</Badge> : null
                      })}
                      <button
                        onClick={() => setPeopleFor(plan)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                        title="Ver personas incluidas en el plan"
                      >
                        <Users className="h-3.5 w-3.5" /> {(plan.participantIds || []).length} personas
                      </button>
                    </div>
                  </div>
                  <div className="w-44">
                    <p className="mb-1 text-right text-xs text-slate-500">{done} de {plan.items.length} completados</p>
                    <ProgressBar value={pct} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportPdf(plan)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      title="Exportar PDF para presentar ante autoridad (incluye firmas Preparó / Revisó / Autorizó)"
                    >
                      <FileDown className="h-4 w-4" /> Exportar PDF
                    </button>
                    <RowActions
                      onEdit={() => setPlanModal({ mode: 'edit', item: plan })}
                      onDelete={() => setToDelete({ kind: 'plan', plan })}
                    />
                  </div>
                </div>

                <div className="p-5">
                  {plan.items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                      Sin procedimientos ni cursos cargados. Agregá el primero.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-slate-500">
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
                              <tr
                                key={item.id}
                                onClick={() => setDetail({ plan, item })}
                                className="cursor-pointer hover:bg-slate-50/60"
                                title="Ver detalle y personas alcanzadas"
                              >
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
                                    {item.functionIds.length === 0 && <span className="text-xs text-slate-500">Todas</span>}
                                    {item.functionIds.map((id) => {
                                      const jf = functionById(id)
                                      return jf ? <Badge key={id}>{jf.name}</Badge> : null
                                    })}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
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
                                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => setItemModal({ mode: 'edit', plan, item })} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Editar"><IconEdit /></button>
                                    <button onClick={() => setToDelete({ kind: 'item', plan, item })} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><IconTrash /></button>
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
                    {plan.notes && <p className="max-w-xl text-xs text-slate-500">📎 {plan.notes}</p>}
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
      {peopleFor && <PeopleModal plan={peopleFor} onClose={() => setPeopleFor(null)} />}
      {detail && <ItemDetailModal plan={detail.plan} item={detail.item} onClose={() => setDetail(null)} />}
      {importOpen && <BulkImportModal onClose={() => setImportOpen(false)} defaultPlanId={data.annualPlans[0]?.id || ''} />}

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
