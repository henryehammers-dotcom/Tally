import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isOnboardingComplete } from './lib/storage'
import BottomNav from './components/BottomNav'
import Welcome from './screens/Welcome'
import Home from './screens/Home'
import Library from './screens/Library'
import RoutinePage from './screens/RoutinePage'
import LogPage from './screens/LogPage'
import Placeholder from './screens/Placeholder'

function RequireOnboarding({ children }) {
  if (!isOnboardingComplete()) {
    return <Navigate to="/welcome" replace />
  }
  return children
}

function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/home"
          element={
            <RequireOnboarding>
              <AppLayout><Home /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/library"
          element={
            <RequireOnboarding>
              <AppLayout><Library /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/tally"
          element={
            <RequireOnboarding>
              <AppLayout><Placeholder name="Tally" /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/timer"
          element={
            <RequireOnboarding>
              <AppLayout><Placeholder name="Timer" /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/music"
          element={
            <RequireOnboarding>
              <AppLayout><Placeholder name="Music" /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireOnboarding>
              <AppLayout><Placeholder name="Settings" /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/routine/:id"
          element={
            <RequireOnboarding>
              <AppLayout><RoutinePage /></AppLayout>
            </RequireOnboarding>
          }
        />
        <Route
          path="/log/:routineId/:exerciseId"
          element={
            <RequireOnboarding>
              <LogPage />
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  )
}
