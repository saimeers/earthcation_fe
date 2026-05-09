import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import { toast }               from 'sonner'
import { Loader2, ArrowLeft }  from 'lucide-react'
import { Button }              from '@/components/ui/button'
import { Input }               from '@/components/ui/input'
import { Label }               from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle }
                               from '@/components/ui/card'
import Aurora                  from '@/components/Aurora'
import { authService }         from '@/services/auth.service'

const AURORA_DARK  = ['#0f3460', '#16213e', '#533483']
const AURORA_LIGHT = ['#c9d6ff', '#e2e2e2', '#a8c0ff']

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [isDark,  setIsDark]  = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Ingresa tu correo electrónico')
      return
    }
    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSent(true)
    } catch {
      setSent(true)
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
            <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo y te enviaremos un enlace de recuperación
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
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

      </div>
    </div>
  )
}