import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, RowActions,
} from '../components/ui.jsx'

const emptyForm = {
  name: '', email: '', role: '', department: '', level: 'Junior',
  skills: '', status: 'Activo', joinedAt: '',
}

const levels = ['Junior', 'Semi Senior', 'Senior', 'Lead', 'Manager']
const statuses = ['Activo', 'Licencia', 'Inactivo']

export default function Talent() {
  const { data, talents } = useStore()
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null) // {mode:'create'} | {mode:'edit', item}
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return data.talents.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.skills.join(' ').toLowerCase().includes(q),
    )
  }, [data.talents, query])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item, skills: item.skills.join(', ') })
    setModal({ mode: 'edit', item })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      department: form.department.trim(),
      level: form.level,
      status: form.status,
      joinedAt: form.joinedAt,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    }
    if (modal.mode === 'create') talents.add(payload)
    else talents.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Talento"
        subtitle={`${data.talents.length} profesionales en tu organización`}
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar talento</Button>}
      />

      <div className="mb-4">
        <input
          className={`${inputCls} max-w-sm`}
          placeholder="Buscar por nombre, rol, área o skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={query ? 'Sin resultados' : 'Todavía no hay talento cargado'}
          subtitle={query ? 'Probá con otra búsqueda.' : 'Agregá a los profesionales de tu equipo para empezar a gestionar su desarrollo.'}
          action={!query && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar talento</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Profesional</th>
                <th className="px-5 py-3 font-medium">Rol / Área</th>
                <th className="px-5 py-3 font-medium">Seniority</th>
                <th className="px-5 py-3 font-medium">Skills</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} />
                      <div>
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-700">{t.role}</p>
                    <p className="text-xs text-slate-400">{t.department}</p>
                  </td>
                  <td className="px-5 py-3"><Badge tone="violet">{t.level}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex max-w-52 flex-wrap gap-1">
                      {t.skills.slice(0, 3).map((s) => <Badge key={s}>{s}</Badge>)}
                      {t.skills.length > 3 && <Badge>+{t.skills.length - 3}</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={t.status === 'Activo' ? 'green' : t.status === 'Licencia' ? 'amber' : 'slate'}>{t.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <RowActions onEdit={() => openEdit(t)} onDelete={() => setToDelete(t)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Agregar talento' : 'Editar talento'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre completo">
            <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="Ej: María González" />
          </Field>
          <Field label="Email">
            <input className={inputCls} required type="email" value={form.email} onChange={set('email')} placeholder="nombre@empresa.com" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rol">
              <input className={inputCls} required value={form.role} onChange={set('role')} placeholder="Frontend Developer" />
            </Field>
            <Field label="Área">
              <input className={inputCls} value={form.department} onChange={set('department')} placeholder="Ingeniería" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Seniority">
              <select className={inputCls} value={form.level} onChange={set('level')}>
                {levels.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Skills" hint="Separadas por coma">
            <input className={inputCls} value={form.skills} onChange={set('skills')} placeholder="React, SQL, Liderazgo" />
          </Field>
          <Field label="Fecha de ingreso">
            <input className={inputCls} type="date" value={form.joinedAt} onChange={set('joinedAt')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Agregar' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.name}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          talents.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
