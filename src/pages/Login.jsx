import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, ArrowLeft, Sparkles } from 'lucide-react'
import { useAuth } from '../auth.jsx'
import { Field, inputCls } from '../components/ui.jsx'

export default function Login() {
  const { enabled, session, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (enabled && !loading && session) return <Navigate to="/app" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email, password)
        if (err) throw err
        navigate('/app')
      } else {
        const { data, error: err } = await signUp(email, password)
        if (err) throw err
        if (data.session) navigate('/app')
        else setInfo('Cuenta creada. Revisá tu correo para confirmarla y después iniciá sesión.')
      }
    } catch (err) {
      const messages = {
        'Invalid login credentials': 'Email o contraseña incorrectos.',
        'User already registered': 'Ya existe una cuenta con ese email. Iniciá sesión.',
        'Email not confirmed': 'Tenés que confirmar tu email antes de entrar. Revisá tu bandeja.',
      }
      setError(messages[err.message] || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="hidden flex-col justify-between bg-slate-900 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-black text-white">T</span>
          talentty
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-snug text-white">
            El talento de tu empresa, siempre en crecimiento.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Cursos, seminarios en vivo, planes de carrera, capacitación regulatoria y seguimiento — todo en un solo lugar.
          </p>
        </div>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} Talentty</p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Volver al sitio
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login' ? 'Entrá a tu espacio de trabajo.' : 'Empezá a gestionar el talento de tu equipo.'}
          </p>

          {enabled ? (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="Email">
                <input className={inputCls} type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@empresa.com" />
              </Field>
              <Field label="Contraseña" hint={mode === 'signup' ? 'Mínimo 6 caracteres' : undefined}>
                <input className={inputCls} type="password" required minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </Field>

              {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
              {info && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
              >
                {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>

              <p className="text-center text-sm text-slate-500">
                {mode === 'login' ? (
                  <>¿No tenés cuenta?{' '}
                    <button type="button" onClick={() => { setMode('signup'); setError('') }} className="font-semibold text-brand-600 hover:text-brand-700">
                      Registrate
                    </button>
                  </>
                ) : (
                  <>¿Ya tenés cuenta?{' '}
                    <button type="button" onClick={() => { setMode('login'); setError('') }} className="font-semibold text-brand-600 hover:text-brand-700">
                      Iniciá sesión
                    </button>
                  </>
                )}
              </p>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                El backend todavía no está configurado en este deploy, así que la autenticación está desactivada.
                Podés recorrer toda la plataforma en modo demo.
              </div>
              <button
                onClick={() => navigate('/app')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <Sparkles className="h-4 w-4" /> Entrar en modo demo
              </button>
              <p className="text-center text-xs text-slate-500">
                Para activar el login: configurá Supabase siguiendo la guía del README.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
