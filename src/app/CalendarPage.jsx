import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Clock } from 'lucide-react'
import { useStore } from '../store.jsx'
import { Button, Badge, PageHeader } from '../components/ui.jsx'
import { platformMeta } from '../lib/video.jsx'
import { downloadIcs } from '../lib/calendar.js'
import { AddToCalendar, seminarStatusTone } from './Seminars.jsx'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export default function CalendarPage() {
  const { data } = useStore()
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState(key(today.getFullYear(), today.getMonth(), today.getDate()))

  const byDate = useMemo(() => {
    const map = new Map()
    for (const s of data.seminars) {
      if (!s.date) continue
      if (!map.has(s.date)) map.set(s.date, [])
      map.get(s.date).push(s)
    }
    for (const list of map.values()) list.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    return map
  }, [data.seminars])

  // Celdas del mes: semanas que empiezan en lunes
  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1)
    const startOffset = (first.getDay() + 6) % 7 // lunes = 0
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
    const out = []
    for (let i = 0; i < startOffset; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) out.push(d)
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [cursor])

  const move = (delta) =>
    setCursor(({ y, m }) => {
      const date = new Date(y, m + delta, 1)
      return { y: date.getFullYear(), m: date.getMonth() }
    })

  const todayKey = key(today.getFullYear(), today.getMonth(), today.getDate())
  const daySeminars = byDate.get(selected) || []

  const exportMonth = () => {
    const prefix = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`
    const monthly = data.seminars.filter((s) => s.date?.startsWith(prefix) && s.status !== 'Cancelado')
    if (monthly.length) {
      downloadIcs(monthly, (s) => platformMeta[s.platform].name, `talentty-${prefix}.ics`)
    }
  }

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle="Agenda de seminarios del equipo. Exportá el mes o añadí sesiones a tu calendario personal."
        action={<Button variant="secondary" onClick={exportMonth}><Download className="h-4 w-4" /> Exportar mes (.ics)</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grilla mensual */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{MONTHS[cursor.m]} {cursor.y}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => move(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Mes anterior">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setCursor({ y: today.getFullYear(), m: today.getMonth() })
                  setSelected(todayKey)
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Hoy
              </button>
              <button onClick={() => move(1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Mes siguiente">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div key={`x${i}`} />
              const k = key(cursor.y, cursor.m, d)
              const events = byDate.get(k) || []
              const isToday = k === todayKey
              const isSelected = k === selected
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={`flex min-h-16 flex-col items-start gap-1 rounded-xl border p-1.5 text-left transition-colors sm:min-h-20 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50'
                      : isToday
                        ? 'border-brand-300 bg-white'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? 'bg-brand-600 text-white' : 'text-slate-700'
                  }`}>
                    {d}
                  </span>
                  <span className="flex flex-wrap gap-0.5">
                    {events.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        title={s.title}
                        className={`h-1.5 w-1.5 rounded-full ${s.platform === 'zoom' ? 'bg-sky-500' : 'bg-emerald-500'}`}
                      />
                    ))}
                    {events.length > 3 && <span className="text-[9px] leading-none text-slate-400">+{events.length - 3}</span>}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex gap-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Zoom</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Google Meet</span>
          </div>
        </section>

        {/* Detalle del día */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">{selected}</h2>
          <p className="mb-4 text-sm text-slate-500">{daySeminars.length} seminario{daySeminars.length === 1 ? '' : 's'}</p>
          {daySeminars.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              Sin seminarios este día.
            </p>
          ) : (
            <ul className="space-y-3">
              {daySeminars.map((s) => {
                const m = platformMeta[s.platform]
                return (
                  <li key={s.id} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.bg}`}>
                        <m.Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{s.title}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" /> {s.time} hs · {s.durationMin} min · {m.name}
                        </p>
                        <div className="mt-1"><Badge tone={seminarStatusTone[s.status]}>{s.status}</Badge></div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {s.link && (
                        <a href={s.link} target="_blank" rel="noreferrer"
                          className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                          Unirse
                        </a>
                      )}
                      <AddToCalendar seminar={s} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
