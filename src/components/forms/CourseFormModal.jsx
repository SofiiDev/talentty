import { useState } from 'react'
import { Trash2, Plus, Video, FileText } from 'lucide-react'
import { Modal, Button, Field, inputCls } from '../ui.jsx'

export const categories = ['Calidad', 'Laboratorio', 'Producción', 'Regulatorio', 'Desarrollo', 'Datos', 'Liderazgo', 'Idiomas', 'Otro']
export const courseLevels = ['Inicial', 'Intermedio', 'Avanzado']
export const modalities = ['Online en vivo', 'Autogestionado', 'Presencial', 'Híbrido']
export const courseStatuses = ['Borrador', 'Publicado', 'Archivado']

const uid = () => Math.random().toString(36).slice(2, 10)

const blank = {
  title: '', description: '', category: 'Calidad', level: 'Inicial',
  durationHours: 8, modality: 'Online en vivo', instructor: '', status: 'Borrador',
  coverImageUrl: '', introVideoUrl: '', attachments: [], modules: [],
}

const blankModule = { title: '', description: '', videoUrl: '', fileUrl: '' }

// Formulario de alta/edición de cursos, compartido entre Cursos y Entrenador.
// Montar solo cuando está abierto: el estado inicial se toma de `initial` al montar.
export default function CourseFormModal({ mode, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...blank,
    ...(initial || {}),
    modules: (initial?.modules || []).map((m) => ({ ...blankModule, ...m })),
    attachments: (initial?.attachments || []).map((a) => ({ ...a })),
  }))
  const [newModule, setNewModule] = useState(blankModule)
  const [newFile, setNewFile] = useState({ name: '', url: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setMod = (k) => (e) => setNewModule((m) => ({ ...m, [k]: e.target.value }))

  const addModule = () => {
    const title = newModule.title.trim()
    if (!title) return
    setForm((f) => ({
      ...f,
      modules: [...f.modules, {
        id: uid(),
        title,
        description: newModule.description.trim(),
        videoUrl: newModule.videoUrl.trim(),
        fileUrl: newModule.fileUrl.trim(),
      }],
    }))
    setNewModule(blankModule)
  }

  const addFile = () => {
    const name = newFile.name.trim()
    const url = newFile.url.trim()
    if (!name || !url) return
    setForm((f) => ({ ...f, attachments: [...f.attachments, { id: uid(), name, url }] }))
    setNewFile({ name: '', url: '' })
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
      coverImageUrl: form.coverImageUrl.trim(),
      introVideoUrl: form.introVideoUrl.trim(),
      attachments: form.attachments,
      modules: form.modules,
    })
  }

  return (
    <Modal open title={mode === 'create' ? 'Dar de alta un curso' : 'Editar curso'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Título del curso">
          <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: BPF para personal de planta" />
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Video introductorio (URL)" hint="YouTube, Vimeo o video interno">
            <input className={inputCls} type="url" value={form.introVideoUrl} onChange={set('introVideoUrl')} placeholder="https://youtube.com/…" />
          </Field>
          <Field label="Imagen de portada (URL)">
            <input className={inputCls} type="url" value={form.coverImageUrl} onChange={set('coverImageUrl')} placeholder="https://…/portada.jpg" />
          </Field>
        </div>

        {/* Archivos del curso */}
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Archivos del curso (PDF, presentaciones…)</span>
          <p className="mb-2 text-xs text-slate-500">Pegá el enlace al archivo (Drive, Dropbox, intranet o sitio propio).</p>
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
                    title="Quitar archivo"
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
          </div>
        </div>

        {/* Módulos */}
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Módulos del curso</span>
          {form.modules.length > 0 && (
            <ul className="mb-2 space-y-2">
              {form.modules.map((m, i) => (
                <li key={m.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">{i + 1}.</span>
                    <span className="flex-1 truncate font-medium">{m.title}</span>
                    {m.videoUrl && <Video className="h-3.5 w-3.5 text-sky-500" title="Con video" />}
                    {m.fileUrl && <FileText className="h-3.5 w-3.5 text-amber-500" title="Con archivo" />}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, modules: f.modules.filter((x) => x.id !== m.id) }))}
                      className="text-slate-500 hover:text-rose-600"
                      title="Quitar módulo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {m.description && <p className="mt-0.5 pl-5 text-xs text-slate-500">{m.description}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <input
              className={inputCls}
              value={newModule.title}
              onChange={setMod('title')}
              placeholder="Título del módulo. Ej: Módulo 1 — Introducción a las BPF"
            />
            <input
              className={inputCls}
              value={newModule.description}
              onChange={setMod('description')}
              placeholder="Descripción breve del contenido (opcional)"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className={inputCls} type="url" value={newModule.videoUrl} onChange={setMod('videoUrl')} placeholder="Video del módulo (URL, opcional)" />
              <input className={inputCls} type="url" value={newModule.fileUrl} onChange={setMod('fileUrl')} placeholder="Material PDF (URL, opcional)" />
              <Button type="button" variant="secondary" onClick={addModule} disabled={!newModule.title.trim()}>
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </div>
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
