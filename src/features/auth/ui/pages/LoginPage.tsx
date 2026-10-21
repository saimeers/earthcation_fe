import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { apiErrorMessage } from '@/shared/api/client'
import { useLogin } from '../../application/useAuthActions'
import type { Credentials } from '../../application/ports'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '../components/PasswordInput'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const loading = login.isPending
  const { register, handleSubmit, formState: { errors } } = useForm<Credentials>()

  const onSubmit = async (data: Credentials) => {
    try {
      const outcome = await login.mutateAsync(data)
      if (outcome.status === 'forbidden') {
        toast.error('Acceso restringido', {
          description: 'Esta plataforma es solo para el personal (instructores, administradores y soporte).',
        })
        return
      }
      toast.success(`Bienvenido, ${outcome.user.first_name}`)
      navigate(outcome.home)
    } catch (err) {
      toast.error('Error al iniciar sesión', {
        description: apiErrorMessage(err, 'Cédula o contraseña incorrectos.'),
      })
    }
  }

  return (
    <AuthLayout>
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
              <PasswordInput
                id="password"
                disabled={loading}
                {...register('password', { required: 'La contraseña es requerida' })}
              />
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
    </AuthLayout>
  )
}
