// Utilidades para exportar seminarios a calendarios externos (Google Calendar / .ics)

const pad = (n) => String(n).padStart(2, '0')

// "2026-07-14" + "18:00" -> Date local
export const seminarStart = (s) => new Date(`${s.date}T${s.time || '00:00'}`)

const fmtLocal = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

const escapeIcs = (text = '') => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

const eventTimes = (s) => {
  const start = seminarStart(s)
  const end = new Date(start.getTime() + (s.durationMin || 60) * 60000)
  return { start, end }
}

export function googleCalendarUrl(seminar, platformName) {
  const { start, end } = eventTimes(seminar)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: seminar.title,
    dates: `${fmtLocal(start)}/${fmtLocal(end)}`,
    details: `Seminario de Talentty vía ${platformName}${seminar.link ? `\nEnlace: ${seminar.link}` : ''}`,
    location: seminar.link || platformName,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const vevent = (s, platformName) => {
  const { start, end } = eventTimes(s)
  return [
    'BEGIN:VEVENT',
    `UID:talentty-${s.id}@talentty.app`,
    `DTSTAMP:${fmtLocal(new Date())}`,
    `DTSTART:${fmtLocal(start)}`,
    `DTEND:${fmtLocal(end)}`,
    `SUMMARY:${escapeIcs(s.title)}`,
    `DESCRIPTION:${escapeIcs(`Seminario de Talentty vía ${platformName}${s.link ? ` — ${s.link}` : ''}`)}`,
    `LOCATION:${escapeIcs(s.link || platformName)}`,
    s.link ? `URL:${s.link}` : null,
    'END:VEVENT',
  ].filter(Boolean)
}

export function downloadIcs(seminars, platformNameFor, filename = 'talentty-seminarios.ics') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Talentty//Seminarios//ES',
    'CALSCALE:GREGORIAN',
    ...seminars.flatMap((s) => vevent(s, platformNameFor(s))),
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
