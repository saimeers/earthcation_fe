import { useParams } from 'react-router-dom'
import { Activity, CheckCircle, Timer, BookOpen } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { useCanEdit, usePanelBase } from '@/features/auth'
import { progressStats, shortSeconds } from '../../domain/attempts'
import { useUserDetail } from '../../application/useUsers'
import { ProgressHistory, StatCard, UserFacts, UserHeader, UserSessions, VarkCard } from '../components/detail/UserDetailParts'

export function UserDetailPage() {
  const { id } = useParams()
  const base = usePanelBase()
  const canEdit = useCanEdit()
  const { user, progress, sessions, isLoading } = useUserDetail(id)

  // % del último intento de cada nivel: reintentar reemplaza el %, no lo promedia
  const stats = progressStats(progress)

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <UserHeader user={user} isLoading={isLoading} backTo={`${base}/users`} editTo={canEdit ? `/admin/users/${id}/edit` : null} />

      <Separator />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <>
          <UserFacts user={user} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Intentos totales" value={stats.totalAttempts} icon={Activity} color="text-blue-500" />
            <StatCard label="Riesgos mitigados" value={`${stats.percentage}%`} icon={CheckCircle} color="text-green-500" />
            <StatCard label="Tiempo prom. reacción" value={shortSeconds(stats.avgReactionMs)} icon={Timer} color="text-purple-500" />
            <StatCard label="Sesiones" value={sessions.length} icon={BookOpen} color="text-amber-500" />
          </div>

          {user?.varkProfile && <VarkCard vark={user.varkProfile} />}
          <ProgressHistory progress={progress} />
          <UserSessions sessions={sessions} base={base} />
        </>
      )}
    </div>
  )
}
