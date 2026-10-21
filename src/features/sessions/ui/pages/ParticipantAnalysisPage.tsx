import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { participantInsights } from '../../domain/insights'
import { attemptsByLevel, selectedAttemptId } from '../../domain/sessions'
import { isChallenge } from '../../domain/telemetry'
import { useParticipantAnalysis } from '../../application/useSessions'
import { ParticipantHero, ParticipantNav, SectionTitle } from '../components/participant/ParticipantHeader'
import {
  BehaviourSection, ChallengesSection, CompareSection, InsightsSection, LevelsSection, RiskMasterySection,
} from '../components/participant/ParticipantSections'
import { AttemptReplay } from '../components/replay/AttemptReplay'

function AnalysisSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <Skeleton className="h-52 rounded-2xl" />
      <div className="grid sm:grid-cols-2 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export function ParticipantAnalysisPage() {
  const { id: sessionId = '', userId } = useParams()
  const { data, isLoading, isFetching } = useParticipantAnalysis(sessionId, userId)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const replayRef = useRef<HTMLElement>(null)

  const insights = useMemo(() => participantInsights(data), [data])
  const byLevel = useMemo(() => attemptsByLevel(data?.attempts ?? []), [data])

  if (isLoading || !data) return <AnalysisSkeleton />

  const levelKeys = Object.keys(byLevel).filter(k => !isChallenge(k)).sort()
  const challengeKeys = Object.keys(byLevel).filter(isChallenge).sort()
  const selectedAttempt = selectedAttemptId(data.attempts, attemptId)

  const selectAttempt = (id: string) => {
    setAttemptId(id)
    replayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`space-y-8 max-w-6xl mx-auto w-full transition-opacity ${isFetching ? 'opacity-80' : ''}`}>
      <ParticipantNav data={data} sessionId={sessionId} />
      <ParticipantHero data={data} />
      <InsightsSection insights={insights} />
      <CompareSection data={data} />
      <LevelsSection data={data} levelKeys={levelKeys} byLevel={byLevel} selectedAttempt={selectedAttempt} onSelect={selectAttempt} />
      <ChallengesSection keys={challengeKeys} byLevel={byLevel} selectedAttempt={selectedAttempt} onSelect={selectAttempt} />
      <RiskMasterySection data={data} />
      <BehaviourSection data={data} />

      <section className="space-y-3 scroll-mt-20" ref={replayRef}>
        <SectionTitle icon={PlayCircle} hint="Pasa el cursor por la curva para ver cada momento">Repetición de un intento</SectionTitle>
        {data.attempts.length === 0
          ? <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed">Sin intentos para mostrar.</p>
          : <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5"><AttemptReplay attempts={data.attempts} selectedId={selectedAttempt} onSelect={setAttemptId} /></div>}
      </section>
    </div>
  )
}
