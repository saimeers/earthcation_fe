import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider }        from '@tanstack/react-query'

import HomePage           from './pages/home/HomePage'
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'
import SessionDetailPage  from './pages/sessions/SessionDetailPage'
import PlayersPage        from './pages/players/PlayersPage'

import { ProtectedRoute } from './components/shared/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/"                element={<HomePage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/sessions/:id" element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <SessionDetailPage />
            </ProtectedRoute>
          }/>

          <Route path="/players" element={
            <ProtectedRoute allowedRoles={['instructor', 'admin']}>
              <PlayersPage />
            </ProtectedRoute>
          }/>

        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App