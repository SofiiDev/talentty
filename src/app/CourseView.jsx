import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, SignalHigh, MonitorSmartphone, User, PlayCircle,
  FileText, CheckCircle2, Circle, ExternalLink, Eye, Award, Star,
  MessageCircle, Send, FileDown,
} from 'lucide-react'
import { useStore } from '../store.jsx'
import { Badge, Button, Avatar, ProgressBar, inputCls, Field } from '../components/ui.jsx'
import { platformMeta } from '../lib/video.jsx'
import { exportCertificate } from '../lib/certificatePdf.js'
import { RatingStars } from './Courses.jsx'
import { Modal } from '../components/ui.jsx'
import { FileQuestion, CalendarClock, BadgeCheck } from 'lucide-react'
import { courseLessons, autoGrade, hasOpenQuestions, finalScoreOf, latestAttempt, examTotalPoints } from '../lib/course.js'
import VideoPlayer from '../components/VideoPlayer.jsx'
import { RichText, stripHtml } from '../components/RichTextEditor.jsx'
import { fmtDate, fmtDateTime, nowIso, isOverdue } from '../lib/format.js'

function ExamTakeModal({ exam, viewerId, onClose }) {
  const { exams } = useStore()
  const [answers, setAnswers] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const autoScore = autoGrade(exam, answers)
    const open = hasOpenQuestions(exam)
    const attempt = {
      id: Math.random().toString(36).slice(2, 10),
      talentId: viewerId,
      submittedAt: nowIso(),
      answers,
      autoScore,
      manualScores: {},
      status: open ? 'Pendiente de corrección' : 'Corregido',
      finalScore: null,
      passed: null,
    }
    if (!open) {
      attempt.finalScore = finalScoreOf(exam, attempt)
      attempt.passed = attempt.finalScore >= exam.passScore
    }
    exams.update(exam.id, { attempts: [...(exam.attempts || []), attempt] })
    onClose()
  }

  return (
    <Modal open title={exam.title} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        {exam.description && <p className="text-sm text-slate-600">{exam.description}</p>}
        <p className="text-xs text-slate-500">Aprobación: {exam.passScore}% · Puntaje total: {examTotalPoints(exam)} pts</p>
        {exam.questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium text-slate-800">
              {i + 1}) {q.text} <span className="text-xs font-normal text-slate-500">({q.points} pts)</span>
            </legend>
            {q.type === 'multiple' ? (
              <div className="mt-2 space-y-1.5">
                {q.options.map((opt, j) => (
                  <label key={j} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="radio"
                      name={q.id}
                      required
                      className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={Number(answers[q.id]) === j && answers[q.id] !== undefined}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: j }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className={`${inputCls} mt-2`}
                rows={3}
                required
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Escribí tu respuesta…"
              />
            )}
          </fieldset>
        ))}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Entregar examen</Button>
        </div>
      </form>
    </Modal>
  )
}

function ExamRow({ exam, viewerId }) {
  const [taking, setTaking] = useState(false)
  const attempt = latestAttempt(exam, viewerId)
  const pending = attempt?.status === 'Pendiente de corrección'
  const overdue = isOverdue(exam.dueDate)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <FileQuestion className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
          <span>{exam.questions.length} preguntas · aprobación {exam.passScore}%</span>
          {exam.dueDate && (
            <span className={`inline-flex items-center gap-1 ${overdue ? 'font-semibold text-rose-600' : ''}`}>
              <CalendarClock className="h-3.5 w-3.5" /> Fecha límite: {fmtDate(exam.dueDate)}{overdue && ' (vencida)'}
            </span>
          )}
          {attempt && <span>Entregado el {fmtDateTime(attempt.submittedAt)}</span>}
        </p>
      </div>
      {attempt ? (
        pending ? (
          <Badge tone="amber">Entregado · pendiente de corrección manual</Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge tone={attempt.passed ? 'green' : 'rose'}>
              {attempt.passed ? 'Aprobado' : 'Desaprobado'} · {attempt.finalScore}%
            </Badge>
            {!attempt.passed && !overdue && (
              <Button variant="secondary" onClick={() => setTaking(true)}>Reintentar</Button>
            )}
          </div>
        )
      ) : overdue ? (
        <Badge tone="rose">Plazo vencido · no se puede rendir</Badge>
      ) : (
        <Button onClick={() => setTaking(true)}>Rendir examen</Button>
      )}
      {taking && <ExamTakeModal exam={exam} viewerId={viewerId} onClose={() => setTaking(false)} />}
    </div>
  )
}

