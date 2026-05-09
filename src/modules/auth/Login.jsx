import { useState, useEffect }   from 'react'
import { useNavigate, Link }     from 'react-router-dom'
import { useForm }               from 'react-hook-form'
import { toast }                 from 'sonner'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button }                from '@/components/ui/button'
import { Input }                 from '@/components/ui/input'
import { Label }                 from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle }
                                 from '@/components/ui/card'
import Aurora                    from '@/components/Aurora'
import { authService }           from '@/services/auth.service'
import { useAuthStore }          from '@/store/authStore'

const AURORA_DARK  = ['#0f3460', '#16213e', '#533483']
const AURORA_LIGHT = ['#c9d6ff', '#e2e2e2', '#a8c0ff']

export default function Login() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore(s => s.setAuth)

  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDark,       setIsDark]       = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res  = await authService.login(data)
      const { token, user } = res.data

      if (user.role !== 'instructor' && user.role !== 'admin') {
        toast.error('Acceso restringido', {
          description: 'Esta plataforma es solo para instructores y administradores.',
        })
        return
      }

      setAuth(token, user)
      toast.success(`Bienvenido, ${user.first_name}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Error al iniciar sesión', {
        description: err.response?.data?.error ?? 'Cédula o contraseña incorrectos.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">

      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={isDark ? AURORA_DARK : AURORA_LIGHT}
          blend={isDark ? 0.5 : 0.35}
          amplitude={isDark ? 1.0 : 0.6}
          speed={0.5}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? 'bg-background/60' : 'bg-background/70'
        }`} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* Volver al home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </Link>

        <div className="mb-8 text-center">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
            Plataforma de instructores
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Acceso exclusivo para instructores y administradores
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  placeholder="1234567890"
                  inputMode="numeric"
                  disabled={loading}
                  {...register('cedula', { required: 'La cédula es requerida' })}
                />
                {errors.cedula &&
                  <p className="text-sm text-destructive">{errors.cedula.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                    Olvidé mi contraseña
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    disabled={loading}
                    className="pr-10"
                    {...register('password', { required: 'La contraseña es requerida' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye    className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password &&
                  <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Para obtener acceso contacta al administrador del sistema.
        </p>

      </div>
    </div>
  )
}