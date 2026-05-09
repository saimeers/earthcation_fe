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
import Aurora from '@/components/Aurora'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    const { confirmPassword, ...rest } = data

    setLoading(true)

    try {
      await authService.register({
        ...rest,
        role: 'instructor',
      })

      toast.success('Cuenta creada', {
        description: 'Ya puedes iniciar sesión con tus credenciales.',
      })

      navigate('/login')
    } catch (err) {
      toast.error('Error al registrarse', {
        description: err.response?.data?.error ?? 'Ocurrió un error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={['#1a1a2e', '#16213e', '#0f3460']}
          blend={0.4}
          amplitude={0.8}
          speed={0.6}
        />

        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md py-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Plataforma de instructores
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            Earthcation
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Registro de instructor
            </CardTitle>

            <CardDescription>
              Crea una cuenta para gestionar capacitaciones
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Nombre</Label>

                  <Input
                    placeholder="Ana"
                    disabled={loading}
                    {...register('first_name', {
                      required: 'Requerido',
                    })}
                  />

                  {errors.first_name && (
                    <p className="text-xs text-destructive">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Apellido</Label>

                  <Input
                    placeholder="Gómez"
                    disabled={loading}
                    {...register('last_name', {
                      required: 'Requerido',
                    })}
                  />

                  {errors.last_name && (
                    <p className="text-xs text-destructive">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Cédula</Label>

                <Input
                  placeholder="1234567890"
                  disabled={loading}
                  {...register('cedula', {
                    required: 'Requerido',
                  })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Correo electrónico</Label>

                <Input
                  type="email"
                  placeholder="ana@ejemplo.com"
                  disabled={loading}
                  {...register('email', {
                    required: 'Requerido',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Correo inválido',
                    },
                  })}
                />

                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Usuario</Label>

                <Input
                  placeholder="ana_gomez"
                  disabled={loading}
                  {...register('username', {
                    required: 'Requerido',
                  })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Contraseña</Label>

                <Input
                  type="password"
                  disabled={loading}
                  {...register('password', {
                    required: 'Requerido',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres',
                    },
                  })}
                />

                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Confirmar contraseña</Label>

                <Input
                  type="password"
                  disabled={loading}
                  {...register('confirmPassword', {
                    required: 'Requerido',
                    validate: (val) =>
                      val === watch('password') ||
                      'Las contraseñas no coinciden',
                  })}
                />

                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {loading
                  ? 'Creando cuenta...'
                  : 'Crear cuenta'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}