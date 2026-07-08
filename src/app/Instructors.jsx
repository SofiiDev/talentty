import { useState } from 'react'
import {
  Plus, BadgeCheck, Building2, User, Mail, Globe, Award, Trash2,
  ShieldCheck, ShieldOff, BookOpen, Video,
} from 'lucide-react'
import { useStore } from '../store.jsx'
import {
  Modal, ConfirmDelete, Button, Badge, Field, inputCls,
  EmptyState, PageHeader, RowActions,
} from '../components/ui.jsx'
import { fmtDateTime, nowIso } from '../lib/format.js'

const uid = () => Math.random().toString(36).slice(2, 10)

const emptyForm = {
  name: '', type: 'Persona', title: '', email: '', website: '', bio: '', credentials: [],
}

function InstructorFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initial || {}),
    credentials: (initial?.credentials || []).map((c) => ({ ...c })),
  }))
  const [newCred, setNewCred] = useState({ name: '', issuer: '', year: '', url: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addCred = () => {
    const name = newCred.name.trim()
    if (!name) return
    setForm((f) => ({
      ...f,
      credentials: [...f.credentials, { id: uid(), name, issuer: newCred.issuer.trim(), year: newCred.year.trim(), url: newCred.url.trim() }],
    }))
    setNewCred({ name: '', issuer: '', year: '', url: '' })
  }

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      type: form.type,
      title: form.title.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      bio: form.bio.trim(),
      credentials: form.credentials,
    })
  }

  return (
    <Modal open title={initial ? 'Editar instructor' : 'Nuevo instructor'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label={form.type === 'Empresa' ? 'Nombre de la empresa' : 'Nombre y apellido'}>
              <input className={inputCls} required value={form.name} onChange={set('name')} placeholder={form.type === 'Empresa' ? 'Pharma Training S.A.' : 'Ana Torres'} />
            </Field>
          </div>
          <Field label="Tipo">
            <select className={inputCls} value={form.type} onChange={set('type')}>
              <option>Persona</option>
              <option>Empresa</option>
            </select>
          </Field>
        </div>
        <Field label={form.type === 'Empresa' ? 'Rubro / especialidad' : 'Título / especialidad'}>
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder={form.type === 'Empresa' ? 'Consultora de capacitación GxP' : 'Responsable de Garantía de Calidad'} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email de contacto">
            <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="contacto@ejemplo.com" />
          </Field>
          <Field label="Sitio web / LinkedIn">
            <input className={inputCls} type="url" value={form.website} onChange={set('website')} placeholder="https://…" />
          </Field>
        </div>
        <Field label="Biografía / presentación">
          <textarea className={inputCls} rows={3} value={form.bio} onChange={set('bio')} placeholder="Experiencia, especialidades, trayectoria…" />
        </Field>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Credenciales y certificaciones</span>
          <p className="mb-2 text-xs text-slate-500">Títulos, matrículas, certificaciones o calificaciones que respaldan la acreditación.</p>
          {form.credentials.length > 0 && (
            <ul className="mb-2 space-y-2">
              {form.credentials.map((c) => (
                <li key={c.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <Award className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{c.name}</span>
                    {c.issuer && <span className="text-slate-500"> — {c.issuer}</span>}
                    {c.year && <span className="text-slate-500"> ({c.year})</span>}
                  </span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, credentials: f.credentials.filter((x) => x.id !== c.id) }))}
                    className="text-slate-500 hover:text-rose-600" aria-label="Quitar credencial">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
            <input className={inputCls} value={newCred.name} onChange={(e) => setNewCred((c) => ({ ...c, name: e.target.value }))} placeholder="Credencial. Ej: Farmacéutica" aria-label="Nombre de la credencial" />
            <input className={inputCls} value={newCred.issuer} onChange={(e) => setNewCred((c) => ({ ...c, issuer: e.target.value }))} placeholder="Emisor. Ej: UBA" aria-label="Emisor" />
            <input className={inputCls} value={newCred.year} onChange={(e) => setNewCred((c) => ({ ...c, year: e.target.value }))} placeholder="Año" aria-label="Año" />
            <Button type="button" variant="secondary" onClick={addCred} disabled={!newCred.name.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{initial ? 'Guardar cambios' : 'Crear instructor'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function VerifyModal({ instructor, onClose, onVerify }) {
  const [by, setBy] = useState('')
  const [note, setNote] = useState('')
  return (
    <Modal open title={`Acreditar a ${instructor.name}`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onVerify(by.trim(), note.trim()) }} className="space-y-4">
        <p className="text-sm text-slate-600">
          La acreditación deja constancia de que las credenciales del instructor fueron verificadas
          (título, matrícula, referencias o calificación de proveedor).
        </p>
        <Field label="Verificado por">
          <input className={inputCls} required autoFocus value={by} onChange={(e) => setBy(e.target.value)} placeholder="Ej: Garantía de Calidad / RRHH" />
        </Field>
        <Field label="Método / observaciones">
          <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: Matrícula verificada contra el registro oficial; referencias contactadas." />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!by.trim()}><ShieldCheck className="h-4 w-4" /> Acreditar</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Instructors() {
  const { data, instructors } = useStore()
  const [modal, setModal] = useState(null) // 'new' | {item}
  const [toDelete, setToDelete] = useState(null)
  const [verifyFor, setVerifyFor] = useState(null)

  const coursesOf = (name) => data.courses.filter((c) => c.instructor === name).length
  const seminarsOf = (name) => data.seminars.filter((s) => s.host === name).length

  const submit = (payload) => {
    if (modal === 'new') {
      instructors.add({ ...payload, verified: false, verifiedBy: '', verifiedAt: null, verifyNote: '' })
    } else {
      instructors.update(modal.item.id, payload)
    }
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Instructores"
        subtitle="Perfiles de quienes dictan tus cursos y seminarios — personas o empresas — con credenciales y acreditación."
        action={<Button onClick={() => setModal('new')}><Plus className="h-4 w-4" /> Nuevo instructor</Button>}
      />

      {data.instructors.length === 0 ? (
        <EmptyState
          icon={<User className="h-10 w-10 text-slate-300" />}
          title="Todavía no hay instructores"
          subtitle="Creá perfiles de instructores (personas o empresas), cargá sus credenciales y acreditalos."
          action={<Button onClick={() => setModal('new')}><Plus className="h-4 w-4" /> Nuevo instructor</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {data.instructors.map((ins) => (
            <div key={ins.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ins.type === 'Empresa' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}>
                  {ins.type === 'Empresa' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{ins.name}</h3>
                    {ins.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700" title={`Verificado por ${ins.verifiedBy} el ${fmtDateTime(ins.verifiedAt)}`}>
                        <BadgeCheck className="h-3.5 w-3.5" /> Acreditado
                      </span>
                    )}
                    <Badge tone={ins.type === 'Empresa' ? 'blue' : 'violet'}>{ins.type}</Badge>
                  </div>
                  {ins.title && <p className="mt-0.5 text-sm text-slate-500">{ins.title}</p>}
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                    {ins.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {ins.email}</span>}
                    {ins.website && (
                      <a href={ins.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                        <Globe className="h-3.5 w-3.5" /> Sitio web
                      </a>
                    )}
                  </p>
                </div>
                <RowActions onEdit={() => setModal({ item: ins })} onDelete={() => setToDelete(ins)} />
              </div>

              {ins.bio && <p className="mt-3 text-sm text-slate-600">{ins.bio}</p>}

              {(ins.credentials || []).length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Credenciales</p>
                  <ul className="space-y-1.5">
                    {ins.credentials.map((c) => (
                      <li key={c.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                        <Award className="h-4 w-4 shrink-0 text-amber-500" />
                        <span className="min-w-0 truncate">
                          <span className="font-medium">{c.name}</span>
                          {c.issuer && <span className="text-slate-500"> — {c.issuer}</span>}
                          {c.year && <span className="text-slate-500"> ({c.year})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ins.verified && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                  Verificado por <span className="font-semibold">{ins.verifiedBy}</span> el {fmtDateTime(ins.verifiedAt)}
                  {ins.verifyNote && <> — {ins.verifyNote}</>}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="flex gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {coursesOf(ins.name)} cursos</span>
                  <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {seminarsOf(ins.name)} seminarios</span>
                </p>
                {ins.verified ? (
                  <Button variant="ghost" onClick={() => instructors.update(ins.id, { verified: false, verifiedBy: '', verifiedAt: null, verifyNote: '' })}>
                    <ShieldOff className="h-4 w-4" /> Quitar acreditación
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => setVerifyFor(ins)}>
                    <ShieldCheck className="h-4 w-4" /> Acreditar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <InstructorFormModal initial={modal === 'new' ? null : modal.item} onClose={() => setModal(null)} onSubmit={submit} />
      )}
      {verifyFor && (
        <VerifyModal
          instructor={verifyFor}
          onClose={() => setVerifyFor(null)}
          onVerify={(by, note) => {
            instructors.update(verifyFor.id, { verified: true, verifiedBy: by, verifiedAt: nowIso(), verifyNote: note })
            setVerifyFor(null)
          }}
        />
      )}
      <ConfirmDelete
        open={!!toDelete}
        name={toDelete?.name}
        onCancel={() => setToDelete(null)}
        onConfirm={() => { instructors.remove(toDelete.id); setToDelete(null) }}
      />
    </div>
  )
}
