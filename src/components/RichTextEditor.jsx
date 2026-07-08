import { useEffect, useRef } from 'react'
import {
  Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, RemoveFormatting,
} from 'lucide-react'

// Editor de texto enriquecido liviano (títulos, negrita, listas, alineación y
// justificado) al estilo de los editores profesionales. Guarda HTML.
export default function RichTextEditor({ value, onChange, placeholder = 'Escribí acá…', minHeight = 'min-h-24' }) {
  const ref = useRef(null)

  // Solo se sincroniza el HTML entrante cuando el editor NO está en uso:
  // durante el tipeo, el estado de React va detrás del contentEditable y
  // reescribir el innerHTML rompería el texto y la posición del cursor.
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  const emit = () => onChange(ref.current.innerHTML === '<br>' ? '' : ref.current.innerHTML)

  const exec = (cmd, val = null) => {
    ref.current.focus()
    document.execCommand(cmd, false, val)
    emit()
  }

  const ToolButton = ({ Icon, cmd, val, label }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val) }}
      className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  return (
    <div className="rounded-lg border border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-slate-200 bg-slate-50 px-2 py-1.5" role="toolbar" aria-label="Formato de texto">
        <select
          className="mr-1 rounded-md border-0 bg-transparent py-1 pl-1 pr-6 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/30"
          defaultValue=""
          onChange={(e) => { if (e.target.value) exec('formatBlock', e.target.value); e.target.value = '' }}
          aria-label="Estilo de párrafo"
        >
          <option value="" disabled>Estilo</option>
          <option value="h2">Título</option>
          <option value="h3">Subtítulo</option>
          <option value="p">Párrafo</option>
        </select>
        <ToolButton Icon={Bold} cmd="bold" label="Negrita" />
        <ToolButton Icon={Italic} cmd="italic" label="Cursiva" />
        <ToolButton Icon={Underline} cmd="underline" label="Subrayado" />
        <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />
        <ToolButton Icon={List} cmd="insertUnorderedList" label="Lista con viñetas" />
        <ToolButton Icon={ListOrdered} cmd="insertOrderedList" label="Lista numerada" />
        <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />
        <ToolButton Icon={AlignLeft} cmd="justifyLeft" label="Alinear a la izquierda" />
        <ToolButton Icon={AlignCenter} cmd="justifyCenter" label="Centrar" />
        <ToolButton Icon={AlignRight} cmd="justifyRight" label="Alinear a la derecha" />
        <ToolButton Icon={AlignJustify} cmd="justifyFull" label="Justificar" />
        <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />
        <ToolButton Icon={RemoveFormatting} cmd="removeFormat" label="Quitar formato" />
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className={`rich-content ${minHeight} max-h-[60vh] overflow-y-auto rounded-b-lg px-3 py-2 text-sm text-slate-900 focus:outline-none`}
      />
    </div>
  )
}

// Texto plano a partir de HTML (para tarjetas y resúmenes truncados)
export const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

// Render seguro del HTML del editor
export function RichText({ html, className = '' }) {
  const safe = (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: safe }} />
}
