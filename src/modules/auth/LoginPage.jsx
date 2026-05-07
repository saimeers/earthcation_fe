import { useForm }     from 'react-hook-form'
import { Link }        from 'react-router-dom'
import { Button }      from '../../components/ui/button'
import { Input }       from '../../components/ui/input'
import { Label }       from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription }
                       from '../../components/ui/card'
import { useLogin }    from '../../hooks/useAuth'

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const login = useLogin()

  const onSubmit = (data) => login.mutate(data)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Iniciar sesión</CardTitle>
          <CardDescription>Acceso para instructores y administradores</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="username">Cédula</Label>
              <Input
                id="cedula"
                placeholder="Cedula"
                {...register('cedula', { required: 'Campo requerido' })}
              />
              {errors.cedula && (
                <p className="text-xs text-destructive">{errors.cedula.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: 'Campo requerido' })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Ingresando...' : 'Ingresar'}
            </Button>

          </form>

          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors block">
              Olvidé mi contraseña
            </Link>
            <p className="text-xs text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-foreground hover:underline">
                Registrarse
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}