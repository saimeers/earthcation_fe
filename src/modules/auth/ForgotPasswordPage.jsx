import { useForm }   from 'react-hook-form'
import { Link }      from 'react-router-dom'
import { useState }  from 'react'
import { Button }    from '../../components/ui/button'
import { Input }     from '../../components/ui/input'
import { Label }     from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription }
                     from '../../components/ui/card'
import { authService } from '../../services/auth.service'

export function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm()
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo y te enviaremos un enlace de recuperación
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Si el correo está registrado recibirás un enlace en breve.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">Volver al inicio</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Correo electrónico</Label>
                <Input type="email" placeholder="tu@correo.com"
                  {...register('email', { required: true })} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
              <Link to="/login"
                className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                Volver al inicio de sesión
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}