import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { apiErrorMessage } from '@/shared/api/client'
import { PASSWORD_RULES, firstFailedRule } from '../../domain/password'
import { useResetPassword } from '../../application/useAuthActions'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '../components/PasswordInput'

interface ResetForm { new_password: string, confirm_password: string }

function PasswordChecklist({ password }: { password: string }) {
  if (!password.length) return null
  return (
    <ul className="mt-1 flex flex-col gap-1">
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password)
        return (
          <li key={rule.label} className="flex items-center gap-1.5 text-xs">
            {passed
              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              : <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
              {rule.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function PasswordUpdated() {
  return (
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
  )
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const reset = useResetPassword()
  const loading = reset.isPending

  // Sin token en la URL el enlace no sirve
  useEffect(() => {
    if (!token) {
      toast.error('Enlace inválido', {
        description: 'No se encontró un token de recuperación en la URL.',
      })
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>()
  const passwordValue = watch('new_password', '')

  const onSubmit = async (data: ResetForm) => {
    const failedRule = firstFailedRule(data.new_password)
    if (failedRule) {
      toast.error('Contraseña no válida', { description: failedRule.label })
      return
    }
    try {
      await reset.mutateAsync({ token: token ?? '', newPassword: data.new_password })
      toast.success('Contraseña actualizada', {
        description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      })
    } catch (err) {
      toast.error('Error al restablecer', {
        description: apiErrorMessage(err, 'El enlace puede haber expirado.'),
      })
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nueva contraseña</CardTitle>
        </CardHeader>

        <CardContent>
          {reset.isSuccess ? <PasswordUpdated /> : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new_password">Nueva contraseña</Label>
                <PasswordInput
                  id="new_password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register('new_password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
                {errors.new_password &&
                  <p className="text-xs text-destructive">{errors.new_password.message}</p>}
                <PasswordChecklist password={passwordValue} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm_password">Confirmar contraseña</Label>
                <PasswordInput
                  id="confirm_password"
                  placeholder="••••••••"
                  disabled={loading}
                  {...register('confirm_password', {
                    required: 'Confirma tu contraseña',
                    validate: val => val === passwordValue || 'Las contraseñas no coinciden',
                  })}
                />
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
    </AuthLayout>
  )
}
