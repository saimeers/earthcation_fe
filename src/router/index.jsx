import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ProtectedRoute } from '../components/shared/ProtectedRoute'

import { HomePage } from '../modules/home/Home'
import { LoginPage } from '../modules/auth/Login'
import { ForgotPasswordPage } from '../modules/auth/ForgotPassword'
import { SessionsPage } from '../pages/sessions/SessionsPage'
import { SessionDetailPage } from '../pages/sessions/SessionDetailPage'
import { PlayersPage } from '../pages/players/PlayersPage'
import { RegisterPage } from '../modules/auth/Register' 

const GamePage = () => <div className="flex h-full items-center justify-center p-20 text-2xl font-bold">Cargando WebGL de Unity...</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'play', element: <GamePage /> },

      {
        path: 'admin/register-instructor',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <RegisterPage />
          </ProtectedRoute>
        ),
      },
      
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