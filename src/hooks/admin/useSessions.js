import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '@/services/session.service'
import { toast } from 'sonner'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions', 'all'],
    queryFn:  () => sessionService.getAll().then(r => r.data),
  })
}

export function useSessionProgress(id) {
  return useQuery({
    queryKey:        ['sessions', id, 'progress'],
    queryFn:         () => sessionService.getProgress(id).then(r => r.data),
    enabled:         !!id,
    refetchInterval: 15_000,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => sessionService.create(data),
    onSuccess:  () => { qc.invalidateQueries(['sessions']); toast.success('Sesión creada') },
    onError:    () => toast.error('Error al crear la sesión'),
  })
}

export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => sessionService.start(id),
    onSuccess:  () => { qc.invalidateQueries(['sessions']); toast.success('Sesión iniciada') },
    onError:    () => toast.error('Error al iniciar la sesión'),
  })
}

export function useEndSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => sessionService.end(id),
    onSuccess:  () => { qc.invalidateQueries(['sessions']); toast.success('Sesión finalizada') },
    onError:    () => toast.error('Error al finalizar la sesión'),
  })
}