import { useState } from 'react'
import { Plus, UserCog, ClipboardCheck } from 'lucide-react'
import { useStore } from '../../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, Avatar, RowActions, IconTrash,
} from '../../components/ui.jsx'

const emptyForm = { name: '', area: '', description: '', requiredTraining: [], members: [] }

export default function JobFunctions() {
  const { data, jobFunctions, talentById } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newTraining, setNewTraining] = useState('')

  const openCreate = () => {
    setForm({ ...emptyForm, requiredTraining: [], members: [] })
    setNewTraining('')
    setModal({ mode: 'create' })
  }
  const openEdit = (item) => {
    setForm({ ...item, requiredTraining: [...item.requiredTraining], members: [...item.members] })
    setNewTraining('')
    setModal({ mode: 'edit', item })
  }

  const addTraining = () => {
    const t = newTraining.trim()
    if (!t) return
    setForm((f) => ({ ...f, requiredTraining: [...f.requiredTraining, t] }))
    setNewTraining('')
  }

  const toggleMember = (id) =>
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }))

  const submit = (e) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      area: form.area.trim(),
      description: form.description.trim(),
      requiredTraining: form.requiredTraining,
      members: form.members,
    }
    if (modal.mode === 'create') jobFunctions.add(payload)
    else jobFunctions.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Definí las funciones de tu organización, qué capacitaciones requiere cada una y quiénes las ocupan.
        </p>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Nueva función</Button>
      </div>

      {data.jobFunctions.length === 0 ? (
        <EmptyState
          icon={<UserCog className="h-10 w-10 text-slate-300" />}
          title="Todavía no hay funciones definidas"
          subtitle="Las funciones permiten asignar capacitaciones obligatorias por puesto, como exige la normativa BPF."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nueva función</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {data.jobFunctions.map((jf) => (
            <div key={jf.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <UserCog className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{jf.name}</h3>
                    {jf.area && <Badge tone="violet">{jf.area}</Badge>}
                  </div>
                  {jf.description && <p className="mt-1 text-sm text-slate-500">{jf.description}</p>}
                </div>
                <RowActions onEdit={() => openEdit(jf)} onDelete={() => setToDelete(jf)} />
              </div>

              <div className="mt-4">
                <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <ClipboardCheck className="h-3.5 w-3.5" /> Capacitaciones requeridas
                </p>
                {jf.requiredTraining.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin capacitaciones definidas.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {jf.requiredTraining.map((t) => (
                      <li key={t} className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700">{t}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {jf.members.slice(0, 6).map((id) => {
                    const t = talentById(id)
                    return t ? <span key={id} className="rounded-full ring-2 ring-white" title={t.name}><Avatar name={t.name} size="sm" /></span> : null
                  })}
                </div>
                <span className="text-xs text-slate-500">
                  {jf.members.length === 0 ? 'Sin personas asignadas' : `${jf.members.length} persona${jf.members.length === 1 ? '' : 's'} con esta función`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Nueva función' : 'Editar función'}
        onClose={() => setModal(null)}
        wide
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de la función">
              <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="Ej: Analista de Control de Calidad" />
            </Field>
            <Field label="Área">
              <input className={inputCls} value={form.area} onChange={set('area')} placeholder="Ej: Laboratorio" />
            </Field>
          </div>
          <Field label="Descripción / responsabilidades">
            <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} placeholder="¿Qué hace esta función?" />
          </Field>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Capacitaciones requeridas</span>
            {form.requiredTraining.length > 0 && (
              <ul className="mb-2 space-y-2">
                {form.requiredTraining.map((t) => (
                  <li key={t} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="flex-1 truncate">{t}</span>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, requiredTraining: f.requiredTraining.filter((x) => x !== t) }))}
                      className="text-slate-500 hover:text-rose-600"
                      title="Quitar"
                    >
                      <IconTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={newTraining}
                onChange={(e) => setNewTraining(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTraining() } }}
                placeholder="Ej: POE-001 Higiene y conducta del personal"
              />
              <Button type="button" variant="secondary" onClick={addTraining}>Agregar</Button>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Personas con esta función</span>
            {data.talents.length === 0 ? (
              <p className="text-sm text-slate-500">Primero agregá talento a tu organización.</p>
            ) : (
              <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
                {data.talents.map((t) => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={form.members.includes(t.id)}
                      onChange={() => toggleMember(t.id)}
                    />
                    <span className="truncate text-slate-700">{t.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit">{modal?.mode === 'create' ? 'Crear función' : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.name}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          jobFunctions.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
