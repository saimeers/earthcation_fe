import { createBrowserRouter } from 'react-router-dom'
import { Layout }         from '../components/layout/Layout'
import { ProtectedRoute } from '../components/shared/ProtectedRoute'

import { HomePage }           from '../modules/home/HomePage'
import { LoginPage }          from '../modules/auth/LoginPage'
import { RegisterPage }       from '../modules/auth/RegisterPage'
import { ForgotPasswordPage } from '../modules/auth/ForgotPasswordPage'
import { SessionsPage }       from '../modules/sessions/SessionsPage'
import { SessionDetailPage }  from '../modules/sessions/SessionDetailPage'
import { PlayersPage }        from '../modules/players/PlayersPage'
// import { PlayerDetailPage }   from '../modules/players/PlayerDetailPage'
// import { AnalyticsPage }      from '../modules/analytics/AnalyticsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login',           element: <LoginPage /> },
      { path: 'register',        element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },

      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <SessionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'sessions/:id',
        element: (
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <SessionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'players',
        element: (
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <PlayersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'players/:id',
        element: (
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            {/* <PlayerDetailPage /> */}
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            {/* <AnalyticsPage /> */}
          </ProtectedRoute>
        ),
      },
    ],
  },
])