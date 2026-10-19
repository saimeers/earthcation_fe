import { useState, useEffect }               from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm }                           from 'react-hook-form'
import { toast }                             from 'sonner'
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle }
                                             from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle }
                    from '@/components/ui/card'
import Aurora       from '@/components/Aurora'
import { authService } from '@/services/auth.service'

const AURORA_DARK  = ['#0f3460', '#16213e', '#533483']
const AURORA_LIGHT = ['#c9d6ff', '#e2e2e2', '#a8c0ff']

// Reglas de seguridad de contraseña
const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres',    test: (p) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos un número',     test: (p) => /\d/.test(p) },
]

export default function ResetPassword() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const token           = searchParams.get('token')

  const [loading,         setLoading]         = useState(false)
  const [done,            setDone]            = useState(false)
  const [showPassword,    setShowPassword]    = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [isDark,          setIsDark]          = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Redirige si no hay token en la URL
  useEffect(() => {
    if (!token) {
      toast.error('Enlace inválido', {
        description: 'No se encontró un token de recuperación en la URL.',
      })
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const passwordValue = watch('new_password', '')

  const onSubmit = async (data) => {
    // Valida reglas de seguridad
    const failedRule = PASSWORD_RULES.find(r => !r.test(data.new_password))
    if (failedRule) {
      toast.error('Contraseña no válida', { description: failedRule.label })
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({
        token,
        new_password: data.new_password,
      })
      setDone(true)
      toast.success('Contraseña actualizada', {
        description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      })
    } catch (err) {
      toast.error('Error al restablecer', {
        description: err.response?.data?.error ?? 'El enlace puede haber expirado.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">

      {/* Aurora fondo */}
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

        {/* Volver */}
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
            <CardTitle className="text-xl">Nueva contraseña</CardTitle>
          </CardHeader>

          <CardContent>
            {done ? (
              // Estado: contraseña actualizada
              <div className="flex flex-col gap-5 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Contraseña actualizada</p>
                  <p className="text-xs text-muted-foreground">
                    Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to="/login">Ir al inicio de sesión</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

                {/* Nueva contraseña */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new_password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={loading}
                      className="pr-10"
                      {...register('new_password', {
                        required: 'La contraseña es requerida',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                      })}
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
                  {errors.new_password &&
                    <p className="text-xs text-destructive">{errors.new_password.message}</p>}

                  {/* Indicador de seguridad */}
                  {passwordValue.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-1">
                      {PASSWORD_RULES.map(rule => {
                        const passed = rule.test(passwordValue)
                        return (
                          <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                            {passed
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              : <XCircle      className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                            <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {rule.label}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm_password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={loading}
                      className="pr-10"
                      {...register('confirm_password', {
                        required: 'Confirma tu contraseña',
                        validate: val =>
                          val === passwordValue || 'Las contraseñas no coinciden',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {showConfirm
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye    className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirm_password &&
                    <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
                </div>

                <Button type="submit" className="w-full mt-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>

              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}