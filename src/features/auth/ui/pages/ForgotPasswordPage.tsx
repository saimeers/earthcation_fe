import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { isValidEmail } from '../../domain/password'
import { useForgotPassword } from '../../application/useAuthActions'
import { AuthLayout } from '../components/AuthLayout'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const forgot = useForgotPassword()
  const loading = forgot.isPending

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Ingresa tu correo electrónico')
      return
    }
    if (!isValidEmail(email.trim())) {
      toast.error('Correo inválido', {
        description: 'Ingresa un correo electrónico con formato válido.',
      })
      return
    }
    forgot.mutate(email.trim())
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo y te enviaremos un enlace de recuperación
          </CardDescription>
        </CardHeader>

        <CardContent>
          {forgot.isSuccess ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si el correo está registrado recibirás un enlace en breve.
                Revisa tu bandeja de entrada.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
              <Link
                to="/login"
                className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                Volver al inicio de sesión
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
