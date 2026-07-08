import { createContext, useContext, useEffect, useState } from 'react'
import { isRemoteEnabled, loadRemote, saveRemoteDebounced } from './lib/supabase.js'

const STORAGE_KEY = 'talentty-data-v3'

const uid = () => Math.random().toString(36).slice(2, 10)

const seed = () => ({
  locations: [
    { id: 'l1', name: 'Planta Central', type: 'Planta productiva', address: 'Av. Industrial 1250', city: 'Buenos Aires, Argentina', status: 'Operativa' },
    { id: 'l2', name: 'Laboratorio Córdoba', type: 'Laboratorio de control', address: 'Ruta 9 km 695', city: 'Córdoba, Argentina', status: 'Operativa' },
    { id: 'l3', name: 'Depósito Pilar', type: 'Depósito / Logística', address: 'Parque Industrial Pilar, Lote 14', city: 'Pilar, Buenos Aires', status: 'Operativa' },
  ],
  talents: [
    {
      id: 't1', name: 'María González', email: 'maria.gonzalez@laboratorio.com', notifyEmail: '',
      role: 'Analista de Control de Calidad', department: 'Laboratorio', level: 'Semi Senior',
      skills: ['HPLC', 'BPL', 'Farmacopea'], status: 'Activo', joinedAt: '2024-03-12', locationId: 'l1',
    },
    {
      id: 't2', name: 'Julián Pérez', email: 'julian.perez@laboratorio.com', notifyEmail: '',
      role: 'Analista de Microbiología', department: 'Laboratorio', level: 'Junior',
      skills: ['Microbiología', 'Ambientes controlados'], status: 'Activo', joinedAt: '2024-08-01', locationId: 'l1',
    },
    {
      id: 't3', name: 'Lucía Fernández', email: 'lucia.fernandez@laboratorio.com', notifyEmail: '',
      role: 'Responsable de Garantía de Calidad', department: 'Calidad', level: 'Senior',
      skills: ['BPF', 'Desviaciones y CAPA', 'Auditorías'], status: 'Activo', joinedAt: '2023-11-20', locationId: 'l1',
    },
    {
      id: 't4', name: 'Carlos Ruiz', email: 'carlos.ruiz@laboratorio.com', notifyEmail: '',
      role: 'Supervisor de Producción', department: 'Producción', level: 'Senior',
      skills: ['Áreas limpias', 'Elaboración', 'Acondicionamiento'], status: 'Licencia', joinedAt: '2022-05-09', locationId: 'l2',
    },
    {
      id: 't5', name: 'Ana Torres', email: 'ana.torres@laboratorio.com', notifyEmail: '',
      role: 'Directora Técnica', department: 'Dirección Técnica', level: 'Lead',
      skills: ['BPF', 'Regulatorio ANMAT', 'Liberación de lotes'], status: 'Activo', joinedAt: '2021-02-15', locationId: 'l1',
    },
    {
      id: 't6', name: 'Diego Silva', email: 'diego.silva@laboratorio.com', notifyEmail: '',
      role: 'Responsable de Validaciones', department: 'Ingeniería', level: 'Senior',
      skills: ['Calificación de equipos', 'Validación de procesos'], status: 'Activo', joinedAt: '2023-06-01', locationId: 'l2',
    },
  ],
  courses: [
    {
      id: 'c1', title: 'BPF para personal de planta (ANMAT 3827/18)',
      description: 'Buenas Prácticas de Fabricación aplicadas: higiene, documentación, contaminación cruzada y cultura de calidad.',
      category: 'Calidad', level: 'Inicial', durationHours: 12,
      modality: 'Online en vivo', instructor: 'Lucía Fernández', status: 'Publicado', featured: true,
      coverImageUrl: '', introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      attachments: [
        { id: 'a1', name: 'POE-001 Higiene y conducta (PDF)', url: 'https://example.com/poe-001.pdf' },
        { id: 'a2', name: 'Disposición ANMAT 3827/2018 (PDF)', url: 'https://example.com/anmat-3827.pdf' },
      ],
      units: [
        {
          id: 'u1', title: 'Fundamentos de BPF', description: 'Marco normativo, responsabilidades y cultura de calidad.',
          lessons: [
            { id: 'le1', title: 'Introducción a las BPF', description: 'Marco normativo, responsabilidades y trazabilidad.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', fileUrl: 'https://example.com/modulo-1.pdf' },
            { id: 'le2', title: 'Documentación y registros (ALCOA+)', description: 'Buenas prácticas de documentación.', videoUrl: '', fileUrl: 'https://example.com/alcoa.pdf' },
          ],
        },
        {
          id: 'u2', title: 'Higiene y conducta del personal', description: 'Comportamiento en planta y prevención de contaminación.',
          lessons: [
            { id: 'le3', title: 'Higiene y lavado de manos', description: 'Lavado de manos y circulación en planta.', videoUrl: '', fileUrl: '' },
            { id: 'le4', title: 'Vestimenta según clasificación de áreas', description: 'Gowning por clase de área.', videoUrl: '', fileUrl: '' },
          ],
        },
      ],
      createdAt: '2026-05-02',
    },
    {
      id: 'c2', title: 'Técnicas de HPLC y buenas prácticas de laboratorio',
      description: 'Operación, calibración y verificación de sistemas HPLC. Integridad de datos en el laboratorio.',
      category: 'Laboratorio', level: 'Intermedio', durationHours: 16,
      modality: 'Híbrido', instructor: 'Ana Torres', status: 'Publicado',
      coverImageUrl: '', introVideoUrl: '',
      attachments: [{ id: 'a1', name: 'Guía de integridad de datos (PDF)', url: 'https://example.com/integridad.pdf' }],
      units: [
        {
          id: 'u1', title: 'Operación de sistemas HPLC', description: 'De la teoría a la rutina del laboratorio.',
          lessons: [
            { id: 'le1', title: 'Fundamentos de cromatografía', description: 'Principios de separación y detección.', videoUrl: '', fileUrl: '' },
            { id: 'le2', title: 'Calibración y verificación del sistema', description: 'SST, curvas y criterios de aceptación.', videoUrl: '', fileUrl: '' },
          ],
        },
      ],
      createdAt: '2026-04-18',
    },
    {
      id: 'c3', title: 'Vestimenta y comportamiento en áreas limpias',
      description: 'Clasificación de áreas, gowning y monitoreo ambiental para personal de producción.',
      category: 'Producción', level: 'Inicial', durationHours: 6,
      modality: 'Presencial', instructor: 'Carlos Ruiz', status: 'Borrador',
      coverImageUrl: '', introVideoUrl: '',
      attachments: [],
      units: [
        {
          id: 'u1', title: 'Vestimenta en áreas limpias', description: 'Procedimientos de ingreso y gowning.',
          lessons: [{ id: 'le1', title: 'Procedimiento de gowning', description: 'Secuencia de vestimenta por clase de área.', videoUrl: '', fileUrl: '' }],
        },
      ],
      createdAt: '2026-06-10',
    },
  ],
  seminars: [
    {
      id: 's1', title: 'Kickoff: BPF para personal de planta — Cohorte Julio', courseId: 'c1',
      description: 'Primera sesión en vivo de la cohorte: presentación del programa, cronograma y evaluación de eficacia.',
      platform: 'zoom', link: 'https://zoom.us/j/98217341234',
      videoUrl: '', imageUrl: '',
      materials: [{ id: 'mat1', name: 'Agenda de la cohorte (PDF)', url: 'https://example.com/agenda.pdf' }],
      agenda: [
        { id: 'ag1', title: 'Bienvenida y presentación del programa', description: 'Objetivos, cronograma y modalidad de evaluación.', durationMin: 20 },
        { id: 'ag2', title: 'BPF en la práctica diaria', description: 'Casos reales de la planta y errores frecuentes.', durationMin: 50 },
        { id: 'ag3', title: 'Preguntas y cierre', description: '', durationMin: 20 },
      ],
      date: '2026-07-14', time: '10:00', durationMin: 90, host: 'Lucía Fernández',
      attendees: ['t1', 't2', 't4'], status: 'Programado',
    },
    {
      id: 's2', title: 'Workshop: Integridad de datos en el laboratorio', courseId: 'c2',
      description: 'Casos prácticos de ALCOA+ y hallazgos frecuentes en inspecciones.',
      platform: 'meet', link: 'https://meet.google.com/abc-defg-hij',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', imageUrl: '',
      materials: [],
      agenda: [
        { id: 'ag1', title: 'ALCOA+ aplicado al laboratorio', description: 'Principios y ejemplos en registros analíticos.', durationMin: 30 },
        { id: 'ag2', title: 'Hallazgos frecuentes en inspecciones', description: 'Qué miran ANMAT y FDA.', durationMin: 30 },
      ],
      date: '2026-07-21', time: '14:00', durationMin: 60, host: 'Ana Torres',
      attendees: ['t1', 't2'], status: 'Programado',
    },
  ],
  plans: [
    {
      id: 'p1', talentId: 't1', title: 'Camino a Jefa de Control de Calidad',
      targetRole: 'Jefa de Control de Calidad', startDate: '2026-06-01', endDate: '2027-06-30',
      status: 'En curso', notes: 'Incluye formación en gestión de equipos y auditorías internas.',
      milestones: [
        { id: 'h1', title: 'Completar curso de HPLC avanzado', courseId: 'c2', done: false },
        { id: 'h2', title: 'Liderar una investigación de resultado fuera de especificación (OOS)', courseId: '', done: true },
        { id: 'h3', title: 'Participar como auditora interna', courseId: '', done: false },
      ],
    },
    {
      id: 'p2', talentId: 't2', title: 'Especialista en Microbiología',
      targetRole: 'Analista Senior de Microbiología', startDate: '2026-07-01', endDate: '2027-03-01',
      status: 'En curso', notes: '',
      milestones: [
        { id: 'h1', title: 'Curso BPF para personal de planta', courseId: 'c1', done: false },
        { id: 'h2', title: 'Calificación en monitoreo ambiental', courseId: '', done: false },
      ],
    },
  ],
  enrollments: [
    { id: 'e1', talentId: 't1', courseId: 'c2', progress: 35, status: 'En curso', enrolledAt: '2026-06-05' },
    { id: 'e2', talentId: 't2', courseId: 'c1', progress: 70, status: 'En curso', enrolledAt: '2026-05-20', dueDate: '2026-08-15' },
    { id: 'e3', talentId: 't3', courseId: 'c1', progress: 100, status: 'Completado', enrolledAt: '2026-04-25', completedAt: '2026-06-28T15:40:00.000Z' },
    { id: 'e4', talentId: 't4', courseId: 'c3', progress: 10, status: 'En curso', enrolledAt: '2026-06-12', dueDate: '2026-06-30' },
    { id: 'e5', talentId: 't6', courseId: 'c2', progress: 55, status: 'En curso', enrolledAt: '2026-06-01' },
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
  // Posiciones típicas de un laboratorio farmacéutico
  jobFunctions: [
    {
      id: 'jf1', name: 'Director/a Técnico/a', area: 'Dirección Técnica',
      description: 'Responsable legal ante ANMAT. Libera lotes y garantiza el cumplimiento de BPF.',
      requiredTraining: ['BPF avanzado', 'Normativa ANMAT vigente', 'POE-030 Liberación de lotes'],
      members: ['t5'],
    },
    {
      id: 'jf2', name: 'Co-Director/a Técnico/a', area: 'Dirección Técnica',
      description: 'Reemplaza al Director Técnico en sus funciones ante ausencia.',
      requiredTraining: ['BPF avanzado', 'Normativa ANMAT vigente'],
      members: [],
    },
    {
      id: 'jf3', name: 'Responsable de Garantía de Calidad', area: 'Calidad',
      description: 'Aprueba procedimientos, gestiona desviaciones, CAPA y revisiones anuales de producto.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-014 Manejo de desviaciones y CAPA', 'BPF avanzado'],
      members: ['t3'],
    },
    {
      id: 'jf4', name: 'Jefe/a de Control de Calidad', area: 'Laboratorio',
      description: 'Dirige el laboratorio de control: especificaciones, resultados OOS y aprobación de análisis.',
      requiredTraining: ['POE-022 Buenas prácticas de laboratorio', 'POE-025 Investigación de OOS'],
      members: [],
    },
    {
      id: 'jf5', name: 'Analista de Control de Calidad (Fisicoquímico)', area: 'Laboratorio',
      description: 'Ejecuta ensayos fisicoquímicos según farmacopea y especificaciones internas.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-022 Buenas prácticas de laboratorio', 'Calificación en HPLC'],
      members: ['t1'],
    },
    {
      id: 'jf6', name: 'Analista de Microbiología', area: 'Laboratorio',
      description: 'Ensayos microbiológicos, monitoreo ambiental y control de aguas.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-040 Técnicas asépticas', 'POE-041 Monitoreo ambiental'],
      members: ['t2'],
    },
    {
      id: 'jf7', name: 'Jefe/a de Producción', area: 'Producción',
      description: 'Planifica y supervisa la elaboración y el acondicionamiento de productos.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-008 Vestimenta en áreas limpias', 'BPF avanzado'],
      members: [],
    },
    {
      id: 'jf8', name: 'Supervisor/a de Producción', area: 'Producción',
      description: 'Supervisa líneas de elaboración, registros de lote y despeje de línea.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-008 Vestimenta en áreas limpias', 'POE-012 Despeje de línea'],
      members: ['t4'],
    },
    {
      id: 'jf9', name: 'Operario/a de Producción', area: 'Producción',
      description: 'Opera equipos de elaboración y acondicionamiento en áreas limpias.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-008 Vestimenta en áreas limpias'],
      members: [],
    },
    {
      id: 'jf10', name: 'Responsable de Validaciones', area: 'Ingeniería',
      description: 'Calificación de equipos e instalaciones y validación de procesos y limpieza.',
      requiredTraining: ['POE-050 Plan Maestro de Validación', 'POE-051 Calificación de equipos'],
      members: ['t6'],
    },
    {
      id: 'jf11', name: 'Responsable de Asuntos Regulatorios', area: 'Regulatorio',
      description: 'Registros sanitarios, trámites ante ANMAT y vigilancia normativa.',
      requiredTraining: ['Normativa ANMAT vigente', 'POE-060 Gestión de cambios regulatorios'],
      members: [],
    },
    {
      id: 'jf12', name: 'Responsable de Almacén y Logística', area: 'Depósito',
      description: 'Recepción, almacenamiento, cuarentena y despacho de materiales y productos.',
      requiredTraining: ['POE-070 Buenas prácticas de almacenamiento', 'POE-071 Cadena de frío'],
      members: [],
    },
    {
      id: 'jf13', name: 'Responsable de Mantenimiento e Ingeniería', area: 'Ingeniería',
      description: 'Mantenimiento preventivo y correctivo de equipos y sistemas críticos (HVAC, agua).',
      requiredTraining: ['POE-080 Mantenimiento preventivo', 'POE-081 Sistemas de agua purificada'],
      members: [],
    },
    {
      id: 'jf14', name: 'Muestreador/a', area: 'Laboratorio',
      description: 'Toma de muestras de materias primas, materiales y productos.',
      requiredTraining: ['POE-001 Higiene y conducta del personal', 'POE-023 Técnicas de muestreo'],
      members: [],
    },
    {
      id: 'jf15', name: 'Responsable de Farmacovigilancia', area: 'Regulatorio',
      description: 'Gestión de eventos adversos y reportes periódicos de seguridad.',
      requiredTraining: ['Farmacovigilancia — normativa ANMAT', 'POE-090 Gestión de eventos adversos'],
      members: [],
    },
    {
      id: 'jf16', name: 'Responsable de Capacitación (RRHH)', area: 'Recursos Humanos',
      description: 'Administra el plan anual de capacitación y los legajos de formación.',
      requiredTraining: ['POE-100 Gestión de la capacitación', 'BPF básico'],
      members: [],
    },
  ],
  annualPlans: [
    {
      id: 'ap1', year: 2026, title: 'Plan Anual de Capacitación 2026 — Planta',
      area: 'Toda la planta', responsible: 'Lucía Fernández', status: 'Aprobado',
      frameworkIds: ['fw1', 'fw3'],
      participantIds: ['t1', 't2', 't3', 't4', 't5', 't6'],
      notes: 'Revisión trimestral por Garantía de Calidad. Los registros de asistencia y evaluación se archivan en el legajo de capacitación de cada empleado.',
      items: [
        { id: 'i1', code: 'POE-001', title: 'Higiene y conducta del personal', type: 'POE / Procedimiento', frequency: 'Anual', month: 'Marzo', functionIds: ['jf3', 'jf5', 'jf6', 'jf8', 'jf9', 'jf14'], courseId: '', status: 'Completado' },
        { id: 'i2', code: 'POE-008', title: 'Vestimenta en áreas limpias', type: 'POE / Procedimiento', frequency: 'Semestral', month: 'Abril', functionIds: ['jf8', 'jf9'], courseId: 'c3', status: 'En curso' },
        { id: 'i3', code: 'CAP-002', title: 'Introducción a BPF (ANMAT 3827/18)', type: 'Curso', frequency: 'Anual', month: 'Mayo', functionIds: [], courseId: 'c1', status: 'Programado' },
        { id: 'i4', code: 'POE-014', title: 'Manejo de desviaciones y CAPA', type: 'Taller', frequency: 'Anual', month: 'Agosto', functionIds: ['jf3', 'jf1'], courseId: '', status: 'Pendiente' },
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
  exams: [
    {
      id: 'ex1', courseId: 'c1', title: 'Examen final — BPF para personal de planta',
      description: 'Evaluación final del curso: preguntas de opción múltiple (corrección automática) y una pregunta abierta (corrección manual del instructor).',
      passScore: 70, dueDate: '2026-08-31',
      questions: [
        {
          id: 'q1', type: 'multiple', points: 30,
          text: '¿Cuándo debe lavarse las manos el personal?',
          options: ['Solo al inicio del turno', 'Cada vez que ingresa al área productiva', 'Una vez por semana'], correct: 1,
        },
        {
          id: 'q2', type: 'multiple', points: 30,
          text: '¿Qué significa la sigla ALCOA en integridad de datos?',
          options: ['Atribuible, Legible, Contemporáneo, Original, Exacto', 'Auditable, Limpio, Completo, Ordenado, Aprobado', 'Analítico, Lógico, Certero, Objetivo, Auténtico'], correct: 0,
        },
        {
          id: 'q3', type: 'abierta', points: 40,
          text: 'Describí qué harías ante una desviación durante la elaboración de un lote.',
        },
      ],
      attempts: [
        {
          id: 'at1', talentId: 't2', submittedAt: '2026-07-01',
          answers: { q1: 1, q2: 0, q3: 'Detendría la tarea, registraría la desviación e informaría de inmediato al supervisor y a Garantía de Calidad para evaluar el impacto sobre el lote.' },
          autoScore: 60, manualScores: {}, status: 'Pendiente de corrección', finalScore: null, passed: null,
        },
      ],
    },
  ],
  reviews: [
    {
      id: 'r1', courseId: 'c1', talentId: 't3', rating: 5,
      comment: 'Muy claro y aplicado a la realidad de la planta. Los ejemplos de desviaciones son excelentes.', createdAt: '2026-06-20',
    },
    {
      id: 'r2', courseId: 'c1', talentId: 't2', rating: 4,
      comment: 'Buen contenido. Sumaría más casos prácticos de documentación.', createdAt: '2026-06-22',
    },
    {
      id: 'r3', courseId: 'c2', talentId: 't6', rating: 5,
      comment: 'El módulo de calibración es de lo mejor que vi sobre el tema.', createdAt: '2026-06-25',
    },
  ],
  courseQuestions: [
    {
      id: 'cq1', courseId: 'c1', talentId: 't2',
      text: '¿La evaluación final es obligatoria para aprobar el curso?',
      createdAt: '2026-06-18',
      answers: [
        {
          id: 'cqa1', talentId: 't3',
          text: 'Sí, se requiere un mínimo de 70% en la evaluación de eficacia para registrar la capacitación en el legajo.',
          createdAt: '2026-06-18',
        },
      ],
    },
  ],
  evaluations: [
    {
      id: 'ev1', talentId: 't1', period: '2026 H1', performance: 4, potential: 4,
      strengths: 'Rigurosidad técnica y dominio de HPLC. Muy buena documentación.',
      areas: 'Desarrollar habilidades de liderazgo para el próximo paso a jefatura.', createdAt: '2026-06-30',
    },
    {
      id: 'ev2', talentId: 't2', period: '2026 H1', performance: 3, potential: 5,
      strengths: 'Curva de aprendizaje muy rápida, gran actitud en el laboratorio.',
      areas: 'Profundizar en técnicas asépticas y monitoreo ambiental.', createdAt: '2026-06-30',
    },
    {
      id: 'ev3', talentId: 't3', period: '2026 H1', performance: 5, potential: 3,
      strengths: 'Referente de calidad en la planta, excelente gestión de desviaciones.',
      areas: 'Delegar más operativa para enfocarse en mejora continua.', createdAt: '2026-06-28',
    },
    {
      id: 'ev4', talentId: 't4', period: '2026 H1', performance: 4, potential: 2,
      strengths: 'Especialista sólido en elaboración y despeje de línea.',
      areas: 'Actualizar formación en serialización y nuevas líneas.', createdAt: '2026-06-27',
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
  const [remoteStatus, setRemoteStatus] = useState(isRemoteEnabled ? 'syncing' : 'local')

  // Al iniciar, si hay backend Supabase configurado, se trae el estado remoto
  useEffect(() => {
    if (!isRemoteEnabled) return
    loadRemote()
      .then((remote) => {
        if (remote) setData({ ...seed(), ...remote })
        setRemoteStatus('connected')
      })
      .catch(() => setRemoteStatus('error'))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    saveRemoteDebounced(data, () => setRemoteStatus('error'))
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
    locations: makeCrud('locations'),
    reviews: makeCrud('reviews'),
    courseQuestions: makeCrud('courseQuestions'),
    exams: makeCrud('exams'),
    remoteStatus,
    reset: () => setData(seed()),
    talentById: (id) => data.talents.find((t) => t.id === id),
    courseById: (id) => data.courses.find((c) => c.id === id),
    locationById: (id) => data.locations.find((l) => l.id === id),
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
