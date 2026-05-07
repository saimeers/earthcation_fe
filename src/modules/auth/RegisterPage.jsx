import { useForm }    from 'react-hook-form'
import { Link }       from 'react-router-dom'
import { Button }     from '../../components/ui/button'
import { Input }      from '../../components/ui/input'
import { Label }      from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription }
                      from '../../components/ui/card'
import { useRegister } from '../../hooks/useAuth'

export function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const registerMutation = useRegister()

  const onSubmit = (data) => {
    const { confirmPassword, ...rest } = data
    registerMutation.mutate({ ...rest, role: 'instructor' })
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Registro de instructor</CardTitle>
          <CardDescription>Crea una cuenta para gestionar capacitaciones</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input placeholder="Ana"
                  {...register('first_name', { required: 'Requerido' })} />
                {errors.first_name &&
                  <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Apellido</Label>
                <Input placeholder="Gómez"
                  {...register('last_name', { required: 'Requerido' })} />
                {errors.last_name &&
                  <p className="text-xs text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cédula</Label>
              <Input placeholder="1234567890"
                {...register('cedula', { required: 'Requerido' })} />
            </div>

            <div className="space-y-1.5">
              <Label>Correo electrónico</Label>
              <Input type="email" placeholder="ana@ejemplo.com"
                {...register('email', {
                  required: 'Requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' }
                })} />
              {errors.email &&
                <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Usuario</Label>
              <Input placeholder="ana_gomez"
                {...register('username', { required: 'Requerido' })} />
            </div>

            <div className="space-y-1.5">
              <Label>Contraseña</Label>
              <Input type="password"
                {...register('password', {
                  required: 'Requerido',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })} />
              {errors.password &&
                <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Confirmar contraseña</Label>
              <Input type="password"
                {...register('confirmPassword', {
                  required: 'Requerido',
                  validate: val => val === watch('password') || 'Las contraseñas no coinciden'
                })} />
              {errors.confirmPassword &&
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Registrando...' : 'Crear cuenta'}
            </Button>

          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-foreground hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}