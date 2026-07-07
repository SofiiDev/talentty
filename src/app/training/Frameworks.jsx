import { useState } from 'react'
import { Plus, Scale } from 'lucide-react'
import { useStore } from '../../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, RowActions,
} from '../../components/ui.jsx'

const emptyForm = { code: '', name: '', description: '' }

export default function Frameworks() {
  const { data, frameworks } = useStore()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)

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
    const payload = { code: form.code.trim(), name: form.name.trim(), description: form.description.trim() }
    if (modal.mode === 'create') frameworks.add(payload)
    else frameworks.update(modal.item.id, payload)
    setModal(null)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Los marcos normativos son totalmente configurables: agregá los organismos y normas que apliquen a tu industria (ANMAT, INAME, SENASA, ISO, FDA…).
        </p>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar marco</Button>
      </div>

      {data.frameworks.length === 0 ? (
        <EmptyState
          icon={<Scale className="h-10 w-10 text-slate-300" />}
          title="Sin marcos normativos"
          subtitle="Agregá las normas y organismos regulatorios que aplican a tus planes de capacitación."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Agregar marco</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.frameworks.map((fw) => (
            <div key={fw.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Scale className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{fw.code}</Badge>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-900">{fw.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{fw.description}</p>
                </div>
                <RowActions onEdit={() => openEdit(fw)} onDelete={() => setToDelete(fw)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal?.mode === 'create' ? 'Agregar marco normativo' : 'Editar marco normativo'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Código / sigla" hint="Ej: ANMAT, INAME, ISO 9001, FDA">
            <input className={inputCls} required value={form.code} onChange={set('code')} placeholder="ANMAT" />
          </Field>
          <Field label="Nombre completo">
            <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="ANMAT — Disposición 3827/2018 (BPF)" />
          </Field>
          <Field label="Requisito de capacitación que establece">
            <textarea className={inputCls} rows={3} value={form.description} onChange={set('description')} placeholder="¿Qué exige esta norma respecto de la capacitación del personal?" />
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
          frameworks.remove(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}
