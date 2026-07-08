import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { inputCls } from './ui.jsx'
import { useStore } from '../store.jsx'

const NEW = '__crear_nueva__'

// Desplegable que permite crear nuevas opciones sobre la marcha.
// Las opciones creadas se guardan en el store (customOptions[listKey]) y
// quedan disponibles en toda la app.
export default function CreatableSelect({ listKey, baseOptions, value, onChange, ariaLabel, createLabel = 'Crear nueva opción…' }) {
  const { data, addOption } = useStore()
  const [creating, setCreating] = useState(false)
  const [text, setText] = useState('')

  const custom = data.customOptions?.[listKey] || []
  const options = [...new Set([
    ...baseOptions,
    ...custom,
    ...(value && !baseOptions.includes(value) && !custom.includes(value) ? [value] : []),
  ])]

  const confirm = () => {
    const v = text.trim()
    if (!v) return
    addOption(listKey, v)
    onChange(v)
    setText('')
    setCreating(false)
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
            if (e.key === 'Escape') { setCreating(false); setText('') }
          }}
          placeholder="Nombre de la nueva opción…"
          aria-label={`Nueva opción para ${ariaLabel || listKey}`}
        />
        <button type="button" onClick={confirm} disabled={!text.trim()}
          className="rounded-lg bg-brand-600 p-2.5 text-white hover:bg-brand-700 disabled:opacity-40" aria-label="Confirmar nueva opción">
          <Check className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => { setCreating(false); setText('') }}
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
        if (e.target.value === NEW) setCreating(true)
        else onChange(e.target.value)
      }}
      aria-label={ariaLabel}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value={NEW}>＋ {createLabel}</option>
    </select>
  )
}
