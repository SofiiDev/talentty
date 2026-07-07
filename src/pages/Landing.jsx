import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Target, BookOpen, Video, TrendingUp,
  Webcam, Menu as MenuIcon, CalendarDays, Gauge,
  GraduationCap, Users, FileQuestion, Wallet, BarChart3, Layers,
} from 'lucide-react'

const features = [
  {
    Icon: Target,
    title: 'Planes de carrera personalizados',
    text: 'Diseñá rutas de crecimiento con hitos medibles para cada persona de tu equipo, alineadas a los objetivos del negocio.',
  },
  {
    Icon: BookOpen,
    title: 'Catálogo de cursos propio',
    text: 'Creá y publicá cursos con módulos, niveles y modalidades. Tu academia interna, lista en minutos.',
  },
  {
    Icon: Video,
    title: 'Seminarios en vivo con Zoom y Meet',
    text: 'Programá seminarios profesionales y vinculalos directamente con Zoom o Google Meet. Un clic y todos adentro.',
  },
  {
    Icon: TrendingUp,
    title: 'Seguimiento en tiempo real',
    text: 'Visualizá el progreso de cada inscripción, detectá bloqueos y celebrá los cursos completados.',
  },
  {
    Icon: Gauge,
    title: 'Evaluaciones y matriz 9-box',
    text: 'Medí desempeño y potencial, y visualizá a tu equipo en la matriz de talento que usan las mejores áreas de People.',
  },
  {
    Icon: CalendarDays,
    title: 'Calendario integrado',
    text: 'Agenda mensual de formaciones con exportación a Google Calendar, Outlook y Apple Calendar.',
  },
]

const steps = [
  { n: '01', title: 'Sumá a tu equipo', text: 'Cargá los perfiles de tu talento con sus roles, seniority y habilidades actuales.' },
  { n: '02', title: 'Creá cursos y seminarios', text: 'Armá tu catálogo formativo y agendá sesiones en vivo con Zoom o Google Meet.' },
  { n: '03', title: 'Definí planes de carrera', text: 'Trazá el camino de crecimiento de cada persona con hitos y cursos asociados.' },
  { n: '04', title: 'Medí el progreso', text: 'Seguí cada inscripción y tomá decisiones con datos, no con intuición.' },
]

const plans = [
  {
    name: 'Starter', price: 'Gratis', per: 'para siempre',
    items: ['Hasta 10 perfiles de talento', 'Cursos ilimitados', 'Seminarios con Zoom/Meet', 'Seguimiento básico'],
    cta: 'Empezar gratis', featured: false,
  },
  {
    name: 'Growth', price: 'USD 6', per: 'por usuario / mes',
    items: ['Talento ilimitado', 'Planes de carrera avanzados', 'Métricas y reportes', 'Soporte prioritario'],
    cta: 'Probar 14 días gratis', featured: true,
  },
  {
    name: 'Enterprise', price: 'A medida', per: 'facturación anual',
    items: ['SSO y permisos avanzados', 'Integraciones a medida', 'Onboarding dedicado', 'SLA garantizado'],
    cta: 'Hablar con ventas', featured: false,
  },
]

const testimonials = [
  {
    quote: 'En 3 meses duplicamos la participación en formaciones internas. El seguimiento por persona nos cambió la forma de trabajar el desarrollo de talento.',
    name: 'Valentina Ríos', role: 'Head of People · Nubia Tech',
  },
  {
    quote: 'Los planes de carrera con hitos vinculados a cursos hicieron tangible algo que antes era una promesa en la evaluación de desempeño.',
    name: 'Martín Acosta', role: 'CTO · Kualia',
  },
  {
    quote: 'Programar seminarios con Meet desde la misma plataforma nos ahorró horas de coordinación cada semana.',
    name: 'Camila Duarte', role: 'L&D Manager · Grupo Andino',
  },
]

