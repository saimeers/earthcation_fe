import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { roleAllowed, useAuthStore, type Role } from '@/features/auth'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: readonly Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = useAuthStore(s => s.token)
  const user = useAuthStore(s => s.user)
  const location = useLocation()

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  if (!roleAllowed(user?.role, allowedRoles)) return <Navigate to="/" replace />

  return <>{children}</>
}
