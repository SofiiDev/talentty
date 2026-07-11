import { useState } from 'react'
import { Plus, FileCheck2, Mail, ClipboardEdit, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, Avatar, RowActions, IconTrash,
} from '../../components/ui.jsx'

const uid = () => Math.random().toString(36).slice(2, 10)
const today = () => new Date().toISOString().slice(0, 10)

const recipientTone = { Pendiente: 'slate', Enviada: 'blue', Aprobada: 'green', Desaprobada: 'rose' }
const LETTERS = 'abcdefghij'

const emptyForm = { title: '', description: '', planId: '', passScore: 70, questions: [], recipients: [] }
const emptyQuestion = { text: '', options: '', correct: 0 }

function buildEmailBody(assessment, talent, planTitle) {
  const lines = [
    `Hola ${talent.name.split(' ')[0]},`,
    '',
    `Te enviamos la evaluación "${assessment.title}" para completar.`,
    assessment.description ? assessment.description : null,
    planTitle ? `Plan de capacitación: ${planTitle}` : null,
    `Puntaje mínimo de aprobación: ${assessment.passScore}%`,
    '',
    'Respondé este correo indicando la opción elegida para cada pregunta:',
    '',
    ...assessment.questions.flatMap((q, i) => [
      `${i + 1}) ${q.text}`,
      ...q.options.map((opt, j) => `   ${LETTERS[j]}. ${opt}`),
      '',
    ]),
    'Gracias,',
    'Equipo de Capacitación — Talentty',
  ].filter((l) => l !== null)
  return lines.join('\n')
}

