import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import AppLayout from './app/Layout.jsx'
import Dashboard from './app/Dashboard.jsx'
import Talent from './app/Talent.jsx'
import Courses from './app/Courses.jsx'
import Seminars from './app/Seminars.jsx'
import CareerPlans from './app/CareerPlans.jsx'
import Tracking from './app/Tracking.jsx'
import Settings from './app/Settings.jsx'
import Trainer from './app/Trainer.jsx'
import Performance from './app/Performance.jsx'
import CalendarPage from './app/CalendarPage.jsx'
import Training from './app/training/index.jsx'
import Locations from './app/Locations.jsx'
import CourseView from './app/CourseView.jsx'
import CourseEditor from './app/CourseEditor.jsx'
import SeminarView from './app/SeminarView.jsx'
import SeminarEditor from './app/SeminarEditor.jsx'
import Instructors from './app/Instructors.jsx'
import { StoreProvider } from './store.jsx'
import { AuthProvider, useAuth } from './auth.jsx'

// Con backend configurado exige sesión; en modo demo deja pasar.
function RequireAuth({ children }) {
  const { enabled, loading, session } = useAuth()
  if (!enabled) return children
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Cargando tu espacio de trabajo…</p>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <StoreProvider>
                <AppLayout />
              </StoreProvider>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="talento" element={<Talent />} />
          <Route path="locaciones" element={<Locations />} />
          <Route path="cursos" element={<Courses />} />
          <Route path="cursos/:courseId/vista" element={<CourseView />} />
          <Route path="cursos/:courseId/editar" element={<CourseEditor />} />
          <Route path="seminarios" element={<Seminars />} />
          <Route path="seminarios/:seminarId/vista" element={<SeminarView />} />
          <Route path="seminarios/:seminarId/editar" element={<SeminarEditor />} />
          <Route path="planes" element={<CareerPlans />} />
          <Route path="seguimiento" element={<Tracking />} />
          <Route path="desempeno" element={<Performance />} />
          <Route path="entrenador" element={<Trainer />} />
          <Route path="instructores" element={<Instructors />} />
          <Route path="capacitacion" element={<Training />} />
          <Route path="calendario" element={<CalendarPage />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
