import { useQuery } from '@tanstack/react-query'
import { userService }     from '@/services/user.service'
import { progressService } from '@/services/progress.service'

export function useUserDetail(id) {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['users', id],
    queryFn:  () => userService.getById(id).then(r => r.data),
    enabled:  !!id,
  })

  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['users', id, 'progress'],
    queryFn:  () => progressService.getHistoryByUser(id).then(r => r.data),
    enabled:  !!id,
  })

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['users', id, 'sessions'],
    queryFn:  () => userService.getSessions(id).then(r => r.data),
    enabled:  !!id,
  })

  return {
    user,
    progress: progress ?? [],
    sessions: sessions ?? [],
    isLoading: isLoadingUser || isLoadingProgress || isLoadingSessions,
  }
}
