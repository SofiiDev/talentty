import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'talentty-data-v1'

const uid = () => Math.random().toString(36).slice(2, 10)

const seed = () => ({
  talents: [
    {
      id: 't1', name: 'María González', email: 'maria.gonzalez@empresa.com',
      role: 'Frontend Developer', department: 'Ingeniería', level: 'Semi Senior',
      skills: ['React', 'TypeScript', 'CSS'], status: 'Activo', joinedAt: '2024-03-12',
    },
    {
      id: 't2', name: 'Julián Pérez', email: 'julian.perez@empresa.com',
      role: 'Data Analyst', department: 'Datos', level: 'Junior',
      skills: ['SQL', 'Python', 'Power BI'], status: 'Activo', joinedAt: '2024-08-01',
    },
    {
      id: 't3', name: 'Lucía Fernández', email: 'lucia.fernandez@empresa.com',
      role: 'Product Manager', department: 'Producto', level: 'Senior',
      skills: ['Discovery', 'OKRs', 'Analytics'], status: 'Activo', joinedAt: '2023-11-20',
    },
    {
      id: 't4', name: 'Carlos Ruiz', email: 'carlos.ruiz@empresa.com',
      role: 'Backend Developer', department: 'Ingeniería', level: 'Senior',
      skills: ['Node.js', 'PostgreSQL', 'AWS'], status: 'Licencia', joinedAt: '2022-05-09',
    },
  ],
  courses: [
    {
      id: 'c1', title: 'React Avanzado y Arquitectura Frontend',
      description: 'Patrones avanzados, performance y arquitectura de aplicaciones React a escala.',
      category: 'Desarrollo', level: 'Avanzado', durationHours: 24,
      modality: 'Online en vivo', instructor: 'Ana Torres', status: 'Publicado',
      modules: [
        { id: 'm1', title: 'Hooks avanzados y composición' },
        { id: 'm2', title: 'Gestión de estado a escala' },
        { id: 'm3', title: 'Performance y rendering' },
      ],
      createdAt: '2026-05-02',
    },
    {
      id: 'c2', title: 'Fundamentos de Data Analytics',
      description: 'SQL, visualización y storytelling con datos para perfiles no técnicos.',
      category: 'Datos', level: 'Inicial', durationHours: 16,
      modality: 'Autogestionado', instructor: 'Diego Silva', status: 'Publicado',
      modules: [
        { id: 'm1', title: 'Introducción a SQL' },
        { id: 'm2', title: 'Dashboards y visualización' },
      ],
      createdAt: '2026-04-18',
    },
    {
      id: 'c3', title: 'Liderazgo para líderes técnicos',
      description: 'Herramientas de gestión de equipos, feedback y comunicación para tech leads.',
      category: 'Liderazgo', level: 'Intermedio', durationHours: 12,
      modality: 'Online en vivo', instructor: 'Sofía Perez', status: 'Borrador',
      modules: [{ id: 'm1', title: 'Feedback efectivo' }],
      createdAt: '2026-06-10',
    },
  ],
  seminars: [
    {
      id: 's1', title: 'Kickoff: React Avanzado — Cohorte Julio', courseId: 'c1',
      platform: 'zoom', link: 'https://zoom.us/j/98217341234',
      date: '2026-07-14', time: '18:00', durationMin: 90, host: 'Ana Torres',
      attendees: ['t1', 't4'], status: 'Programado',
    },
    {
      id: 's2', title: 'Workshop: Storytelling con datos', courseId: 'c2',
      platform: 'meet', link: 'https://meet.google.com/abc-defg-hij',
      date: '2026-07-21', time: '10:00', durationMin: 60, host: 'Diego Silva',
      attendees: ['t2', 't3'], status: 'Programado',
    },
  ],
  plans: [
    {
      id: 'p1', talentId: 't1', title: 'Camino a Senior Frontend',
      targetRole: 'Senior Frontend Developer', startDate: '2026-06-01', endDate: '2026-12-15',
      status: 'En curso', notes: 'Foco en arquitectura y mentoría de juniors.',
      milestones: [
        { id: 'h1', title: 'Completar curso React Avanzado', courseId: 'c1', done: false },
        { id: 'h2', title: 'Liderar un proyecto end-to-end', courseId: '', done: true },
        { id: 'h3', title: 'Mentorear a un dev junior', courseId: '', done: false },
      ],
    },
    {
      id: 'p2', talentId: 't2', title: 'De Analyst a Data Engineer',
      targetRole: 'Data Engineer', startDate: '2026-07-01', endDate: '2027-03-01',
      status: 'En curso', notes: '',
      milestones: [
        { id: 'h1', title: 'Fundamentos de Data Analytics', courseId: 'c2', done: false },
        { id: 'h2', title: 'Certificación cloud (AWS/GCP)', courseId: '', done: false },
      ],
    },
  ],
  enrollments: [
    { id: 'e1', talentId: 't1', courseId: 'c1', progress: 35, status: 'En curso', enrolledAt: '2026-06-05' },
    { id: 'e2', talentId: 't2', courseId: 'c2', progress: 70, status: 'En curso', enrolledAt: '2026-05-20' },
    { id: 'e3', talentId: 't3', courseId: 'c2', progress: 100, status: 'Completado', enrolledAt: '2026-04-25' },
    { id: 'e4', talentId: 't4', courseId: 'c1', progress: 10, status: 'En curso', enrolledAt: '2026-06-12' },
  ],
  frameworks: [
    {
      id: 'fw1', code: 'ANMAT', name: 'ANMAT — Disp. 3827/2018 (BPF)',
      description: 'Buenas Prácticas de Fabricación: el personal debe recibir capacitación inicial y continua, documentada y acorde a las funciones asignadas.',
    },
    {
      id: 'fw2', code: 'INAME', name: 'INAME — Instituto Nacional de Medicamentos',
      description: 'Requisitos de formación y calificación para personal de laboratorios de control de calidad y ensayos.',
    },
    {
      id: 'fw3', code: 'BPF/GMP', name: 'OMS — Buenas Prácticas de Fabricación',
      description: 'Lineamientos internacionales de GMP: programa de capacitación aprobado y evaluación de su eficacia.',
    },
    {
      id: 'fw4', code: 'ISO 9001', name: 'ISO 9001:2015 — Cap. 7.2 Competencia',
      description: 'Determinar competencias necesarias, asegurar la formación y conservar información documentada como evidencia.',
    },
  ],
  jobFunctions: [
    {
      id: 'jf1', name: 'Responsable de Garantía de Calidad', area: 'Calidad',
      description: 'Aprueba procedimientos, gestiona desviaciones y acciones CAPA.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-014 Manejo de desviaciones y CAPA', 'BPF avanzado'],
      members: ['t3'],
    },
    {
      id: 'jf2', name: 'Analista de Control de Calidad', area: 'Laboratorio',
      description: 'Ejecuta ensayos fisicoquímicos y microbiológicos según especificaciones.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-022 Buenas prácticas de laboratorio'],
      members: ['t2'],
    },
    {
      id: 'jf3', name: 'Operario de Producción', area: 'Producción',
      description: 'Opera equipos de elaboración y acondicionamiento en áreas limpias.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-008 Vestimenta en áreas limpias'],
      members: ['t1', 't4'],
    },
  ],
  annualPlans: [
    {
      id: 'ap1', year: 2026, title: 'Plan Anual de Capacitación 2026 — Planta',
      area: 'Toda la planta', responsible: 'Lucía Fernández', status: 'Aprobado',
      frameworkIds: ['fw1', 'fw3'],
      notes: 'Revisión trimestral por Garantía de Calidad. Los registros de asistencia y evaluación se archivan en el legajo de capacitación de cada empleado.',
      items: [
        { id: 'i1', code: 'POE-001', title: 'Higiene y conducta del personal', type: 'POE / Procedimiento', frequency: 'Anual', month: 'Marzo', functionIds: ['jf1', 'jf2', 'jf3'], courseId: '', status: 'Completado' },
        { id: 'i2', code: 'POE-008', title: 'Vestimenta en áreas limpias', type: 'POE / Procedimiento', frequency: 'Semestral', month: 'Abril', functionIds: ['jf3'], courseId: '', status: 'En curso' },
        { id: 'i3', code: 'CAP-002', title: 'Introducción a BPF (ANMAT 3827/18)', type: 'Curso', frequency: 'Anual', month: 'Mayo', functionIds: ['jf1', 'jf2', 'jf3'], courseId: '', status: 'Programado' },
        { id: 'i4', code: 'POE-014', title: 'Manejo de desviaciones y CAPA', type: 'Taller', frequency: 'Anual', month: 'Agosto', functionIds: ['jf1'], courseId: '', status: 'Pendiente' },
      ],
    },
  ],
  assessments: [
    {
      id: 'as1', title: 'Evaluación BPF básica 2026',
      description: 'Evaluación de eficacia de la capacitación POE-001, requerida por BPF (ANMAT Disp. 3827/2018).',
      planId: 'ap1', passScore: 70, createdAt: '2026-06-15',
      questions: [
        {
          id: 'q1', text: '¿Cuándo debe realizarse el lavado de manos en planta?',
          options: ['Solo al inicio del turno', 'Cada vez que se ingresa al área productiva', 'Una vez por semana'], correct: 1,
        },
        {
          id: 'q2', text: '¿Qué debe hacerse ante una desviación de un procedimiento?',
          options: ['Continuar y avisar al final del día', 'Registrarla e informar inmediatamente al supervisor', 'Nada si no afecta al producto'], correct: 1,
        },
      ],
      recipients: [
        { talentId: 't1', status: 'Aprobada', score: 90, sentAt: '2026-06-16' },
        { talentId: 't2', status: 'Enviada', score: null, sentAt: '2026-06-16' },
      ],
    },
  ],
  evaluations: [
    {
      id: 'ev1', talentId: 't1', period: '2026 H1', performance: 4, potential: 4,
      strengths: 'Gran calidad técnica y ownership de sus entregas.',
      areas: 'Delegar más y ganar visibilidad con stakeholders.', createdAt: '2026-06-30',
    },
    {
      id: 'ev2', talentId: 't2', period: '2026 H1', performance: 3, potential: 5,
      strengths: 'Curva de aprendizaje muy rápida, gran actitud.',
      areas: 'Profundizar en fundamentos de ingeniería de datos.', createdAt: '2026-06-30',
    },
    {
      id: 'ev3', talentId: 't3', period: '2026 H1', performance: 5, potential: 3,
      strengths: 'Referente del equipo de producto, excelente ejecución.',
      areas: 'Explorar interés en roles de liderazgo.', createdAt: '2026-06-28',
    },
    {
      id: 'ev4', talentId: 't4', period: '2026 H1', performance: 4, potential: 2,
      strengths: 'Especialista sólido en backend y arquitectura.',
      areas: 'Actualizar stack cloud y compartir conocimiento.', createdAt: '2026-06-27',
    },
  ],
})

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // Los datos guardados con versiones previas pueden no tener todas las colecciones:
    // las que falten se completan desde los datos de ejemplo
    if (raw) return { ...seed(), ...JSON.parse(raw) }
  } catch { /* datos corruptos: se regeneran */ }
  return seed()
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const makeCrud = (key) => ({
    add: (item) => {
      const withId = { id: uid(), ...item }
      setData((d) => ({ ...d, [key]: [withId, ...d[key]] }))
      return withId
    },
    update: (id, patch) =>
      setData((d) => ({
        ...d,
        [key]: d[key].map((it) => (it.id === id ? { ...it, ...patch } : it)),
      })),
    remove: (id) =>
      setData((d) => ({ ...d, [key]: d[key].filter((it) => it.id !== id) })),
  })

  const api = {
    data,
    talents: makeCrud('talents'),
    courses: makeCrud('courses'),
    seminars: makeCrud('seminars'),
    plans: makeCrud('plans'),
    enrollments: makeCrud('enrollments'),
    evaluations: makeCrud('evaluations'),
    frameworks: makeCrud('frameworks'),
    jobFunctions: makeCrud('jobFunctions'),
    annualPlans: makeCrud('annualPlans'),
    assessments: makeCrud('assessments'),
    reset: () => setData(seed()),
    talentById: (id) => data.talents.find((t) => t.id === id),
    courseById: (id) => data.courses.find((c) => c.id === id),
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
