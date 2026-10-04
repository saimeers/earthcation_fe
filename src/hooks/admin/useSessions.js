import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { sessionService } from '@/services/session.service'
import { locationService } from '@/services/location.service'
import { toast } from 'sonner'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions', 'all'],
    queryFn:  () => sessionService.getAll().then(r => r.data),
  })
}

export function useSessionsByLocation(params) {
  return useQuery({
    queryKey: ['sessions', 'by-location', params],
    queryFn:  () => sessionService.byLocation(params).then(r => r.data),
    enabled:  !!(params?.department || params?.municipality),
  })
}

// Solo se refresca solo mientras la sesión está en curso — una finalizada no cambia.
export function useSessionProgressAdmin(id) {
  return useQuery({
    queryKey:        ['sessions', id, 'progress', 'admin'],
    queryFn:         () => sessionService.getProgressAdmin(id).then(r => r.data),
    enabled:         !!id,
    placeholderData: keepPreviousData,
    refetchInterval: (query) => (query.state.data?.session?.status === 'active' ? 15_000 : false),
  })
}

export function useParticipantAnalysis(sessionId, userId) {
  return useQuery({
    queryKey:        ['sessions', sessionId, 'participants', userId, 'analysis'],
    queryFn:         () => sessionService.participantAnalysis(sessionId, userId).then(r => r.data),
    enabled:         !!sessionId && !!userId,
    placeholderData: keepPreviousData,
  })
}

export function useExportSessionXlsx() {
  return useMutation({
    mutationFn: async ({ id, code }) => {
      const res = await sessionService.exportXlsx(id)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `sesion-${code ?? id}-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
    onSuccess: () => toast.success('Excel descargado'),
    onError:   () => toast.error('No se pudo exportar la sesión'),
  })
}

export function useLocationsForFilter() {
  return useQuery({
    queryKey: ['locations'],
    queryFn:  () => locationService.getAll().then(r => r.data),
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => sessionService.create(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast.success('Sesión creada') },
    onError:    () => toast.error('Error al crear la sesión'),
  })
}

export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => sessionService.start(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast.success('Sesión iniciada') },
    onError:    () => toast.error('Error al iniciar la sesión'),
  })
}

export function useEndSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => sessionService.end(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['sessions'] }); toast.success('Sesión finalizada') },
    onError:    () => toast.error('Error al finalizar la sesión'),
  })
}