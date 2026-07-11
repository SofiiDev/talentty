import { useState } from 'react'
import { Trash2, Plus, FileText, LayoutList } from 'lucide-react'
import { Modal, Button, Field, inputCls } from '../ui.jsx'
import RichTextEditor from '../RichTextEditor.jsx'
import { VideoInput } from '../VideoPlayer.jsx'
import CreatableSelect from '../CreatableSelect.jsx'
import InstructorPicker from '../InstructorPicker.jsx'
import UploadButton from './UploadButton.jsx'

export const categories = ['Calidad', 'Laboratorio', 'Producción', 'Regulatorio', 'Desarrollo', 'Datos', 'Liderazgo', 'Idiomas', 'Otro']
export const courseLevels = ['Inicial', 'Intermedio', 'Avanzado']
export const modalities = ['Online en vivo', 'Autogestionado', 'Presencial', 'Híbrido']
export const courseStatuses = ['Borrador', 'Publicado', 'Archivado']

const uid = () => Math.random().toString(36).slice(2, 10)

export const blankCourse = {
  title: '', description: '', category: 'Calidad', level: 'Inicial',
  durationHours: 8, modality: 'Online en vivo', instructor: '', status: 'Borrador',
  coverImageUrl: '', introVideoUrl: '', attachments: [],
}

export const initCourseForm = (initial) => ({
  ...blankCourse,
  ...(initial || {}),
  attachments: (initial?.attachments || []).map((a) => ({ ...a })),
})

export const buildCoursePayload = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  category: form.category,
  level: form.level,
  durationHours: Number(form.durationHours) || 0,
  modality: form.modality,
  instructor: form.instructor.trim(),
  status: form.status,
  coverImageUrl: form.coverImageUrl.trim(),
  introVideoUrl: form.introVideoUrl.trim(),
  attachments: form.attachments,
})

// Campos de los datos básicos del curso, compartidos entre el modal de alta
// y la pestaña Información del editor de instructor.
export function CourseFields({ form, setForm, showStatus = true }) {
  const [newFile, setNewFile] = useState({ name: '', url: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addFile = () => {
    const name = newFile.name.trim()
    const url = newFile.url.trim()
    if (!name || !url) return
    setForm((f) => ({ ...f, attachments: [...f.attachments, { id: uid(), name, url }] }))
    setNewFile({ name: '', url: '' })
  }

  return (
    <>
      <Field label="Título del curso">
        <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: BPF para personal de planta" />
      </Field>
      <Field label="Descripción" as="div">
        <RichTextEditor
          value={form.description}
          onChange={(html) => setForm((f) => ({ ...f, description: html }))}
          placeholder="¿Qué van a aprender los participantes? Usá títulos, listas y justificado para un temario profesional."
        />
      </Field>
      <div className={`grid grid-cols-2 gap-4 ${showStatus ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Field label="Categoría" as="div">
          <CreatableSelect
            listKey="courseCategories"
            baseOptions={categories}
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            ariaLabel="Categoría"
            createLabel="Crear categoría…"
          />
        </Field>
        <Field label="Nivel" as="div">
          <CreatableSelect
            listKey="courseLevels"
            baseOptions={courseLevels}
            value={form.level}
            onChange={(v) => setForm((f) => ({ ...f, level: v }))}
            ariaLabel="Nivel"
            createLabel="Crear nivel…"
          />
        </Field>
        <Field label="Duración (hs)">
          <input className={inputCls} type="number" min="1" value={form.durationHours} onChange={set('durationHours')} />
        </Field>
        {showStatus && (
          <Field label="Estado">
            <select className={inputCls} value={form.status} onChange={set('status')}>
              {courseStatuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Modalidad" as="div">
          <CreatableSelect
            listKey="courseModalities"
            baseOptions={modalities}
            value={form.modality}
            onChange={(v) => setForm((f) => ({ ...f, modality: v }))}
            ariaLabel="Modalidad"
            createLabel="Crear modalidad…"
          />
        </Field>
        <Field label="Instructor/a" as="div" hint="Los perfiles se gestionan y acreditan en la sección Instructores">
          <InstructorPicker value={form.instructor} onChange={(v) => setForm((f) => ({ ...f, instructor: v }))} />
        </Field>
      </div>

      <Field label="Video introductorio" as="div" hint="Pegá un enlace (YouTube, Vimeo) o subí tu propio archivo de video">
        <VideoInput value={form.introVideoUrl} onChange={(v) => setForm((f) => ({ ...f, introVideoUrl: v }))} />
      </Field>
      <Field label="Imagen de portada (URL)">
        <input className={inputCls} type="url" value={form.coverImageUrl} onChange={set('coverImageUrl')} placeholder="https://…/portada.jpg" />
      </Field>

      {/* Archivos del curso */}
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Archivos del curso (PDF, presentaciones…)</span>
        <p className="mb-2 text-xs text-slate-500">Pegá el enlace al archivo (Drive, Dropbox, intranet o sitio propio) o subilo directamente.</p>
        {form.attachments.length > 0 && (
          <ul className="mb-2 space-y-2">
            {form.attachments.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="flex-1 truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, attachments: f.attachments.filter((x) => x.id !== a.id) }))}
                  className="text-slate-500 hover:text-rose-600"
                  aria-label="Quitar archivo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className={inputCls} value={newFile.name} onChange={(e) => setNewFile((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre. Ej: POE-001 Higiene (PDF)" />
          <input className={inputCls} type="url" value={newFile.url} onChange={(e) => setNewFile((f) => ({ ...f, url: e.target.value }))} placeholder="https://…/archivo.pdf" />
          <Button type="button" variant="secondary" onClick={addFile} disabled={!newFile.name.trim() || !newFile.url.trim()}>
            <Plus className="h-4 w-4" /> Agregar
          </Button>
          <UploadButton
            folder="cursos"
            onUploaded={(url, name) =>
              setForm((f) => ({ ...f, attachments: [...f.attachments, { id: uid(), name, url }] }))}
          />
        </div>
      </div>
    </>
  )
}

// Modal de alta rápida / edición de datos básicos, compartido entre Cursos y Entrenador.
// Montar solo cuando está abierto: el estado inicial se toma de `initial` al montar.
export default function CourseFormModal({ mode, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => initCourseForm(initial))

  const submit = (e) => {
    e.preventDefault()
    onSubmit(buildCoursePayload(form))
  }

  return (
    <Modal open title={mode === 'create' ? 'Dar de alta un curso' : 'Editar curso'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <CourseFields form={form} setForm={setForm} />

        <p className="flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <LayoutList className="mt-0.5 h-4 w-4 shrink-0" />
          El contenido del curso (unidades temáticas, lecciones y exámenes) se gestiona haciendo click en el curso,
          desde la vista de instructor.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{mode === 'create' ? 'Dar de alta' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}
