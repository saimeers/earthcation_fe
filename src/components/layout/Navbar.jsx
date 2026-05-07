import { Link, useLocation } from 'react-router-dom'
import { Button }            from '../ui/button'
import { Separator }         from '../ui/separator'
import { useAuthStore }      from '../../store/authStore'
import { useLogout }         from '../../hooks/useAuth'

export function Navbar() {
  const { token, user } = useAuthStore()
  const logout          = useLogout()
  const location        = useLocation()

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link to="/" className="text-sm font-semibold tracking-tight">
          Earthcation
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {isInstructor && (
            <>
              <Link
                to="/dashboard"
                className={location.pathname === '/dashboard'
                  ? 'text-foreground font-medium'
                  : 'hover:text-foreground transition-colors'}>
                Sesiones
              </Link>
              <Link
                to="/players"
                className={location.pathname.startsWith('/players')
                  ? 'text-foreground font-medium'
                  : 'hover:text-foreground transition-colors'}>
                Jugadores
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/analytics"
                  className={location.pathname === '/analytics'
                    ? 'text-foreground font-medium'
                    : 'hover:text-foreground transition-colors'}>
                  Analíticas
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {token ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {user?.first_name} {user?.last_name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}