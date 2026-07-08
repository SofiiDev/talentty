import { useState } from 'react'
import { Plus, MapPin, Building2, ArrowRightLeft } from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, Avatar, RowActions,
} from '../components/ui.jsx'
import CreatableSelect from '../components/CreatableSelect.jsx'

const locationTypes = ['Planta productiva', 'Laboratorio de control', 'Depósito / Logística', 'Oficina', 'Centro de distribución', 'Otro']
const locationStatuses = ['Operativa', 'En obra', 'Inactiva']

const emptyForm = { name: '', type: 'Planta productiva', address: '', city: '', status: 'Operativa' }

function TransferModal({ location, onClose }) {
  const { data, talents } = useStore()
  const members = data.talents.filter((t) => t.locationId === location.id)
  const targets = data.locations.filter((l) => l.id !== location.id)
  const [selected, setSelected] = useState([])
  const [target, setTarget] = useState(targets[0]?.id || '')

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const transfer = () => {
    selected.forEach((id) => talents.update(id, { locationId: target }))
    onClose()
  }

  return (
    <Modal open title={`Transferir personal — ${location.name}`} onClose={onClose}>
      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
          Esta locación no tiene personal asignado.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Seleccioná a quién transferir</span>
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {members.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={selected.includes(t.id)}
                    onChange={() => toggle(t.id)}
                  />
                  <Avatar name={t.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{t.name}</span>
                    <span className="block truncate text-xs text-slate-500">{t.role}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Locación de destino">
            <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
              {targets.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={transfer} disabled={selected.length === 0 || !target}>
              <ArrowRightLeft className="h-4 w-4" /> Transferir {selected.length > 0 ? `${selected.length} persona${selected.length === 1 ? '' : 's'}` : ''}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Locations() {
  const { data, locations } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [transferFor, setTransferFor] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const membersOf = (locationId) => data.talents.filter((t) => t.locationId === locationId)
  const unassigned = data.talents.filter((t) => !t.locationId || !data.locations.some((l) => l.id === t.locationId))

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item })
    setModal({ mode: 'edit', item })
  }

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      type: form.type,
      address: form.address.trim(),
      city: form.city.trim(),
      status: form.status,
    }
    if (modal.mode === 'create') locations.add(payload)
    else locations.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const statusTone = { Operativa: 'green', 'En obra': 'amber', Inactiva: 'slate' }

  return (
    <div>
      <PageHeader
        title="Locaciones"
        subtitle="Gestioná el talento de todas tus sedes: plantas, laboratorios, depósitos y oficinas."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar locación</Button>}
      />

      {data.locations.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10 text-slate-300" />}
          title="Todavía no hay locaciones"
          subtitle="Agregá tus sedes para organizar y transferir personal entre ellas."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar locación</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {data.locations.map((loc) => {
            const members = membersOf(loc.id)
            return (
              <div key={loc.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{loc.name}</h3>
                      <Badge tone={statusTone[loc.status]}>{loc.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{loc.type}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {loc.address}{loc.city && ` · ${loc.city}`}
                    </p>
                  </div>
                  <RowActions onEdit={() => openEdit(loc)} onDelete={() => setToDelete(loc)} />
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Personal ({members.length})
                  </p>
                  {members.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-xs text-slate-500">
                      Sin personal asignado.
                    </p>
                  ) : (
                    <ul className="max-h-44 space-y-1.5 overflow-y-auto">
                      {members.map((t) => (
                        <li key={t.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                          <Avatar name={t.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                            <p className="truncate text-xs text-slate-500">{t.role}</p>
                          </div>
                          <Badge tone={t.status === 'Activo' ? 'green' : 'amber'}>{t.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="secondary" onClick={() => setTransferFor(loc)} disabled={members.length === 0 || data.locations.length < 2}>
                    <ArrowRightLeft className="h-4 w-4" /> Transferir personal
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">
            {unassigned.length} persona{unassigned.length === 1 ? '' : 's'} sin locación asignada
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Asignales una locación desde su perfil en Talento: {unassigned.slice(0, 5).map((t) => t.name).join(', ')}
            {unassigned.length > 5 && ` y ${unassigned.length - 5} más`}.
          </p>
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Agregar locación' : 'Editar locación'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre">
            <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="Ej: Planta Central" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo" as="div">
              <CreatableSelect
                listKey="locationTypes"
                baseOptions={locationTypes}
                value={form.type}
                onChange={(v) => setForm((f) => ({ ...f, type: v }))}
                ariaLabel="Tipo de locación"
                createLabel="Crear tipo…"
              />
            </Field>
            <Field label="Estado">
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {locationStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Dirección">
            <input className={inputCls} value={form.address} onChange={set('address')} placeholder="Av. Industrial 1250" />
          </Field>
          <Field label="Ciudad / País">
            <input className={inputCls} value={form.city} onChange={set('city')} placeholder="Buenos Aires, Argentina" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Agregar' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      {transferFor && <TransferModal location={transferFor} onClose={() => setTransferFor(null)} />}

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.name}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          locations.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