function Nav() {
  const [open, setOpen] = useState(false)
  const links = [
    ['#producto', 'Producto'],
    ['#como-funciona', 'Cómo funciona'],
    ['#instructores', 'Dá tu curso'],
    ['#precios', 'Precios'],
    ['#testimonios', 'Clientes'],
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-sm font-black text-white">T</span>
          talentty
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-brand-700">{label}</a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/app" className="text-sm font-medium text-slate-600 hover:text-brand-700">Iniciar sesión</Link>
          <Link to="/app" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
            Probar gratis
          </Link>
        </div>
        <button className="rounded-lg p-2 text-slate-600 md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
          <MenuIcon className="h-6 w-6" />
        </button>
      </nav>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-slate-600">{label}</a>
          ))}
          <Link to="/app" className="mt-3 block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white">Probar gratis</Link>
        </div>
      )}
    </header>
  )
}

function HeroMock() {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-brand-900/10">
      <div className="mb-3 flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Talento activo', '48', 'bg-brand-50 text-brand-800'],
          ['Cursos en curso', '12', 'bg-violet-50 text-violet-800'],
          ['Progreso medio', '67%', 'bg-sky-50 text-sky-800'],
        ].map(([label, value, cls]) => (
          <div key={label} className={`rounded-xl p-3 ${cls}`}>
            <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[
          ['React Avanzado', 72, 'bg-brand-500'],
          ['Data Analytics', 45, 'bg-violet-500'],
          ['Liderazgo Técnico', 90, 'bg-sky-500'],
        ].map(([name, pct, color]) => (
          <div key={name} className="rounded-lg border border-slate-100 p-2.5">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600">
              <span>{name}</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute -right-4 -bottom-4 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
        <p className="text-xs text-slate-500">Próximo seminario</p>
        <p className="text-sm font-semibold text-slate-800">🎥 Hoy 18:00 · Zoom</p>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="bg-white text-slate-900">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_10%,#ccfbf1_0%,transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              ✨ La plataforma de upskilling para equipos que crecen
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              El talento de tu empresa,{' '}
              <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
                siempre en crecimiento
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Talentty es la plataforma edtech que centraliza la capacitación de tus profesionales:
              cursos, seminarios en vivo, planes de carrera y seguimiento del progreso, todo en un solo lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/app" className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700">
                Empezar gratis →
              </Link>
              <a href="#como-funciona" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
                Ver cómo funciona
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">Sin tarjeta de crédito · Configuración en 5 minutos</p>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* Logos */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Equipos que ya desarrollan su talento con Talentty
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-bold text-slate-300">
            <span>NUBIA TECH</span><span>Kualia</span><span>GRUPO ANDINO</span><span>fintia</span><span>SUR Labs</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="producto" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Todo lo que necesitás para hacer crecer a tu equipo</h2>
          <p className="mt-4 text-lg text-slate-600">
            Una sola plataforma para gestionar talento, formar profesionales y medir resultados.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Así funciona</h2>
            <p className="mt-4 text-lg text-slate-300">De cero a una cultura de aprendizaje continuo en cuatro pasos.</p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="text-sm font-bold text-brand-400">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Seminarios en vivo, sin fricción</h2>
            <p className="mt-4 text-lg text-slate-600">
              Agendá seminarios profesionales y vinculalos con <strong>Zoom</strong> o <strong>Google Meet</strong> en segundos.
              Tus profesionales reciben el enlace correcto, en la fecha correcta, siempre.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              {[
                'Vinculá cada seminario con su sala de Zoom o Meet',
                'Asociá seminarios a cursos de tu catálogo',
                'Gestioná asistentes desde tu base de talento',
                'Un clic para unirse desde la plataforma',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">✓</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><Video className="h-6 w-6" /></span>
                <div>
                  <p className="font-semibold">Zoom</p>
                  <p className="text-sm text-slate-500">Seminarios y cohortes en vivo con tu sala de Zoom.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Webcam className="h-6 w-6" /></span>
                <div>
                  <p className="font-semibold">Google Meet</p>
                  <p className="text-sm text-slate-500">Sesiones rápidas y workshops directamente en Meet.</p>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                Próximamente: Teams, calendario y recordatorios automáticos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dá tu curso o seminario */}
      <section id="instructores" className="bg-gradient-to-b from-slate-900 to-slate-800 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-400/10 px-3 py-1 text-xs font-semibold text-brand-300">
              <GraduationCap className="h-3.5 w-3.5" /> Para especialistas e instructores
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Dá tu curso o seminario en Talentty</h2>
            <p className="mt-4 text-lg text-slate-300">
              ¿Sos especialista en tu campo? Ofrecé tus cursos y seminarios profesionales a las empresas que ya
              capacitan a sus equipos en la plataforma, sin armar infraestructura propia.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: Users,
                title: 'Audiencia corporativa lista',
                text: 'Llegás a equipos completos que ya se capacitan en Talentty: tus alumnos vienen con su empresa, no de a uno.',
              },
              {
                Icon: Layers,
                title: 'Estructurá por unidades temáticas',
                text: 'Armá tu curso en unidades y lecciones con video, PDFs y materiales. El editor hace el trabajo pesado por vos.',
              },
              {
                Icon: FileQuestion,
                title: 'Exámenes con corrección automática',
                text: 'Creá exámenes de opción múltiple que se corrigen solos y sumá preguntas abiertas con corrección manual cuando importa el criterio.',
              },
              {
                Icon: Video,
                title: 'Seminarios en vivo sin fricción',
                text: 'Agendá sesiones con Zoom o Google Meet, gestioná asistentes y compartí el temario y los materiales en un solo lugar.',
              },
              {
                Icon: BarChart3,
                title: 'Métricas de tus alumnos',
                text: 'Progreso por lección, resultados de exámenes, reseñas y certificados emitidos: sabés exactamente cómo va cada cohorte.',
              },
              {
                Icon: Wallet,
                title: 'Monetizá tu conocimiento',
                text: 'Tu marca, tus contenidos, tus tarifas. Talentty pone la plataforma, la audiencia y la operación.',
              },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/15 text-brand-300">
                  <b.Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{b.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/app/entrenador"
              className="inline-block rounded-xl bg-brand-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400"
            >
              Empezar a dar clases →
            </Link>
            <p className="mt-3 text-sm text-slate-400">Probá el estudio del entrenador con la demo, sin registrarte.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Lo que dicen nuestros clientes</h2>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 text-brand-500">★★★★★</div>
                <blockquote className="text-sm leading-relaxed text-slate-700">“{t.quote}”</blockquote>
                <figcaption className="mt-5">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Precios simples y transparentes</h2>
          <p className="mt-4 text-lg text-slate-600">Empezá gratis y escalá cuando tu equipo lo necesite.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 ${
                p.featured ? 'border-brand-500 bg-white shadow-xl shadow-brand-600/10' : 'border-slate-200 bg-white'
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Más elegido
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-3 text-4xl font-extrabold">{p.price}</p>
              <p className="text-sm text-slate-500">{p.per}</p>
              <ul className="mt-6 space-y-3">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-700">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/app"
                className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                  p.featured
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold sm:text-4xl">Tu equipo no espera. Su crecimiento tampoco.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Creá tu cuenta gratis y empezá a construir la academia interna de tu empresa hoy mismo.
          </p>
          <Link to="/app" className="mt-8 inline-block rounded-xl bg-white px-8 py-3 text-base font-semibold text-brand-800 shadow-lg hover:bg-brand-50">
            Ir a la plataforma →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-xs font-black text-white">T</span>
              talentty
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#producto" className="hover:text-brand-700">Producto</a>
              <a href="#precios" className="hover:text-brand-700">Precios</a>
              <Link to="/app" className="hover:text-brand-700">Plataforma</Link>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Talentty. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
