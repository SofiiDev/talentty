import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { inputCls } from './ui.jsx'
import { useStore } from '../store.jsx'

const NEW_PERSON = '__nuevo_persona__'
const NEW_COMPANY = '__nuevo_empresa__'

// Selector de instructor/a vinculado al registro de Instructores.
// Permite crear una persona o empresa sobre la marcha; el perfil se completa
// luego en la sección Instructores.
export default function InstructorPicker({ value, onChange, ariaLabel = 'Instructor/a' }) {
  const { data, instructors } = useStore()
  const [creating, setCreating] = useState(null) // 'Persona' | 'Empresa' | null
  const [text, setText] = useState('')

  const names = data.instructors.map((i) => i.name)
  const options = [...new Set([...names, ...(value && !names.includes(value) ? [value] : [])])]

  const confirm = () => {
    const name = text.trim()
    if (!name) return
    if (!names.includes(name)) {
      instructors.add({
        name, type: creating, title: '', email: '', website: '', bio: '',
        credentials: [], verified: false, verifiedBy: '', verifiedAt: null, verifyNote: '',
      })
    }
    onChange(name)
    setText('')
    setCreating(null)
  }

  if (creating) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          className={inputCls}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirm() }
            if (e.key === 'Escape') { setCreating(null); setText('') }
          }}
          placeholder={creating === 'Empresa' ? 'Nombre de la empresa…' : 'Nombre y apellido…'}
          aria-label={`Nombre del nuevo instructor (${creating})`}
        />
        <button type="button" onClick={confirm} disabled={!text.trim()}
          className="rounded-lg bg-brand-600 p-2.5 text-white hover:bg-brand-700 disabled:opacity-40" aria-label="Confirmar instructor">
          <Check className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => { setCreating(null); setText('') }}
          className="rounded-lg border border-slate-300 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Cancelar">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => {
        if (e.target.value === NEW_PERSON) setCreating('Persona')
        else if (e.target.value === NEW_COMPANY) setCreating('Empresa')
        else onChange(e.target.value)
      }}
      aria-label={ariaLabel}
    >
      <option value="">— Sin asignar —</option>
      {options.map((name) => {
        const ins = data.instructors.find((i) => i.name === name)
        return (
          <option key={name} value={name}>
            {name}{ins?.verified ? ' ✓' : ''}{ins?.type === 'Empresa' ? ' (empresa)' : ''}
          </option>
        )
      })}
      <option value={NEW_PERSON}>＋ Crear instructor/a (persona)…</option>
      <option value={NEW_COMPANY}>＋ Crear instructor (empresa)…</option>
    </select>
  )
}
