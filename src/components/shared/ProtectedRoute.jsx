import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore }          from '@/store/authStore'

export function ProtectedRoute({ children, allowedRoles }) {
  const token    = useAuthStore(s => s.token)
  const user     = useAuthStore(s => s.user)
  const location = useLocation()

  if (!token)
    return <Navigate to="/login" state={{ from: location }} replace />

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />

  return <>{children}</>
}