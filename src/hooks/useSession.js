import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/session.service'
import { toast } from 'sonner'

export function useMySessions() {
  return useQuery({
    queryKey: ['sessions', 'mine'],
    queryFn:  () => sessionService.getMine().then(r => r.data),
  })
}

export function useSessionProgress(id) {
  return useQuery({
    queryKey: ['sessions', id, 'progress'],
    queryFn:  () => sessionService.getProgress(id).then(r => r.data),
    enabled:  !!id,
    refetchInterval: 10000, // refresca cada 10s para monitoreo en tiempo real
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => sessionService.create(data),
    onSuccess:  () => {
      qc.invalidateQueries(['sessions', 'mine'])
      toast.success("Sesión creada correctamente.")
    },
    onError: (err) => {
      toast.error("Error al crear la sesión.")
    },
  })
}

export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => sessionService.start(id),
    onSuccess:  () => qc.invalidateQueries(['sessions', 'mine']),
  })
}

export function useEndSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => sessionService.end(id),
    onSuccess:  () => qc.invalidateQueries(['sessions', 'mine']),
  })
}