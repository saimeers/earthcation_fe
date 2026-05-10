import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

export function LoginForm() {
  const navigate = useNavigate()

  const setAuth = useAuthStore((s) => s.setAuth)

  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      const res = await authService.login(data)

      const { token, user } = res.data

      if (
        user.role !== 'instructor' &&
        user.role !== 'admin'
      ) {
        toast.error('Acceso restringido', {
          description:
            'Esta plataforma es solo para instructores y administradores.',
        })

        return
      }

      setAuth(token, user)

      toast.success(`Bienvenido, ${user.first_name}`)

      navigate('/admin')
    } catch (err) {
      toast.error('Error al iniciar sesión', {
        description:
          err.response?.data?.error ??
          'Credenciales inválidas',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Iniciar sesión
        </CardTitle>

        <CardDescription>
          Acceso para instructores y administradores
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cedula">
              Cédula
            </Label>

            <Input
              id="cedula"
              placeholder="tu_usuario"
              disabled={loading}
              {...register('cedula', {
                required: 'El usuario es requerido',
              })}
            />

            {errors.cedula && (
              <p className="text-sm text-destructive">
                {errors.cedula.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                Contraseña
              </Label>

              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Olvidé mi contraseña
              </Link>
            </div>

            <Input
              id="password"
              type="password"
              disabled={loading}
              {...register('password', {
                required: 'La contraseña es requerida',
              })}
            />

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={loading}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {loading
              ? 'Ingresando...'
              : 'Iniciar sesión'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            No tienes cuenta?{' '}
            <Link
              to="/register"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Registrarse
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}