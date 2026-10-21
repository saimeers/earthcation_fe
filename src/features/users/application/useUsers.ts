import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/client'
import { usePort } from '@/shared/lib/ports'
import { createdMessage, toUserPayload, type UserAction, type UserForm } from '../domain/users'
import { userKeys, usersPort } from './ports'

export function useUserList() {
  const gateway = usePort(usersPort)
  return useQuery({ queryKey: userKeys.list(), queryFn: () => gateway.list() })
}

const ACTION_TEXT = {
  role: { ok: 'Rol actualizado', error: 'Error al cambiar el rol' },
  disable: { ok: 'Usuario deshabilitado', error: 'Error al deshabilitar' },
  enable: { ok: 'Usuario habilitado', error: 'Error al habilitar' },
} as const

/** Ejecuta una acción confirmada de la tabla (cambiar rol, deshabilitar, habilitar). */
export function useUserAction() {
  const gateway = usePort(usersPort)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (action: UserAction) => (action.type === 'role'
      ? gateway.update(action.user.id, { role: action.newRole })
      : gateway.setActive(action.user.id, action.type === 'enable')),
    onSuccess: (_, action) => {
      // Un cambio de rol o de estado también mueve los conteos de analíticas: se refresca todo
      void qc.invalidateQueries()
      toast.success(ACTION_TEXT[action.type].ok)
    },
    onError: (_, action) => toast.error(ACTION_TEXT[action.type].error),
  })
}

/** Perfil + VARK, historial de intentos por riesgo y sesiones en las que participó. */
export function useUserDetail(id: string | undefined) {
  const gateway = usePort(usersPort)
  const enabled = !!id
  const user = useQuery({ queryKey: userKeys.detail(id ?? ''), queryFn: () => gateway.get(id ?? ''), enabled })
  const progress = useQuery({ queryKey: userKeys.progress(id ?? ''), queryFn: () => gateway.progressHistory(id ?? ''), enabled })
  const sessions = useQuery({ queryKey: userKeys.sessions(id ?? ''), queryFn: () => gateway.sessions(id ?? ''), enabled })
  return {
    user: user.data,
    progress: progress.data ?? [],
    sessions: sessions.data ?? [],
    isLoading: user.isLoading || progress.isLoading || sessions.isLoading,
  }
}

/** Usuario a editar (solo se pide en modo edición). */
export function useUser(id: string | undefined) {
  const gateway = usePort(usersPort)
  return useQuery({ queryKey: userKeys.detail(id ?? ''), queryFn: () => gateway.get(id ?? ''), enabled: !!id })
}

/** Crea o actualiza. Los errores se avisan aquí y se relanzan para que el formulario no navegue. */
export function useSaveUser(id: string | undefined) {
  const gateway = usePort(usersPort)
  const qc = useQueryClient()
  const isEdit = !!id
  return useMutation({
    mutationFn: async (form: UserForm) => {
      const payload = toUserPayload(form, isEdit)
      if (id) {
        await gateway.update(id, payload)
        toast.success('Usuario actualizado correctamente')
      } else {
        const created = await gateway.create(payload)
        toast.success('Usuario creado', { description: createdMessage(form.role, created.email_sent) })
      }
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: userKeys.all }) },
    onError: (err) => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear', {
      description: apiErrorMessage(err, 'Ocurrió un error inesperado'),
    }),
  })
}
