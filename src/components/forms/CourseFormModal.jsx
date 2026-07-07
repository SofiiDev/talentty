import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal, Button, Field, inputCls } from '../ui.jsx'

export const categories = ['Desarrollo', 'Datos', 'Liderazgo', 'Producto', 'Diseño', 'Idiomas', 'Otro']
export const courseLevels = ['Inicial', 'Intermedio', 'Avanzado']
export const modalities = ['Online en vivo', 'Autogestionado', 'Presencial', 'Híbrido']
export const courseStatuses = ['Borrador', 'Publicado', 'Archivado']

const uid = () => Math.random().toString(36).slice(2, 10)

const blank = {
  title: '', description: '', category: 'Desarrollo', level: 'Inicial',
  durationHours: 8, modality: 'Online en vivo', instructor: '', status: 'Borrador',
  modules: [],
}

// Formulario de alta/edición de cursos, compartido entre Cursos y Entrenador.
// Montar solo cuando está abierto: el estado inicial se toma de `initial` al montar.
export default function CourseFormModal({ mode, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...blank,
    ...(initial || {}),
    modules: (initial?.modules || []).map((m) => ({ ...m })),
  }))
  const [newModule, setNewModule] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addModule = () => {
    const title = newModule.trim()
    if (!title) return
    setForm((f) => ({ ...f, modules: [...f.modules, { id: uid(), title }] }))
    setNewModule('')
  }

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level,
      durationHours: Number(form.durationHours) || 0,
      modality: form.modality,
      instructor: form.instructor.trim(),
      status: form.status,
      modules: form.modules,
    })
  }

  return (
    <Modal open title={mode === 'create' ? 'Dar de alta un curso' : 'Editar curso'} onClose={onClose} wide>
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
                    <Trash2 className="h-4 w-4" />
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
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{mode === 'create' ? 'Dar de alta' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}
