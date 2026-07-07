import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, RowActions,
} from '../components/ui.jsx'

const emptyForm = { talentId: '', period: '', performance: 3, potential: 3, strengths: '', areas: '' }

// Buckets de la matriz 9-box: puntaje 1-5 -> celda 0-2 (bajo/medio/alto)
const bucket = (score) => (score <= 2 ? 0 : score <= 3 ? 1 : 2)

// boxLabels[potencial][desempeño], índices 0=bajo 1=medio 2=alto
const boxLabels = [
  ['Riesgo', 'Efectivo', 'Especialista'],
  ['Dilema', 'Pilar del equipo', 'Alto desempeño'],
  ['Diamante en bruto', 'Alto potencial', 'Estrella'],
]

const boxTones = [
  ['bg-rose-50 border-rose-200', 'bg-amber-50 border-amber-200', 'bg-sky-50 border-sky-200'],
  ['bg-amber-50 border-amber-200', 'bg-slate-50 border-slate-200', 'bg-emerald-50 border-emerald-200'],
  ['bg-sky-50 border-sky-200', 'bg-emerald-50 border-emerald-200', 'bg-brand-50 border-brand-300'],
]

export default function Performance() {
  const { data, evaluations, talentById } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // Última evaluación por persona para la matriz
  const latest = useMemo(() => {
    const byTalent = new Map()
    for (const ev of [...data.evaluations].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))) {
      byTalent.set(ev.talentId, ev)
    }
    return [...byTalent.values()]
  }, [data.evaluations])

  // grid[potencial 2..0][desempeño 0..2]
  const grid = useMemo(() => {
    const g = Array.from({ length: 3 }, () => [[], [], []])
    for (const ev of latest) {
      const t = talentById(ev.talentId)
      if (t) g[bucket(ev.potential)][bucket(ev.performance)].push(t)
    }
    return g
  }, [latest, talentById])

  const openCreate = () => {
    setForm({ ...emptyForm, talentId: data.talents[0]?.id || '', period: `${new Date().getFullYear()} H2` })
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item })
    setModal({ mode: 'edit', item })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      talentId: form.talentId,
      period: form.period.trim(),
      performance: Number(form.performance),
      potential: Number(form.potential),
      strengths: form.strengths.trim(),
      areas: form.areas.trim(),
    }
    if (modal.mode === 'create') evaluations.add({ ...payload, createdAt: new Date().toISOString().slice(0, 10) })
    else evaluations.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const scoreOptions = [1, 2, 3, 4, 5]

  return (
    <div>
      <PageHeader
        title="Desempeño"
        subtitle="Evaluaciones de desempeño y potencial con matriz 9-box para decisiones de talento."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nueva evaluación</Button>}
      />

      {/* Matriz 9-box */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Matriz 9-box</h2>
        <p className="mt-0.5 mb-4 text-sm text-slate-500">Última evaluación de cada persona · eje X: desempeño · eje Y: potencial</p>
        <div className="flex gap-3">
          <div className="flex w-6 shrink-0 items-center justify-center">
            <span className="-rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-slate-400">Potencial →</span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {[2, 1, 0].map((pot) =>
                [0, 1, 2].map((perf) => (
                  <div key={`${pot}-${perf}`} className={`min-h-24 rounded-xl border p-2.5 ${boxTones[pot][perf]}`}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{boxLabels[pot][perf]}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {grid[pot][perf].map((t) => (
                        <span key={t.id} title={t.name}><Avatar name={t.name} size="sm" /></span>
                      ))}
                    </div>
                  </div>
                )),
              )}
            </div>
            <p className="mt-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Desempeño →</p>
          </div>
        </div>
      </section>

      {/* Tabla de evaluaciones */}
      {data.evaluations.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Todavía no hay evaluaciones"
          subtitle="Registrá evaluaciones de desempeño y potencial para armar la matriz 9-box de tu equipo."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nueva evaluación</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Profesional</th>
                <th className="px-5 py-3 font-medium">Período</th>
                <th className="px-5 py-3 font-medium">Desempeño</th>
                <th className="px-5 py-3 font-medium">Potencial</th>
                <th className="px-5 py-3 font-medium">Clasificación</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...data.evaluations]
                .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                .map((ev) => {
                  const t = talentById(ev.talentId)
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={t?.name} size="sm" />
                          <span className="font-medium text-slate-900">{t?.name || 'Perfil eliminado'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{ev.period}</td>
                      <td className="px-5 py-3"><Badge tone={ev.performance >= 4 ? 'green' : ev.performance >= 3 ? 'blue' : 'amber'}>{ev.performance} / 5</Badge></td>
                      <td className="px-5 py-3"><Badge tone={ev.potential >= 4 ? 'green' : ev.potential >= 3 ? 'blue' : 'amber'}>{ev.potential} / 5</Badge></td>
                      <td className="px-5 py-3 text-slate-600">{boxLabels[bucket(ev.potential)][bucket(ev.performance)]}</td>
                      <td className="px-5 py-3">
                        <RowActions onEdit={() => openEdit(ev)} onDelete={() => setToDelete(ev)} />
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Nueva evaluación' : 'Editar evaluación'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Profesional">
              <select className={inputCls} required value={form.talentId} onChange={set('talentId')}>
                <option value="" disabled>Elegí una persona…</option>
                {data.talents.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Período">
              <input className={inputCls} required value={form.period} onChange={set('period')} placeholder="Ej: 2026 H2" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Desempeño (1-5)">
              <select className={inputCls} value={form.performance} onChange={set('performance')}>
                {scoreOptions.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Potencial (1-5)">
              <select className={inputCls} value={form.potential} onChange={set('potential')}>
                {scoreOptions.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Fortalezas">
            <textarea className={inputCls} rows={2} value={form.strengths} onChange={set('strengths')} placeholder="¿Qué hace muy bien esta persona?" />
          </Field>
          <Field label="Áreas de mejora">
            <textarea className={inputCls} rows={2} value={form.areas} onChange={set('areas')} placeholder="¿Dónde puede crecer?" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Guardar evaluación' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete ? `la evaluación de ${talentById(toDelete.talentId)?.name || 'este perfil'} (${toDelete.period})` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          evaluations.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
