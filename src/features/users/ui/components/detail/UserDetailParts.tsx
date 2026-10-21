import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Pencil, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { UserSessionDto, VarkProfileDto } from '@/shared/api/types'
import { shortSeconds, type ProgressRow } from '../../../domain/attempts'
import type { User } from '../../../domain/users'
import { RoleBadge } from '../list/userCells'

const fmtDateTime = (d: string | null | undefined) => (d ? format(new Date(d), 'd MMM yyyy, HH:mm', { locale: es }) : '—')

interface UserHeaderProps {
  user: User | undefined
  isLoading: boolean
  backTo: string
  editTo: string | null
}

export function UserHeader({ user, isLoading, backTo, editTo }: UserHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
          <Link to={backTo}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          {isLoading
            ? <Skeleton className="h-7 w-64 mb-1" />
            : (
              <h1 className="text-2xl font-bold tracking-tight truncate flex items-center gap-2">
                {user?.first_name} {user?.last_name}
                {user?.role && <RoleBadge role={user.role} className="" />}
                {user?.is_active === false && <Badge variant="destructive">Deshabilitado</Badge>}
              </h1>
            )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Cédula: <span className="font-mono font-semibold text-foreground">{user?.cedula ?? '—'}</span></span>
            <span>@{user?.username}</span>
            {user?.email && <span>{user.email}</span>}
          </div>
        </div>
      </div>

      {editTo && <Button variant="secondary" size="sm" className="h-9 shadow-sm" asChild>
        <Link to={editTo}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar datos
        </Link>
      </Button>}
    </div>
  )
}

export function UserFacts({ user }: { user: User | undefined }) {
  return (
    <div className="flex flex-wrap gap-6 text-sm bg-background p-3 rounded-lg border shadow-sm w-fit">
      <p className="text-muted-foreground">Organización: <span className="text-foreground font-medium">{user?.profile?.organization?.name ?? '—'}</span></p>
      <p className="text-muted-foreground">Ubicación: <span className="text-foreground font-medium">{user?.profile?.location ? `${user.profile.location.municipality}, ${user.profile.location.department}` : '—'}</span></p>
      {user?.created_at && (
        <p className="text-muted-foreground">Registrado: <span className="text-foreground font-medium">{format(new Date(user.created_at), 'd MMM yyyy', { locale: es })}</span></p>
      )}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: LucideIcon, color: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-muted/50 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function VarkCard({ vark }: { vark: VarkProfileDto }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Estilo de aprendizaje (VARK)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <Badge variant="outline" className="text-sm">{vark.dominant_style ?? 'Sin completar'}</Badge>
          <div className="flex gap-6 text-sm">
            <p className="text-muted-foreground">Visual: <span className="text-foreground font-medium tabular-nums">{vark.visual_score ?? 0}</span></p>
            <p className="text-muted-foreground">Auditivo: <span className="text-foreground font-medium tabular-nums">{vark.auditory_score ?? 0}</span></p>
            <p className="text-muted-foreground">Lector: <span className="text-foreground font-medium tabular-nums">{vark.reading_score ?? 0}</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TableCard({ title, empty, isEmpty, children }: { title: string, empty: string, isEmpty: boolean, children: ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isEmpty ? <p className="text-sm text-muted-foreground p-5">{empty}</p> : <div className="overflow-x-auto">{children}</div>}
      </CardContent>
    </Card>
  )
}

export function ProgressHistory({ progress }: { progress: ProgressRow[] }) {
  return (
    <TableCard title="Historial de intentos por riesgo" empty="Sin intentos registrados todavía." isEmpty={progress.length === 0}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Riesgo</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Errores</TableHead>
            <TableHead>Tiempo de reacción</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {progress.map(p => (
            <TableRow key={p.id}>
              <TableCell className="text-sm">
                <p className="font-medium">{p.risk?.name ?? p.risk_id}</p>
                <p className="text-xs text-muted-foreground">{p.risk?.category}</p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{p.risk?.level?.name ?? '—'}</TableCell>
              <TableCell>
                {p.is_mitigated
                  ? <Badge className="bg-green-600 hover:bg-green-600 text-xs">Mitigado</Badge>
                  : <Badge variant="destructive" className="text-xs">Fallido</Badge>}
              </TableCell>
              <TableCell className="text-sm tabular-nums">{p.mistakes_count ?? 0}</TableCell>
              <TableCell className="text-sm tabular-nums">{shortSeconds(p.reaction_time_ms)}</TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(p.recorded_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  )
}

export function UserSessions({ sessions, base }: { sessions: UserSessionDto[], base: string }) {
  return (
    <TableCard title="Sesiones de entrenamiento" empty="Aún no se ha unido a ninguna sesión." isEmpty={sessions.length === 0}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Sesión</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Se unió</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map(su => (
            <TableRow key={su.id}>
              <TableCell className="text-sm font-medium">
                <Link to={`${base}/sessions/${su.session?.id}`} className="hover:underline">
                  {su.session?.name ?? '—'}
                </Link>
              </TableCell>
              <TableCell className="text-sm font-mono">{su.session?.code}</TableCell>
              <TableCell className="text-sm text-muted-foreground capitalize">{su.session?.status}</TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(su.joined_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  )
}
