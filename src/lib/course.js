// Helpers de cursos organizados por unidades temáticas
export const courseLessons = (course) =>
  (course.units || []).flatMap((u) => u.lessons || [])

export const examTotalPoints = (exam) =>
  exam.questions.reduce((a, q) => a + (Number(q.points) || 0), 0)

// Corrección automática de las preguntas de opción múltiple
export const autoGrade = (exam, answers) =>
  exam.questions.reduce(
    (a, q) => a + (q.type === 'multiple' && Number(answers[q.id]) === q.correct ? Number(q.points) || 0 : 0),
    0,
  )

export const hasOpenQuestions = (exam) => exam.questions.some((q) => q.type === 'abierta')

// Puntaje final (%) combinando corrección automática y manual
export const finalScoreOf = (exam, attempt) => {
  const total = examTotalPoints(exam)
  if (!total) return 0
  const manual = Object.values(attempt.manualScores || {}).reduce((a, n) => a + (Number(n) || 0), 0)
  return Math.round(((attempt.autoScore + manual) / total) * 100)
}

export const latestAttempt = (exam, talentId) =>
  [...(exam.attempts || [])]
    .filter((a) => a.talentId === talentId)
    .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))[0]
