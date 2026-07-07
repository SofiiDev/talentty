import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, LayoutList, FileQuestion, CheckSquare, Trash2,
  PlayCircle, FileText, GripVertical, Eye, Pencil, ChevronUp, ChevronDown,
  Info, Save, Rocket, Archive, Undo2, CheckCircle2,
} from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls, Avatar, EmptyState,
} from '../components/ui.jsx'
import { examTotalPoints, finalScoreOf } from '../lib/course.js'
import { CourseFields, initCourseForm, buildCoursePayload } from '../components/forms/CourseFormModal.jsx'
import { statusTone } from './Courses.jsx'

const uid = () => Math.random().toString(36).slice(2, 10)

/* ---------- Información básica ---------- */

function InfoTab({ course, updateCourse }) {
  const [form, setForm] = useState(() => initCourseForm(course))
  const [savedAt, setSavedAt] = useState(null)

  const dirty = JSON.stringify(buildCoursePayload(form)) !== JSON.stringify(buildCoursePayload(initCourseForm(course)))

  const save = (e) => {
    e?.preventDefault()
    updateCourse(buildCoursePayload(form))
    setSavedAt(Date.now())
    setTimeout(() => setSavedAt(null), 2500)
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <CourseFields form={form} setForm={setForm} showStatus={false} />
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {dirty && <Badge tone="amber">Cambios sin guardar</Badge>}
        {savedAt && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Guardado
          </span>
        )}
        <Button type="submit" disabled={!dirty || !form.title.trim()}>
          <Save className="h-4 w-4" /> Guardar cambios
        </Button>
      </div>
    </form>
  )
}

/* ---------- Unidades y lecciones ---------- */

function UnitFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({ title: initial?.title || '', description: initial?.description || '' }))
  return (
    <Modal open title={initial ? 'Editar unidad temática' : 'Nueva unidad temática'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
        <Field label="Título de la unidad">
          <input className={inputCls} required autoFocus value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ej: Unidad 1 — Fundamentos de BPF" />
        </Field>
        <Field label="Descripción">
          <textarea className={inputCls} rows={2} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="¿Qué cubre esta unidad?" />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{initial ? 'Guardar cambios' : 'Crear unidad'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function LessonFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || '', description: initial?.description || '',
    videoUrl: initial?.videoUrl || '', fileUrl: initial?.fileUrl || '',
  }))
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <Modal open title={initial ? 'Editar lección' : 'Nueva lección'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
        <Field label="Título de la lección">
          <input className={inputCls} required autoFocus value={form.title} onChange={set('title')} placeholder="Ej: Higiene y lavado de manos" />
        </Field>
        <Field label="Descripción">
          <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} placeholder="Contenido de la lección" />
        </Field>
        <Field label="Video (URL)" hint="YouTube, Vimeo o video interno">
          <input className={inputCls} type="url" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://youtube.com/…" />
        </Field>
        <Field label="Material (URL)" hint="PDF, presentación o documento (Drive, Dropbox, intranet)">
          <input className={inputCls} type="url" value={form.fileUrl} onChange={set('fileUrl')} placeholder="https://…/material.pdf" />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{initial ? 'Guardar cambios' : 'Agregar lección'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function ContentTab({ course, updateCourse }) {
  const [unitModal, setUnitModal] = useState(null) // {unit?} | 'new'
  const [lessonModal, setLessonModal] = useState(null) // {unitId, lesson?}
  const [toDelete, setToDelete] = useState(null) // {kind, unitId, lesson?}

  const units = course.units || []
  const setUnits = (next) => updateCourse({ units: next })

  const moveUnit = (index, delta) => {
    const next = [...units]
    const [u] = next.splice(index, 1)
    next.splice(index + delta, 0, u)
    setUnits(next)
  }

  const submitUnit = (form) => {
    if (unitModal === 'new') {
      setUnits([...units, { id: uid(), title: form.title.trim(), description: form.description.trim(), lessons: [] }])
    } else {
      setUnits(units.map((u) => (u.id === unitModal.unit.id ? { ...u, title: form.title.trim(), description: form.description.trim() } : u)))
    }
    setUnitModal(null)
  }

  const submitLesson = (form) => {
    const lesson = {
      title: form.title.trim(), description: form.description.trim(),
      videoUrl: form.videoUrl.trim(), fileUrl: form.fileUrl.trim(),
    }
    setUnits(units.map((u) => {
      if (u.id !== lessonModal.unitId) return u
      return lessonModal.lesson
        ? { ...u, lessons: u.lessons.map((l) => (l.id === lessonModal.lesson.id ? { ...l, ...lesson } : l)) }
        : { ...u, lessons: [...u.lessons, { id: uid(), ...lesson }] }
    }))
    setLessonModal(null)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Organizá el curso en unidades temáticas y cargá lecciones con video y material en cada una.</p>
        <Button onClick={() => setUnitModal('new')}><Plus className="h-4 w-4" /> Nueva unidad</Button>
      </div>

      {units.length === 0 ? (
        <EmptyState
          icon={<LayoutList className="h-10 w-10 text-slate-300" />}
          title="Este curso todavía no tiene unidades"
          subtitle="Creá la primera unidad temática para empezar a estructurar el contenido."
          action={<Button onClick={() => setUnitModal('new')}><Plus className="h-4 w-4" /> Nueva unidad</Button>}
        />
      ) : (
        <div className="space-y-5">
          {units.map((u, i) => (
            <section key={u.id} className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-start gap-3 border-b border-slate-100 p-4">
                <span className="mt-1 flex flex-col text-slate-300">
                  <button onClick={() => moveUnit(i, -1)} disabled={i === 0} className="disabled:opacity-30 hover:text-slate-600" aria-label="Subir unidad"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => moveUnit(i, 1)} disabled={i === units.length - 1} className="disabled:opacity-30 hover:text-slate-600" aria-label="Bajar unidad"><ChevronDown className="h-4 w-4" /></button>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Unidad {i + 1}</p>
                  <h3 className="font-semibold text-slate-900">{u.title}</h3>
                  {u.description && <p className="mt-0.5 text-sm text-slate-500">{u.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setUnitModal({ unit: u })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label="Editar unidad"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setToDelete({ kind: 'unit', unitId: u.id, name: u.title })} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar unidad"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="p-4">
                {u.lessons.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-sm text-slate-500">Sin lecciones en esta unidad.</p>
                ) : (
                  <ul className="space-y-2">
                    {u.lessons.map((l, j) => (
                      <li key={l.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                        <GripVertical className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{i + 1}.{j + 1} {l.title}</p>
                          {l.description && <p className="truncate text-xs text-slate-500">{l.description}</p>}
                        </div>
                        {l.videoUrl && <PlayCircle className="h-4 w-4 shrink-0 text-sky-500" title="Incluye video" />}
                        {l.fileUrl && <FileText className="h-4 w-4 shrink-0 text-amber-500" title="Incluye material" />}
                        <button onClick={() => setLessonModal({ unitId: u.id, lesson: l })} className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-brand-600" aria-label="Editar lección"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setToDelete({ kind: 'lesson', unitId: u.id, lesson: l, name: l.title })} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar lección"><Trash2 className="h-4 w-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="secondary" className="mt-3" onClick={() => setLessonModal({ unitId: u.id })}>
                  <Plus className="h-4 w-4" /> Agregar lección
                </Button>
              </div>
            </section>
          ))}
        </div>
      )}

      {unitModal && (
        <UnitFormModal initial={unitModal === 'new' ? null : unitModal.unit} onClose={() => setUnitModal(null)} onSubmit={submitUnit} />
      )}
      {lessonModal && (
        <LessonFormModal initial={lessonModal.lesson} onClose={() => setLessonModal(null)} onSubmit={submitLesson} />
      )}
      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.name}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete.kind === 'unit') setUnits(units.filter((u) => u.id !== toDelete.unitId))
          else setUnits(units.map((u) => (u.id === toDelete.unitId ? { ...u, lessons: u.lessons.filter((l) => l.id !== toDelete.lesson.id) } : u)))
          setToDelete(null)
        }}
      />
    </div>
  )
}

/* ---------- Exámenes ---------- */

const blankQuestion = { type: 'multiple', text: '', options: '', correct: 0, points: 10 }

function ExamFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || '', description: initial?.description || '',
    passScore: initial?.passScore ?? 70,
    questions: (initial?.questions || []).map((q) => ({ ...q })),
  }))
  const [newQ, setNewQ] = useState(blankQuestion)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const parsedOptions = newQ.options.split(';').map((o) => o.trim()).filter(Boolean)
  const canAdd = newQ.text.trim() && (newQ.type === 'abierta' || parsedOptions.length >= 2)

  const addQuestion = () => {
    if (!canAdd) return
    const base = { id: uid(), type: newQ.type, text: newQ.text.trim(), points: Number(newQ.points) || 10 }
    setForm((f) => ({
      ...f,
      questions: [...f.questions, newQ.type === 'multiple'
        ? { ...base, options: parsedOptions, correct: Math.min(Number(newQ.correct), parsedOptions.length - 1) }
        : base],
    }))
    setNewQ(blankQuestion)
  }

  const totalPoints = form.questions.reduce((a, q) => a + (Number(q.points) || 0), 0)

  return (
    <Modal open title={initial ? 'Editar examen' : 'Crear examen'} onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, passScore: Math.max(0, Math.min(100, Number(form.passScore) || 70)) }) }} className="space-y-4">
        <Field label="Título del examen">
          <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Examen final — BPF" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Descripción">
              <input className={inputCls} value={form.description} onChange={set('description')} placeholder="Instrucciones para el participante" />
            </Field>
          </div>
          <Field label="Aprobación (%)">
            <input className={inputCls} type="number" min="0" max="100" value={form.passScore} onChange={set('passScore')} />
          </Field>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Preguntas ({form.questions.length})</span>
            <span className="text-xs text-slate-500">Puntaje total: {totalPoints} pts</span>
          </div>
          {form.questions.length > 0 && (
            <ul className="mb-3 space-y-2">
              {form.questions.map((q, i) => (
                <li key={q.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="flex-1 text-slate-700">{i + 1}) {q.text}</span>
                    <Badge tone={q.type === 'multiple' ? 'blue' : 'violet'}>
                      {q.type === 'multiple' ? 'Automática' : 'Manual'}
                    </Badge>
                    <Badge>{q.points} pts</Badge>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, questions: f.questions.filter((x) => x.id !== q.id) }))}
                      className="text-slate-500 hover:text-rose-600" aria-label="Quitar pregunta">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {q.type === 'multiple' && (
                    <ul className="mt-1 space-y-0.5 pl-4 text-xs text-slate-500">
                      {q.options.map((opt, j) => (
                        <li key={j} className={j === q.correct ? 'font-semibold text-emerald-600' : ''}>{String.fromCharCode(97 + j)}. {opt} {j === q.correct && '✓'}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <select className={`${inputCls} sm:w-56`} value={newQ.type} onChange={(e) => setNewQ((q) => ({ ...q, type: e.target.value }))} aria-label="Tipo de pregunta">
                <option value="multiple">Opción múltiple (corrección automática)</option>
                <option value="abierta">Pregunta abierta (corrección manual)</option>
              </select>
              <input className={`${inputCls} sm:w-28`} type="number" min="1" value={newQ.points}
                onChange={(e) => setNewQ((q) => ({ ...q, points: e.target.value }))} aria-label="Puntos" placeholder="Puntos" />
            </div>
            <input className={inputCls} value={newQ.text} onChange={(e) => setNewQ((q) => ({ ...q, text: e.target.value }))} placeholder="Texto de la pregunta" />
            {newQ.type === 'multiple' && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input className={inputCls} value={newQ.options}
                  onChange={(e) => setNewQ((q) => ({ ...q, options: e.target.value }))}
                  placeholder="Opciones separadas por punto y coma. Ej: Opción A; Opción B; Opción C" />
                <select className={`${inputCls} sm:w-64`} value={newQ.correct} onChange={(e) => setNewQ((q) => ({ ...q, correct: e.target.value }))} aria-label="Respuesta correcta">
                  {(parsedOptions.length ? parsedOptions : ['—']).map((opt, i) => (
                    <option key={i} value={i}>Correcta: {String.fromCharCode(97 + i)}. {opt.slice(0, 28)}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={addQuestion} disabled={!canAdd}>
                <Plus className="h-4 w-4" /> Agregar pregunta
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={form.questions.length === 0}>{initial ? 'Guardar cambios' : 'Crear examen'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function ExamsTab({ course }) {
  const { data, exams } = useStore()
  const [modal, setModal] = useState(null) // 'new' | {exam}
  const [toDelete, setToDelete] = useState(null)

  const courseExams = data.exams.filter((e) => e.courseId === course.id)

  const submit = (form) => {
    if (modal === 'new') {
      exams.add({ courseId: course.id, ...form, attempts: [] })
    } else {
      exams.update(modal.exam.id, form)
    }
    setModal(null)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Los participantes rinden el examen desde la vista del curso. Las preguntas de opción múltiple se corrigen solas;
          las abiertas quedan pendientes en la pestaña “Correcciones”.
        </p>
        <Button onClick={() => setModal('new')}><Plus className="h-4 w-4" /> Crear examen</Button>
      </div>

      {courseExams.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="h-10 w-10 text-slate-300" />}
          title="Este curso no tiene exámenes"
          subtitle="Creá un examen con preguntas de corrección automática y/o manual."
          action={<Button onClick={() => setModal('new')}><Plus className="h-4 w-4" /> Crear examen</Button>}
        />
      ) : (
        <div className="space-y-4">
          {courseExams.map((exam) => {
            const auto = exam.questions.filter((q) => q.type === 'multiple').length
            const open = exam.questions.length - auto
            const pending = (exam.attempts || []).filter((a) => a.status === 'Pendiente de corrección').length
            return (
              <div key={exam.id} className="flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <FileQuestion className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{exam.title}</h3>
                  {exam.description && <p className="mt-0.5 text-sm text-slate-500">{exam.description}</p>}
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{exam.questions.length} preguntas ({auto} automáticas · {open} manuales)</span>
                    <span>{examTotalPoints(exam)} pts totales</span>
                    <span>Aprobación: {exam.passScore}%</span>
                    <span>{(exam.attempts || []).length} intentos</span>
                    {pending > 0 && <Badge tone="amber">{pending} por corregir</Badge>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModal({ exam })} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label="Editar examen"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setToDelete(exam)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Eliminar examen"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && <ExamFormModal initial={modal === 'new' ? null : modal.exam} onClose={() => setModal(null)} onSubmit={submit} />}
      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => { exams.remove(toDelete.id); setToDelete(null) }}
      />
    </div>
  )
}

/* ---------- Correcciones ---------- */

function GradingTab({ course }) {
  const { data, exams, talentById } = useStore()
  const [scores, setScores] = useState({}) // {attemptId: {qId: value}}

  const courseExams = data.exams.filter((e) => e.courseId === course.id)
  const items = courseExams.flatMap((exam) =>
    (exam.attempts || []).map((attempt) => ({ exam, attempt })),
  ).sort((a, b) => (a.attempt.status === 'Pendiente de corrección' ? -1 : 1))

  const saveGrade = (exam, attempt) => {
    const manualScores = {}
    for (const q of exam.questions) {
      if (q.type !== 'abierta') continue
      const raw = scores[attempt.id]?.[q.id]
      manualScores[q.id] = Math.max(0, Math.min(Number(q.points), Number(raw) || 0))
    }
    const graded = { ...attempt, manualScores, status: 'Corregido' }
    const finalScore = finalScoreOf(exam, graded)
    exams.update(exam.id, {
      attempts: exam.attempts.map((a) =>
        a.id === attempt.id ? { ...graded, finalScore, passed: finalScore >= exam.passScore } : a,
      ),
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="h-10 w-10 text-slate-300" />}
        title="No hay intentos para corregir"
        subtitle="Cuando los participantes rindan los exámenes del curso, sus respuestas aparecen acá."
      />
    )
  }

  return (
    <div className="space-y-5">
      {items.map(({ exam, attempt }) => {
        const talent = talentById(attempt.talentId)
        const pending = attempt.status === 'Pendiente de corrección'
        return (
          <div key={attempt.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar name={talent?.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{talent?.name || 'Perfil eliminado'}</p>
                <p className="text-xs text-slate-500">{exam.title} · Rendido el {attempt.submittedAt}</p>
              </div>
              {pending
                ? <Badge tone="amber">Pendiente de corrección</Badge>
                : <Badge tone={attempt.passed ? 'green' : 'rose'}>{attempt.passed ? 'Aprobado' : 'Desaprobado'} · {attempt.finalScore}%</Badge>}
            </div>

            <div className="mt-4 space-y-3">
              {exam.questions.map((q, i) => {
                const answer = attempt.answers?.[q.id]
                if (q.type === 'multiple') {
                  const ok = Number(answer) === q.correct
                  return (
                    <div key={q.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="font-medium text-slate-800">{i + 1}) {q.text} <span className="text-xs text-slate-500">({q.points} pts · automática)</span></p>
                      <p className={`mt-1 text-xs font-medium ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Respuesta: {q.options[Number(answer)] ?? 'Sin responder'} {ok ? `✓ correcta (+${q.points} pts)` : `✗ incorrecta (correcta: ${q.options[q.correct]})`}
                      </p>
                    </div>
                  )
                }
                return (
                  <div key={q.id} className="rounded-xl border border-violet-100 bg-violet-50/40 p-3 text-sm">
                    <p className="font-medium text-slate-800">{i + 1}) {q.text} <span className="text-xs text-slate-500">({q.points} pts · corrección manual)</span></p>
                    <p className="mt-1.5 rounded-lg bg-white p-2.5 text-sm text-slate-700">{answer || 'Sin responder'}</p>
                    {pending ? (
                      <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                        Puntos otorgados (0–{q.points}):
                        <input
                          type="number" min="0" max={q.points}
                          className={`${inputCls} w-24 py-1`}
                          value={scores[attempt.id]?.[q.id] ?? ''}
                          onChange={(e) => setScores((s) => ({ ...s, [attempt.id]: { ...s[attempt.id], [q.id]: e.target.value } }))}
                        />
                      </label>
                    ) : (
                      <p className="mt-1.5 text-xs font-medium text-slate-600">Puntos otorgados: {attempt.manualScores?.[q.id] ?? 0} / {q.points}</p>
                    )}
                  </div>
                )
              })}
            </div>

            {pending && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">Corrección automática parcial: {attempt.autoScore} / {examTotalPoints(exam)} pts</p>
                <Button onClick={() => saveGrade(exam, attempt)}>
                  <CheckSquare className="h-4 w-4" /> Guardar corrección
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Página ---------- */

export default function CourseEditor() {
  const { courseId } = useParams()
  const { data, courses, courseById } = useStore()
  const course = courseById(courseId)
  const [tab, setTab] = useState('contenido')

  if (!course) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Este curso ya no existe.</p>
        <Link to="/app/cursos" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a cursos
        </Link>
      </div>
    )
  }

  const updateCourse = (patch) => courses.update(course.id, patch)
  const pendingCount = data.exams
    .filter((e) => e.courseId === course.id)
    .reduce((a, e) => a + (e.attempts || []).filter((at) => at.status === 'Pendiente de corrección').length, 0)

  const tabs = [
    { key: 'informacion', label: 'Información', Icon: Info },
    { key: 'contenido', label: 'Contenido', Icon: LayoutList },
    { key: 'examenes', label: 'Exámenes', Icon: FileQuestion },
    { key: 'correcciones', label: pendingCount > 0 ? `Correcciones (${pendingCount})` : 'Correcciones', Icon: CheckSquare },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/cursos" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a cursos
        </Link>
        <Link to={`/app/cursos/${course.id}/vista`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">
          <Eye className="h-3.5 w-3.5" /> Vista del participante
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Editor de curso · Vista de instructor</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone[course.status] || 'slate'}>{course.status}</Badge>
            <span className="text-sm text-slate-500">{course.category} · {course.level} · {course.instructor || 'Sin instructor'}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {course.status !== 'Publicado' && (
            <Button onClick={() => updateCourse({ status: 'Publicado' })}>
              <Rocket className="h-4 w-4" /> Publicar curso
            </Button>
          )}
          {course.status === 'Publicado' && (
            <Button variant="secondary" onClick={() => updateCourse({ status: 'Borrador' })}>
              <Undo2 className="h-4 w-4" /> Pasar a borrador
            </Button>
          )}
          {course.status !== 'Archivado' && (
            <Button variant="ghost" onClick={() => updateCourse({ status: 'Archivado' })}>
              <Archive className="h-4 w-4" /> Archivar
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'informacion' && <InfoTab key={course.id + course.status} course={course} updateCourse={updateCourse} />}
      {tab === 'contenido' && <ContentTab course={course} updateCourse={updateCourse} />}
      {tab === 'examenes' && <ExamsTab course={course} />}
      {tab === 'correcciones' && <GradingTab course={course} />}
    </div>
  )
}