function AssessmentFormModal({ mode, initial, onClose, onSubmit }) {
  const { data } = useStore()
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initial || {}),
    questions: (initial?.questions || []).map((q) => ({ ...q })),
    recipients: [...(initial?.recipients || [])],
  }))
  const [newQ, setNewQ] = useState(emptyQuestion)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const parsedOptions = newQ.options.split(';').map((o) => o.trim()).filter(Boolean)

  const addQuestion = () => {
    if (!newQ.text.trim() || parsedOptions.length < 2) return
    setForm((f) => ({
      ...f,
      questions: [...f.questions, { id: uid(), text: newQ.text.trim(), options: parsedOptions, correct: Math.min(Number(newQ.correct), parsedOptions.length - 1) }],
    }))
    setNewQ(emptyQuestion)
  }

  const toggleRecipient = (talentId) =>
    setForm((f) => {
      const existing = f.recipients.find((r) => r.talentId === talentId)
      return {
        ...f,
        recipients: existing
          ? f.recipients.filter((r) => r.talentId !== talentId)
          : [...f.recipients, { talentId, status: 'Pendiente', score: null, sentAt: null }],
      }
    })

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      planId: form.planId,
      passScore: Math.max(0, Math.min(100, Number(form.passScore) || 70)),
      questions: form.questions,
      recipients: form.recipients,
    })
  }

  return (
    <Modal open title={mode === 'create' ? 'Crear evaluación' : 'Editar evaluación'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Título de la evaluación">
          <input className={inputCls} required value={form.title} onChange={set('title')} placeholder="Ej: Evaluación BPF básica 2026" />
        </Field>
        <Field label="Descripción">
          <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} placeholder="Objetivo de la evaluación, capacitación asociada…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plan de capacitación vinculado (opcional)">
            <select className={inputCls} value={form.planId} onChange={set('planId')}>
              <option value="">— Sin plan —</option>
              {data.annualPlans.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Field>
          <Field label="Puntaje de aprobación (%)">
            <input className={inputCls} type="number" min="0" max="100" value={form.passScore} onChange={set('passScore')} />
          </Field>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Preguntas</span>
          {form.questions.length > 0 && (
            <ul className="mb-3 space-y-2">
              {form.questions.map((q, i) => (
                <li key={q.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="flex-1 text-slate-700">{i + 1}) {q.text}</span>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, questions: f.questions.filter((x) => x.id !== q.id) }))}
                      className="text-slate-500 hover:text-rose-600"
                      title="Quitar pregunta"
                    >
                      <IconTrash />
                    </button>
                  </div>
                  <ul className="mt-1 space-y-0.5 pl-4 text-xs text-slate-500">
                    {q.options.map((opt, j) => (
                      <li key={j} className={j === q.correct ? 'font-semibold text-emerald-600' : ''}>
                        {LETTERS[j]}. {opt} {j === q.correct && '✓'}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <input
              className={inputCls}
              value={newQ.text}
              onChange={(e) => setNewQ((q) => ({ ...q, text: e.target.value }))}
              placeholder="Texto de la pregunta"
            />
            <input
              className={inputCls}
              value={newQ.options}
              onChange={(e) => setNewQ((q) => ({ ...q, options: e.target.value }))}
              placeholder="Opciones separadas por punto y coma. Ej: Opción A; Opción B; Opción C"
            />
            <div className="flex items-center gap-3">
              <select
                className={`${inputCls} w-auto`}
                value={newQ.correct}
                onChange={(e) => setNewQ((q) => ({ ...q, correct: e.target.value }))}
              >
                {(parsedOptions.length ? parsedOptions : ['—']).map((opt, i) => (
                  <option key={i} value={i}>Correcta: {LETTERS[i]}. {opt.slice(0, 30)}</option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={addQuestion} disabled={!newQ.text.trim() || parsedOptions.length < 2}>
                <Plus className="h-4 w-4" /> Agregar pregunta
              </Button>
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Destinatarios</span>
          <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
            {data.talents.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={form.recipients.some((r) => r.talentId === t.id)}
                  onChange={() => toggleRecipient(t.id)}
                />
                <span className="truncate text-slate-700">{t.name}</span>
                <span className="ml-auto truncate text-xs text-slate-500">{t.email}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{mode === 'create' ? 'Crear evaluación' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function ResultModal({ assessment, recipient, talent, onClose, onSave }) {
  const [score, setScore] = useState(recipient.score ?? '')
  const submit = (e) => {
    e.preventDefault()
    const n = Math.max(0, Math.min(100, Number(score) || 0))
    onSave(n)
  }
  return (
    <Modal open title={`Registrar resultado — ${talent?.name || ''}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Evaluación: <span className="font-medium text-slate-900">{assessment.title}</span> · Aprobación: {assessment.passScore}%
        </p>
        <Field label="Puntaje obtenido (%)">
          <input className={inputCls} required autoFocus type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar resultado</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Assessments() {
  const { data, assessments, talentById } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [resultFor, setResultFor] = useState(null) // {assessment, recipient}
  const [expanded, setExpanded] = useState({})

  const planById = (id) => data.annualPlans.find((p) => p.id === id)

  const submit = (payload) => {
    if (modal.mode === 'create') assessments.add({ ...payload, createdAt: today() })
    else assessments.update(modal.item.id, payload)
    setModal(null)
  }

  const updateRecipient = (assessment, talentId, patch) =>
    assessments.update(assessment.id, {
      recipients: assessment.recipients.map((r) => (r.talentId === talentId ? { ...r, ...patch } : r)),
    })

  const sendEmail = async (assessment, recipient) => {
    const talent = talentById(recipient.talentId)
    if (!talent) return
    const plan = planById(assessment.planId)
    const subject = `Evaluación: ${assessment.title}`
    const body = buildEmailBody(assessment, talent, plan?.title)
    // Usa el email de notificaciones si la persona configuró uno
    const to = talent.notifyEmail || talent.email

    // Primero intenta el envío real por la Netlify Function (Resend);
    // si no está desplegada o configurada, cae al mailto: del navegador.
    try {
      const res = await fetch('/.netlify/functions/send-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text: body }),
      })
      if (res.ok) {
        updateRecipient(assessment, recipient.talentId, { status: 'Enviada', sentAt: today() })
        return
      }
    } catch { /* sin función disponible: fallback */ }

    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self')
    updateRecipient(assessment, recipient.talentId, { status: 'Enviada', sentAt: today() })
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Creá evaluaciones de eficacia, envialas por correo a cada persona y registrá los resultados. Todo queda almacenado acá.
        </p>
        <Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Crear evaluación</Button>
      </div>

      {data.assessments.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="h-10 w-10 text-slate-300" />}
          title="Todavía no hay evaluaciones"
          subtitle="Las evaluaciones permiten verificar la eficacia de la capacitación, un requisito de BPF/GMP."
          action={<Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Crear evaluación</Button>}
        />
      ) : (
        <div className="space-y-5">
          {data.assessments.map((a) => {
            const plan = planById(a.planId)
            const approved = a.recipients.filter((r) => r.status === 'Aprobada').length
            const isOpen = !!expanded[a.id]
            return (
              <div key={a.id} className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    {a.description && <p className="mt-0.5 text-sm text-slate-500">{a.description}</p>}
                    <p className="mt-1 text-xs text-slate-500">
                      {a.questions.length} preguntas · aprobación {a.passScore}% · {approved}/{a.recipients.length} aprobadas
                      {plan && <> · Plan: <span className="font-medium text-slate-600">{plan.title}</span></>}
                      {a.createdAt && <> · Creada el {a.createdAt}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpanded((e) => ({ ...e, [a.id]: !isOpen }))}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600"
                      title={isOpen ? 'Ocultar preguntas' : 'Ver preguntas'}
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <RowActions onEdit={() => setModal({ mode: 'edit', item: a })} onDelete={() => setToDelete(a)} />
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4">
                    <ol className="space-y-3">
                      {a.questions.map((q, i) => (
                        <li key={q.id} className="text-sm">
                          <p className="font-medium text-slate-800">{i + 1}) {q.text}</p>
                          <ul className="mt-1 space-y-0.5 pl-4 text-xs text-slate-500">
                            {q.options.map((opt, j) => (
                              <li key={j} className={j === q.correct ? 'font-semibold text-emerald-600' : ''}>
                                {LETTERS[j]}. {opt} {j === q.correct && '✓ correcta'}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="border-t border-slate-100 px-5 py-4">
                  {a.recipients.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin destinatarios. Editá la evaluación para asignarlos.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {a.recipients.map((r) => {
                        const t = talentById(r.talentId)
                        return (
                          <li key={r.talentId} className="flex flex-wrap items-center gap-3 py-2.5">
                            <Avatar name={t?.name} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{t?.name || 'Perfil eliminado'}</p>
                              <p className="truncate text-xs text-slate-500">{t?.notifyEmail || t?.email}</p>
                            </div>
                            <Badge tone={recipientTone[r.status]}>{r.status}</Badge>
                            {r.score != null && <span className="text-sm font-semibold text-slate-700">{r.score}%</span>}
                            {r.sentAt && <span className="text-xs text-slate-500">Enviada el {r.sentAt}</span>}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => sendEmail(a, r)}
                                disabled={!t}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                title="Abre tu cliente de correo con la evaluación lista para enviar"
                              >
                                <Mail className="h-3.5 w-3.5" /> {r.status === 'Pendiente' ? 'Enviar por correo' : 'Reenviar'}
                              </button>
                              <button
                                onClick={() => setResultFor({ assessment: a, recipient: r })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <ClipboardEdit className="h-3.5 w-3.5" /> Registrar resultado
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <AssessmentFormModal mode={modal.mode} initial={modal.item} onClose={() => setModal(null)} onSubmit={submit} />
      )}

      {resultFor && (
        <ResultModal
          assessment={resultFor.assessment}
          recipient={resultFor.recipient}
          talent={talentById(resultFor.recipient.talentId)}
          onClose={() => setResultFor(null)}
          onSave={(score) => {
            updateRecipient(resultFor.assessment, resultFor.recipient.talentId, {
              score,
              status: score >= resultFor.assessment.passScore ? 'Aprobada' : 'Desaprobada',
            })
            setResultFor(null)
          }}
        />
      )}

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          assessments.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
