import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Button, PageHeader, Modal } from '../components/ui.jsx'

export default function Settings() {
  const { data, reset } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `talentty-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader title="Configuración" subtitle="Preferencias de tu espacio de trabajo." />

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Organización</h2>
          <p className="mt-1 text-sm text-slate-500">Datos generales de tu empresa en Talentty.</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ['Empresa', 'Mi Empresa S.A.'],
              ['Plan', 'Growth (demo)'],
              ['Administradora', 'Sofía Perez'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{k}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Integraciones de video</h2>
          <p className="mt-1 text-sm text-slate-500">
            Los seminarios se vinculan pegando el enlace de la sala. Creá tus reuniones desde acá:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="https://zoom.us/meeting/schedule" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50">
              🎦 Programar reunión en Zoom
            </a>
            <a href="https://meet.google.com/new" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">
              📹 Crear reunión en Google Meet
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Datos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Los datos se guardan localmente en tu navegador (demo). Exportá un respaldo o restaurá los datos de ejemplo.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={exportData}>⬇️ Exportar datos (JSON)</Button>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>Restaurar datos de ejemplo</Button>
          </div>
        </section>
      </div>

      <Modal open={confirmReset} title="Restaurar datos de ejemplo" onClose={() => setConfirmReset(false)}>
        <p className="text-sm text-slate-600">
          Esto reemplaza todos los datos actuales por los datos de demostración. ¿Continuar?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={() => {
              reset()
              setConfirmReset(false)
            }}
          >
            Sí, restaurar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
