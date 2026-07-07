import { useEffect } from 'react'
import { X, Pencil, Trash2 } from 'lucide-react'

export function Modal({ open, title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`my-8 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl bg-white p-6 shadow-2xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-600" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDelete({ open, name, onCancel, onConfirm }) {
  return (
    <Modal open={open} title="Confirmar eliminación" onClose={onCancel}>
      <p className="text-sm text-slate-600">
        ¿Seguro que querés eliminar <span className="font-semibold text-slate-900">{name}</span>? Esta acción no se puede deshacer.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
      </div>
    </Modal>
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function Badge({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-sky-100 text-sky-700',
    brand: 'bg-brand-100 text-brand-800',
    violet: 'bg-violet-100 text-violet-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Avatar({ name, size = 'md' }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const colors = ['bg-brand-600', 'bg-violet-600', 'bg-sky-600', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-600']
  const color = colors[(name || '').length % colors.length]
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' }
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${sizes[size]}`}>
      {initials}
    </span>
  )
}

export function ProgressBar({ value }) {
  const tone = value >= 100 ? 'bg-emerald-500' : value >= 50 ? 'bg-brand-500' : 'bg-amber-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-medium text-slate-500">{value}%</span>
    </div>
  )
}

export function IconEdit() {
  return <Pencil className="h-4 w-4" />
}

export function IconTrash() {
  return <Trash2 className="h-4 w-4" />
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="Editar" aria-label="Editar"><IconEdit /></button>
      <button onClick={onDelete} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Eliminar" aria-label="Eliminar"><IconTrash /></button>
    </div>
  )
}
