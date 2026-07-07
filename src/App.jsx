import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import AppLayout from './app/Layout.jsx'
import Dashboard from './app/Dashboard.jsx'
import Talent from './app/Talent.jsx'
import Courses from './app/Courses.jsx'
import Seminars from './app/Seminars.jsx'
import CareerPlans from './app/CareerPlans.jsx'
import Tracking from './app/Tracking.jsx'
import Settings from './app/Settings.jsx'
import { StoreProvider } from './store.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app"
        element={
          <StoreProvider>
            <AppLayout />
          </StoreProvider>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="talento" element={<Talent />} />
        <Route path="cursos" element={<Courses />} />
        <Route path="seminarios" element={<Seminars />} />
        <Route path="planes" element={<CareerPlans />} />
        <Route path="seguimiento" element={<Tracking />} />
        <Route path="configuracion" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
