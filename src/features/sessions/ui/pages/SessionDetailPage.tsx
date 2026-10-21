import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, Grid3x3, Activity } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { usePanelBase } from '@/features/auth'
import type { PerformanceBand } from '../../domain/bands'
import { sessionInsights } from '../../domain/insights'
import { filterParticipants, type ParticipantSort } from '../../domain/sessions'
import { useSessionProgress } from '../../application/useSessions'
import { SessionHero } from '../components/detail/SessionHero'
import { SessionActions } from '../components/detail/SessionActions'
import { BandDistribution, NoParticipants, SessionInsights, SessionKpis } from '../components/detail/SessionOverview'
import { ParticipantsTable } from '../components/detail/ParticipantsTable'
import { ParticipantsToolbar, RisksTab, TelemetryTab } from '../components/detail/SessionTabs'

function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <Skeleton className="h-44 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

export function SessionDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const base = usePanelBase()
  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useSessionProgress(id)

  const [search, setSearch] = useState('')
  const [band, setBand] = useState<PerformanceBand | null>(null)
  const [sort, setSort] = useState<ParticipantSort>('pct_desc')

  const participants = useMemo(() => data?.participants ?? [], [data])
  const insights = useMemo(() => sessionInsights(data), [data])
  const filtered = useMemo(() => filterParticipants(participants, { search, band, sort }), [participants, search, band, sort])

  if (isLoading) return <DetailSkeleton />

  const session = data?.session
  const summary = data?.summary
  const openParticipant = (userId: string) => navigate(`${base}/sessions/${id}/participants/${userId}`)
  const hasResults = !!summary && (summary.with_data > 0 || summary.level_attempts > 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <SessionHero
        session={session} summary={summary} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt}
        onRefresh={() => void refetch()} actions={<SessionActions id={id} session={session} />}
      />

      {!data || !summary || participants.length === 0 ? <NoParticipants code={session?.code} /> : (
        <>
          <SessionKpis summary={summary} />
          <SessionInsights insights={insights} />
          <BandDistribution bands={summary.bands} active={band} onToggle={(k) => setBand(b => (b === k ? null : k))} />

          <Tabs defaultValue="participants" className="flex-col gap-4">
            <TabsList className="h-10 w-full sm:w-fit">
              <TabsTrigger value="participants" className="px-4 text-sm"><Users className="h-4 w-4" /> Participantes</TabsTrigger>
              <TabsTrigger value="risks" className="px-4 text-sm"><Grid3x3 className="h-4 w-4" /> Riesgos</TabsTrigger>
              <TabsTrigger value="telemetry" className="px-4 text-sm"><Activity className="h-4 w-4" /> Telemetría</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-3">
              <ParticipantsToolbar
                search={search} onSearch={setSearch} sort={sort} onSort={setSort}
                band={band} onClearBand={() => setBand(null)} shown={filtered.length} total={participants.length}
              />
              <ParticipantsTable participants={filtered} avgPct={summary.avg_percentage} onOpen={openParticipant} />
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <RisksTab data={data} participants={filtered} hasResults={hasResults} onOpen={openParticipant} />
            </TabsContent>

            <TabsContent value="telemetry">
              <TelemetryTab data={data} sessionId={id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