export default function CourseView() {
  const { courseId } = useParams()
  const { data, courseById, enrollments, reviews, courseQuestions, talentById } = useStore()
  const course = courseById(courseId)
  const [viewerId, setViewerId] = useState(data.talents[0]?.id || '')
  const [openModule, setOpenModule] = useState(null)
  const [reviewForm, setReviewForm] = useState(null) // {rating, comment}
  const [newQuestion, setNewQuestion] = useState('')
  const [replyFor, setReplyFor] = useState(null) // questionId
  const [replyText, setReplyText] = useState('')

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

  const viewer = data.talents.find((t) => t.id === viewerId)
  const enrollment = data.enrollments.find((e) => e.talentId === viewerId && e.courseId === course.id)
  const completed = enrollment?.completedModules || []
  const units = course.units || []
  const lessons = courseLessons(course)
  const total = lessons.length
  const doneCount = lessons.filter((l) => completed.includes(l.id)).length
  const progress = total ? Math.round((doneCount / total) * 100) : (enrollment?.progress || 0)
  const courseExams = (data.exams || []).filter((e) => e.courseId === course.id)

  const linkedSeminars = data.seminars
    .filter((s) => s.courseId === course.id && s.status !== 'Cancelado' && s.status !== 'Finalizado')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))

  const courseReviews = (data.reviews || []).filter((r) => r.courseId === course.id)
  const avgRating = courseReviews.length
    ? courseReviews.reduce((a, r) => a + r.rating, 0) / courseReviews.length
    : 0
  const myReview = courseReviews.find((r) => r.talentId === viewerId)
  const questions = (data.courseQuestions || []).filter((q) => q.courseId === course.id)

  const submitReview = (e) => {
    e.preventDefault()
    const payload = {
      courseId: course.id,
      talentId: viewerId,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    if (myReview) reviews.update(myReview.id, payload)
    else reviews.add(payload)
    setReviewForm(null)
  }

  const askQuestion = (e) => {
    e.preventDefault()
    const text = newQuestion.trim()
    if (!text) return
    courseQuestions.add({
      courseId: course.id, talentId: viewerId, text,
      createdAt: new Date().toISOString().slice(0, 10), answers: [],
    })
    setNewQuestion('')
  }

  const sendReply = (q) => {
    const text = replyText.trim()
    if (!text) return
    courseQuestions.update(q.id, {
      answers: [...q.answers, {
        id: Math.random().toString(36).slice(2, 10),
        talentId: viewerId, text, createdAt: new Date().toISOString().slice(0, 10),
      }],
    })
    setReplyFor(null)
    setReplyText('')
  }

  const enroll = () => {
    enrollments.add({
      talentId: viewerId,
      courseId: course.id,
      progress: 0,
      status: 'En curso',
      completedModules: [],
      enrolledAt: new Date().toISOString().slice(0, 10),
    })
  }

  const toggleLesson = (lessonId) => {
    const next = completed.includes(lessonId)
      ? completed.filter((id) => id !== lessonId)
      : [...completed, lessonId]
    const nextDone = lessons.filter((l) => next.includes(l.id)).length
    const nextProgress = total ? Math.round((nextDone / total) * 100) : 0
    const patch = {
      completedModules: next,
      progress: nextProgress,
      status: nextProgress >= 100 ? 'Completado' : 'En curso',
      // Timestamp de finalización: se registra al llegar al 100% y se limpia si retrocede
      completedAt: nextProgress >= 100 ? (enrollment?.completedAt || nowIso()) : null,
    }
    if (enrollment) enrollments.update(enrollment.id, patch)
    else enrollments.add({
      talentId: viewerId, courseId: course.id, ...patch,
      enrolledAt: new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <div>
      {/* Barra superior */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/cursos" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Volver a cursos
        </Link>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <Eye className="h-4 w-4" /> Viendo como:
          <select className={`${inputCls} w-auto py-1.5`} value={viewerId} onChange={(e) => setViewerId(e.target.value)}>
            {data.talents.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {/* Hero del curso */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {course.coverImageUrl ? (
          <img src={course.coverImageUrl} alt="" className="h-44 w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <div className="h-24 bg-gradient-to-r from-brand-700 via-brand-600 to-sky-600" />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{course.category}</Badge>
            <Badge tone="violet">{course.level}</Badge>
            <Badge tone={course.status === 'Publicado' ? 'green' : 'amber'}>{course.status}</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{course.title}</h1>
          {courseReviews.length > 0 && <div className="mt-1.5"><RatingStars value={avgRating} count={courseReviews.length} /></div>}
          <RichText html={course.description} className="mt-2 max-w-3xl text-slate-600" />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> {course.instructor || 'Sin instructor'}
              {data.instructors?.find((i) => i.name === course.instructor)?.verified && (
                <span className="inline-flex items-center gap-0.5 text-emerald-600" title="Instructor acreditado">
                  <BadgeCheck className="h-4 w-4" />
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.durationHours} horas</span>
            <span className="inline-flex items-center gap-1.5"><SignalHigh className="h-4 w-4" /> {course.level}</span>
            <span className="inline-flex items-center gap-1.5"><MonitorSmartphone className="h-4 w-4" /> {course.modality}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {course.introVideoUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-900">Video introductorio</h2>
              <VideoPlayer url={course.introVideoUrl} title={`Intro — ${course.title}`} />
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 font-semibold text-slate-900">Contenido del curso</h2>
            <p className="mb-4 text-sm text-slate-500">{units.length} unidades temáticas · {total} lecciones · marcá cada lección al completarla</p>
            {total === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                Este curso todavía no tiene contenido cargado.
              </p>
            ) : (
              <div className="space-y-5">
                {units.map((u, ui) => (
                  <div key={u.id}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Unidad {ui + 1}</p>
                    <h3 className="font-semibold text-slate-900">{u.title}</h3>
                    {u.description && <p className="mt-0.5 text-sm text-slate-500">{u.description}</p>}
                    <ol className="mt-3 space-y-2">
                      {u.lessons.map((m, i) => {
                        const isDone = completed.includes(m.id)
                        const isOpen = openModule === m.id
                        return (
                          <li key={m.id} className={`rounded-xl border ${isDone ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'}`}>
                            <div className="flex items-center gap-3 p-3">
                              <button
                                onClick={() => toggleLesson(m.id)}
                                className={isDone ? 'text-emerald-500' : 'text-slate-300 hover:text-brand-500'}
                                title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                              >
                                {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                              </button>
                              <button className="min-w-0 flex-1 text-left" onClick={() => setOpenModule(isOpen ? null : m.id)}>
                                <p className={`text-sm font-medium ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                  {ui + 1}.{i + 1} {m.title}
                                </p>
                                {m.description && !isOpen && <p className="truncate text-xs text-slate-500">{stripHtml(m.description)}</p>}
                              </button>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                {m.videoUrl && <PlayCircle className="h-4 w-4 text-sky-500" title="Incluye video" />}
                                {m.fileUrl && <FileText className="h-4 w-4 text-amber-500" title="Incluye material" />}
                              </div>
                            </div>
                            {isOpen && (
                              <div className="space-y-3 border-t border-slate-100 p-4">
                                {m.description && <RichText html={m.description} className="text-sm text-slate-600" />}
                                {m.videoUrl && <VideoPlayer url={m.videoUrl} title={m.title} />}
                                {m.fileUrl && (
                                  <a href={m.fileUrl} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100">
                                    <FileText className="h-4 w-4" /> Descargar material de la lección
                                  </a>
                                )}
                                {!m.description && !m.videoUrl && !m.fileUrl && (
                                  <p className="text-sm text-slate-500">Esta lección no tiene contenido adicional.</p>
                                )}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Exámenes */}
          {courseExams.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-1 font-semibold text-slate-900">Exámenes</h2>
              <p className="mb-4 text-sm text-slate-500">
                Las preguntas de opción múltiple se corrigen automáticamente; las abiertas las corrige el instructor.
              </p>
              <div className="space-y-3">
                {courseExams.map((exam) => (
                  <ExamRow key={exam.id} exam={exam} viewerId={viewerId} />
                ))}
              </div>
            </section>
          )}

          {/* Reseñas */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Reseñas</h2>
                {courseReviews.length > 0
                  ? <RatingStars value={avgRating} count={courseReviews.length} />
                  : <p className="text-sm text-slate-500">Este curso todavía no tiene reseñas.</p>}
              </div>
              <Button
                variant="secondary"
                onClick={() => setReviewForm(myReview ? { rating: myReview.rating, comment: myReview.comment } : { rating: 5, comment: '' })}
              >
                <Star className="h-4 w-4" /> {myReview ? 'Editar mi reseña' : 'Dejar una reseña'}
              </Button>
            </div>

            {reviewForm && (
              <form onSubmit={submitReview} className="mb-5 space-y-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
                <div>
                  <span className="mb-1 block text-sm font-medium text-slate-700">Tu puntuación</span>
                  <div className="flex gap-1" role="radiogroup" aria-label="Puntuación de 1 a 5 estrellas">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={Number(reviewForm.rating) === n}
                        aria-label={`${n} estrella${n === 1 ? '' : 's'}`}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                      >
                        <Star className={`h-7 w-7 ${n <= Number(reviewForm.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Comentario">
                  <textarea className={inputCls} rows={2} value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="¿Qué te pareció el curso?" />
                </Field>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setReviewForm(null)}>Cancelar</Button>
                  <Button type="submit">Publicar reseña</Button>
                </div>
              </form>
            )}

            {courseReviews.length > 0 && (
              <ul className="space-y-4">
                {courseReviews.map((r) => {
                  const author = talentById(r.talentId)
                  return (
                    <li key={r.id} className="flex gap-3">
                      <Avatar name={author?.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{author?.name || 'Perfil eliminado'}</span>
                          <span className="flex" aria-label={`${r.rating} de 5 estrellas`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
                            ))}
                          </span>
                          <span className="text-xs text-slate-500">{r.createdAt}</span>
                          {r.talentId === viewerId && <Badge tone="brand">Tu reseña</Badge>}
                        </div>
                        {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Preguntas y respuestas */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 font-semibold text-slate-900">Preguntas y respuestas</h2>
            <p className="mb-4 text-sm text-slate-500">Consultá al instructor o a tus compañeros sobre el contenido.</p>

            <form onSubmit={askQuestion} className="mb-5 flex gap-2">
              <input
                className={inputCls}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Escribí tu pregunta…"
                aria-label="Nueva pregunta"
              />
              <Button type="submit" disabled={!newQuestion.trim()}><Send className="h-4 w-4" /> Preguntar</Button>
            </form>

            {questions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                Todavía no hay preguntas. ¡Hacé la primera!
              </p>
            ) : (
              <ul className="space-y-5">
                {questions.map((q) => {
                  const author = talentById(q.talentId)
                  return (
                    <li key={q.id}>
                      <div className="flex gap-3">
                        <Avatar name={author?.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{author?.name || 'Perfil eliminado'}</span>
                            <span className="text-xs text-slate-500">{q.createdAt}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-700">{q.text}</p>

                          {q.answers.length > 0 && (
                            <ul className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4">
                              {q.answers.map((a) => {
                                const replier = talentById(a.talentId)
                                return (
                                  <li key={a.id} className="flex gap-2.5">
                                    <Avatar name={replier?.name} size="sm" />
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-slate-900">{replier?.name || 'Perfil eliminado'}</span>
                                        {course.instructor === replier?.name && <Badge tone="brand">Instructor/a</Badge>}
                                        <span className="text-xs text-slate-500">{a.createdAt}</span>
                                      </div>
                                      <p className="mt-0.5 text-sm text-slate-600">{a.text}</p>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}

                          {replyFor === q.id ? (
                            <div className="mt-3 flex gap-2">
                              <input
                                className={inputCls}
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendReply(q) } }}
                                placeholder="Escribí tu respuesta…"
                                aria-label="Respuesta"
                              />
                              <Button type="button" onClick={() => sendReply(q)} disabled={!replyText.trim()}>Responder</Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyFor(q.id); setReplyText('') }}
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Responder
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar del participante */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar name={viewer?.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{viewer?.name}</p>
                <p className="truncate text-xs text-slate-500">{viewer?.role}</p>
              </div>
            </div>
            {enrollment || doneCount > 0 ? (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Tu avance</p>
                <ProgressBar value={progress} />
                <p className="mt-2 text-xs text-slate-500">{doneCount} de {total} lecciones completadas</p>
                {enrollment?.dueDate && progress < 100 && (
                  <p className={`mt-1.5 inline-flex items-center gap-1 text-xs ${isOverdue(enrollment.dueDate) ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>
                    <CalendarClock className="h-3.5 w-3.5" /> Fecha límite: {fmtDate(enrollment.dueDate)}{isOverdue(enrollment.dueDate) && ' (vencida)'}
                  </p>
                )}
                {enrollment?.completedAt && (
                  <p className="mt-1.5 text-xs font-medium text-emerald-600">Completado el {fmtDateTime(enrollment.completedAt)}</p>
                )}
                {progress >= 100 && (
                  <div className="mt-3 space-y-2">
                    <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      <Award className="h-4 w-4" /> ¡Curso completado!
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => {
                        const ok = exportCertificate({ talent: viewer, course })
                        if (!ok) alert('El navegador bloqueó la ventana del certificado. Permití ventanas emergentes para este sitio.')
                      }}
                    >
                      <FileDown className="h-4 w-4" /> Descargar certificado
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-slate-500">Todavía no estás inscripto/a en este curso.</p>
                <Button className="mt-3 w-full" onClick={enroll}>Inscribirme</Button>
              </div>
            )}
          </section>

          {(course.attachments?.length || 0) > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Material del curso</h2>
              <ul className="space-y-2">
                {course.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={a.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700">
                      <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                      <span className="truncate">{a.name}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {linkedSeminars.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Próximas sesiones en vivo</h2>
              <ul className="space-y-3">
                {linkedSeminars.map((s) => {
                  const m = platformMeta[s.platform]
                  return (
                    <li key={s.id} className="rounded-xl border border-slate-100 p-3">
                      <Link to={`/app/seminarios/${s.id}/vista`} className="flex items-start gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.bg}`}>
                          <m.Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700">{s.title}</span>
                          <span className="block text-xs text-slate-500">{s.date} · {s.time} hs · {m.name}</span>
                        </span>
                      </Link>
                      {s.link && (
                        <a href={s.link} target="_blank" rel="noreferrer"
                          className="mt-2 block rounded-lg bg-brand-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-700">
                          Unirse a {m.name}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
