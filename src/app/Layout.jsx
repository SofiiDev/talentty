import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, Video, CalendarDays, Target,
  TrendingUp, Gauge, GraduationCap, Settings, Home, Menu, ClipboardList,
} from 'lucide-react'

const sections = [
  {
    title: 'General',
    items: [
      { to: '/app', end: true, label: 'Dashboard', Icon: LayoutDashboard },
      { to: '/app/calendario', label: 'Calendario', Icon: CalendarDays },
    ],
  },
  {
    title: 'Talento',
    items: [
      { to: '/app/talento', label: 'Talento', Icon: Users },
      { to: '/app/planes', label: 'Planes de carrera', Icon: Target },
      { to: '/app/seguimiento', label: 'Seguimiento', Icon: TrendingUp },
      { to: '/app/desempeno', label: 'Desempeño', Icon: Gauge },
    ],
  },
  {
    title: 'Formación',
    items: [
      { to: '/app/cursos', label: 'Cursos', Icon: BookOpen },
      { to: '/app/seminarios', label: 'Seminarios', Icon: Video },
      { to: '/app/entrenador', label: 'Entrenador', Icon: GraduationCap },
      { to: '/app/capacitacion', label: 'Capacitación anual', Icon: ClipboardList },
    ],
  },
  {
    title: 'Sistema',
    items: [{ to: '/app/configuracion', label: 'Configuración', Icon: Settings }],
  },
]

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-black text-white">T</span>
        <span className="text-lg font-bold tracking-tight text-white">talentty</span>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map(({ to, end, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600/80 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
          <Home className="h-4.5 w-4.5" strokeWidth={1.8} /> Volver al sitio
        </Link>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white">SP</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">Sofía Perez</p>
            <p className="truncate text-xs text-slate-400">Admin · People</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-900 lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Topbar mobile */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Abrir menú">
          <Menu className="h-6 w-6" />
        </button>
        <span className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">T</span>
          talentty
        </span>
      </div>

      <main className="px-4 py-8 sm:px-8 lg:ml-64">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
