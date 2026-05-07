import { useMutation }  from '@tanstack/react-query'
import { useNavigate }  from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService }  from '../services/auth.service'
import { toast } from 'sonner'

export function useLogin() {
  const setAuth    = useAuthStore(s => s.setAuth)
  const navigate   = useNavigate()

  return useMutation({
    mutationFn: (data) => authService.login(data),
    onSuccess:  (res) => {
      const { token, user } = res.data
      setAuth(token, user)

      if (user.role === 'instructor' || user.role === 'admin')
        navigate('/dashboard')
      else
        navigate('/')
    },
    onError: (err) => {
      toast.error("Error al iniciar sesión.")
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess:  () => {
      toast.success("Usuario registrado exitosamente.")
    },
    onError: (err) => {
      toast.error("Error al registrar usuario.")
    },
  })
}

export function useLogout() {
  const logout   = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/')
  }
}