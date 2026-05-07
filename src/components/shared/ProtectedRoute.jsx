import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/" replace />

  return children
}