import { useMemo, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, RowActions,
} from '../components/ui.jsx'
import BulkImportModal from '../components/forms/BulkImportModal.jsx'
import CreatableSelect from '../components/CreatableSelect.jsx'

const emptyForm = {
  name: '', email: '', notifyEmail: '', role: '', department: '', level: 'Junior',
  skills: '', status: 'Activo', joinedAt: '', locationId: '',
}

const levels = ['Junior', 'Semi Senior', 'Senior', 'Lead', 'Manager']
const statuses = ['Activo', 'Licencia', 'Inactivo']

export default function Talent() {
  const { data, talents, locationById } = useStore()
  const [query, setQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [modal, setModal] = useState(null) // {mode:'create'} | {mode:'edit', item}
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [importOpen, setImportOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return data.talents.filter(
      (t) =>
        (!locationFilter || t.locationId === locationFilter) &&
        (t.name.toLowerCase().includes(q) ||
          t.role.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.skills.join(' ').toLowerCase().includes(q)),
    )
  }, [data.talents, query, locationFilter])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({
      ...emptyForm,
      ...item,
      notifyEmail: item.notifyEmail || '',
      locationId: item.locationId || '',
      skills: item.skills.join(', '),
    })
    setModal({ mode: 'edit', item })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      notifyEmail: form.notifyEmail.trim(),
      role: form.role.trim(),
      department: form.department.trim(),
      level: form.level,
      status: form.status,
      joinedAt: form.joinedAt,
      locationId: form.locationId,
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
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Carga masiva</Button>
            <Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar talento</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className={`${inputCls} max-w-sm`}
          placeholder="Buscar por nombre, rol, área o skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={`${inputCls} w-auto`}
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">Todas las locaciones</option>
          {data.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
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
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Profesional</th>
                <th className="px-5 py-3 font-medium">Rol / Área</th>
                <th className="px-5 py-3 font-medium">Locación</th>
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
                    <p className="text-xs text-slate-500">{t.department}</p>
                  </td>
                  <td className="px-5 py-3">
                    {t.locationId && locationById(t.locationId)
                      ? <Badge tone="blue">{locationById(t.locationId).name}</Badge>
                      : <span className="text-xs text-slate-500">Sin asignar</span>}
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input className={inputCls} required type="email" value={form.email} onChange={set('email')} placeholder="nombre@empresa.com" />
            </Field>
            <Field label="Email de notificaciones" hint="Para encuestas, evaluaciones y avisos. Si queda vacío se usa el email principal.">
              <input className={inputCls} type="email" value={form.notifyEmail} onChange={set('notifyEmail')} placeholder="opcional" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rol">
              <input className={inputCls} required value={form.role} onChange={set('role')} placeholder="Frontend Developer" />
            </Field>
            <Field label="Área">
              <input className={inputCls} value={form.department} onChange={set('department')} placeholder="Ingeniería" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Seniority" as="div">
              <CreatableSelect
                listKey="talentLevels"
                baseOptions={levels}
                value={form.level}
                onChange={(v) => setForm((f) => ({ ...f, level: v }))}
                ariaLabel="Seniority"
                createLabel="Crear seniority…"
              />
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Locación">
              <select className={inputCls} value={form.locationId} onChange={set('locationId')}>
                <option value="">— Sin asignar —</option>
                {data.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <Field label="Fecha de ingreso">
              <input className={inputCls} type="date" value={form.joinedAt} onChange={set('joinedAt')} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Agregar' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      {importOpen && <BulkImportModal onClose={() => setImportOpen(false)} />}

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
