import { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, IconEdit, IconTrash,
} from '../components/ui.jsx'

const emptyForm = {
  title: '', description: '', category: 'Desarrollo', level: 'Inicial',
  durationHours: 8, modality: 'Online en vivo', instructor: '', status: 'Borrador',
  modules: [],
}

const categories = ['Desarrollo', 'Datos', 'Liderazgo', 'Producto', 'Diseño', 'Idiomas', 'Otro']
const courseLevels = ['Inicial', 'Intermedio', 'Avanzado']
const modalities = ['Online en vivo', 'Autogestionado', 'Presencial', 'Híbrido']
const courseStatuses = ['Borrador', 'Publicado', 'Archivado']

const uid = () => Math.random().toString(36).slice(2, 10)

export default function Courses() {
  const { data, courses } = useStore()
  const [filter, setFilter] = useState('Todos')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newModule, setNewModule] = useState('')

  const filtered = useMemo(
    () => data.courses.filter((c) => filter === 'Todos' || c.status === filter),
    [data.courses, filter],
  )

  const openCreate = () => {
    setForm({ ...emptyForm, modules: [] })
    setNewModule('')
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item, modules: item.modules.map((m) => ({ ...m })) })
    setNewModule('')
    setModal({ mode: 'edit', item })
  }

  const addModule = () => {
    const title = newModule.trim()
    if (!title) return
    setForm((f) => ({ ...f, modules: [...f.modules, { id: uid(), title }] }))
    setNewModule('')
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level,
      durationHours: Number(form.durationHours) || 0,
      modality: form.modality,
      instructor: form.instructor.trim(),
      status: form.status,
      modules: form.modules,
    }
    if (modal.mode === 'create') courses.add({ ...payload, createdAt: new Date().toISOString().slice(0, 10) })
    else courses.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const statusTone = { Publicado: 'green', Borrador: 'amber', Archivado: 'slate' }

  return (
    <div>
      <PageHeader
        title="Cursos"
        subtitle="Creá y gestioná el catálogo formativo de tu empresa."
        action={<Button onClick={openCreate}>+ Crear curso</Button>}
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
          action={<Button onClick={openCreate}>+ Crear curso</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const enrolled = data.enrollments.filter((e) => e.courseId === c.id).length
            return (
              <div key={c.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <Badge tone="brand">{c.category}</Badge>
                  <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                </div>
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>⏱ {c.durationHours} hs</span>
                  <span>📶 {c.level}</span>
                  <span>🖥 {c.modality}</span>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  👤 {c.instructor || 'Sin instructor asignado'} · {c.modules.length} módulos · {enrolled} inscriptos
                </div>
                {c.modules.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    {c.modules.slice(0, 3).map((m, i) => (
                      <li key={m.id} className="truncate">{i + 1}. {m.title}</li>
                    ))}
                    {c.modules.length > 3 && <li className="text-slate-400">+{c.modules.length - 3} módulos más</li>}
                  </ul>
                )}
                <div className="mt-auto flex items-center justify-end gap-1 pt-4">
                  <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" title="Editar"><IconEdit /></button>
                  <button onClick={() => setToDelete(c)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Eliminar"><IconTrash /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Crear curso' : 'Editar curso'}
        onClose={() => setModal(null)}
        wide
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título del curso">
            <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: React Avanzado" />
          </Field>
          <Field label="Descripción">
            <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} placeholder="¿Qué van a aprender los participantes?" />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Categoría">
              <select className={inputCls} value={form.category} onChange={set('category')}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Nivel">
              <select className={inputCls} value={form.level} onChange={set('level')}>
                {courseLevels.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Duración (hs)">
              <input className={inputCls} type="number" min="1" value={form.durationHours} onChange={set('durationHours')} />
            </Field>
            <Field label="Estado">
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {courseStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Modalidad">
              <select className={inputCls} value={form.modality} onChange={set('modality')}>
                {modalities.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Instructor/a">
              <input className={inputCls} value={form.instructor} onChange={set('instructor')} placeholder="Ana Torres" />
            </Field>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Módulos del curso</span>
            {form.modules.length > 0 && (
              <ul className="mb-2 space-y-2">
                {form.modules.map((m, i) => (
                  <li key={m.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="text-xs font-semibold text-slate-400">{i + 1}.</span>
                    <span className="flex-1 truncate">{m.title}</span>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, modules: f.modules.filter((x) => x.id !== m.id) }))}
                      className="text-slate-400 hover:text-rose-600"
                      title="Quitar módulo"
                    >
                      <IconTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addModule() } }}
                placeholder="Ej: Módulo 1 — Introducción"
              />
              <Button type="button" variant="secondary" onClick={addModule}>Agregar</Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Crear curso' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

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
