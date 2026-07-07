import { useState } from 'react'
import { ClipboardList, UserCog, FileCheck2, Scale } from 'lucide-react'
import { PageHeader } from '../../components/ui.jsx'
import AnnualPlans from './AnnualPlans.jsx'
import JobFunctions from './JobFunctions.jsx'
import Assessments from './Assessments.jsx'
import Frameworks from './Frameworks.jsx'

const tabs = [
  { key: 'planes', label: 'Planes anuales', Icon: ClipboardList, Component: AnnualPlans },
  { key: 'funciones', label: 'Funciones', Icon: UserCog, Component: JobFunctions },
  { key: 'evaluaciones', label: 'Evaluaciones', Icon: FileCheck2, Component: Assessments },
  { key: 'normativa', label: 'Marcos normativos', Icon: Scale, Component: Frameworks },
]

export default function Training() {
  const [tab, setTab] = useState('planes')
  const Active = tabs.find((t) => t.key === tab).Component

  return (
    <div>
      <PageHeader
        title="Capacitación anual"
        subtitle="Planes anuales de capacitación alineados a ANMAT, INAME, BPF/GMP e ISO: funciones, procedimientos requeridos y evaluaciones de eficacia."
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <Active />
    </div>
  )
}
