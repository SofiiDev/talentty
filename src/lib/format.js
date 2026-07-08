// Formateo de fechas y timestamps
const pad = (n) => String(n).padStart(2, '0')

// Fechas "YYYY-MM-DD" se formatean sin pasar por Date para evitar
// corrimientos de zona horaria
export const fmtDate = (value) => {
  if (!value) return ''
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const d = new Date(value)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export const fmtDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} hs`
}

export const nowIso = () => new Date().toISOString()

// true si la fecha límite (YYYY-MM-DD) ya pasó
export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(`${dueDate}T23:59:59`) < new Date()
}
