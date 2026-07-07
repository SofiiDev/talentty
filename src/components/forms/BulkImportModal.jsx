import { useState } from 'react'
import { Upload, FileDown, Users } from 'lucide-react'
import { Modal, Button, Field, inputCls, Badge } from '../ui.jsx'
import { useStore } from '../../store.jsx'

const TEMPLATE = [
  'Nombre,Email,Rol,Área,Seniority,Skills (separadas por |)',
  'Juana Molina,juana.molina@empresa.com,Analista de Calidad,Laboratorio,Semi Senior,HPLC|BPL',
  'Pedro Gómez,pedro.gomez@empresa.com,Operario,Producción,Junior,Áreas limpias',
].join('\n')

// Acepta CSV separado por coma o punto y coma; la primera fila puede ser encabezado
function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return []
  const sep = (lines[0].match(/;/g)?.length || 0) > (lines[0].match(/,/g)?.length || 0) ? ';' : ','
  const rows = []
  for (const line of lines) {
    const cols = line.split(sep).map((c) => c.trim())
    if (/^nombre/i.test(cols[0] || '')) continue
    const [name, email, role = '', department = '', level = 'Junior', skills = ''] = cols
    if (!name || !email || !email.includes('@')) continue
    rows.push({
      name,
      email,
      role,
      department,
      level: level || 'Junior',
      skills: skills.split('|').map((s) => s.trim()).filter(Boolean),
      status: 'Activo',
      joinedAt: new Date().toISOString().slice(0, 10),
    })
  }
  return rows
}

export default function BulkImportModal({ onClose, defaultPlanId = '' }) {
  const { data, talents, jobFunctions, annualPlans } = useStore()
  const [text, setText] = useState('')
  const [functionId, setFunctionId] = useState('')
  const [planId, setPlanId] = useState(defaultPlanId)
  const [result, setResult] = useState(null)

  const rows = parseCsv(text)
  const existingEmails = new Set(data.talents.map((t) => t.email.toLowerCase()))
  const newRows = rows.filter((r) => !existingEmails.has(r.email.toLowerCase()))
  const duplicates = rows.length - newRows.length

  const readFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result || ''))
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla-talentty.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = () => {
    const ids = newRows.map((r) => talents.add(r).id)
    if (functionId) {
      const jf = data.jobFunctions.find((f) => f.id === functionId)
      if (jf) jobFunctions.update(functionId, { members: [...new Set([...jf.members, ...ids])] })
    }
    if (planId) {
      const p = data.annualPlans.find((x) => x.id === planId)
      if (p) annualPlans.update(planId, { participantIds: [...new Set([...(p.participantIds || []), ...ids])] })
    }
    setResult(ids.length)
  }

  return (
    <Modal open title="Carga masiva de perfiles" onClose={onClose} wide>
      {result != null ? (
        <div className="py-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Users className="h-6 w-6" />
          </span>
          <p className="text-lg font-semibold text-slate-900">{result} perfiles importados</p>
          <p className="mt-1 text-sm text-slate-500">
            {functionId && 'Asignados a la función seleccionada. '}
            {planId && 'Incluidos en el plan de capacitación. '}
            Ya están disponibles en Talento.
          </p>
          <Button className="mt-5" onClick={onClose}>Listo</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Pegá un CSV o subí un archivo con columnas:{' '}
              <span className="font-mono text-xs text-slate-600">Nombre, Email, Rol, Área, Seniority, Skills</span>
            </p>
            <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
              <FileDown className="h-4 w-4" /> Descargar plantilla
            </button>
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 hover:border-brand-400 hover:bg-brand-50/40">
            <Upload className="h-4 w-4" />
            Subir archivo .csv
            <input type="file" accept=".csv,.txt" className="hidden" onChange={readFile} />
          </label>

          <Field label="O pegá los datos acá">
            <textarea
              className={`${inputCls} font-mono text-xs`}
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={TEMPLATE}
            />
          </Field>

          {rows.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <Badge tone="green">{newRows.length} para importar</Badge>
                {duplicates > 0 && <Badge tone="amber">{duplicates} ya existen (por email) y se omiten</Badge>}
              </div>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
                {newRows.slice(0, 8).map((r) => (
                  <li key={r.email} className="truncate">
                    <span className="font-medium text-slate-800">{r.name}</span> · {r.email} · {r.role || 'sin rol'}
                  </li>
                ))}
                {newRows.length > 8 && <li className="text-slate-400">… y {newRows.length - 8} más</li>}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Asignar función (opcional)" hint="Quedan con las capacitaciones requeridas por esa función">
              <select className={inputCls} value={functionId} onChange={(e) => setFunctionId(e.target.value)}>
                <option value="">— Sin función —</option>
                {data.jobFunctions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
            <Field label="Incluir en plan de capacitación (opcional)">
              <select className={inputCls} value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">— Sin plan —</option>
                {data.annualPlans.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={doImport} disabled={newRows.length === 0}>
              <Upload className="h-4 w-4" /> Importar {newRows.length > 0 ? `${newRows.length} perfiles` : ''}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
