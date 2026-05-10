import { useState }  from 'react'
import { Link }      from 'react-router-dom'
import { useQuery }  from '@tanstack/react-query'
import { Input }     from '../../components/ui/input'
import { Badge }     from '../../components/ui/badge'
import { Button }    from '../../components/ui/button'
import { Skeleton }  from '../../components/ui/skeleton'
import { Separator } from '../../components/ui/separator'
import { userService }  from '../../services/user.service'

export default function PlayersPage() {
  const [search, setSearch] = useState('')

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn:  () => playerService.getAll({ role: 'player' }).then(r => r.data),
  })

  const filtered = players?.filter(p =>
    `${p.first_name} ${p.last_name} ${p.cedula} ${p.username}`
      .toLowerCase()
      .includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consulta el perfil y progreso de cada jugador
        </p>
      </div>

      <Separator className="mb-6" />

      <Input
        placeholder="Buscar por nombre, cédula o usuario..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 max-w-sm"
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {filtered.map(player => (
            <div key={player.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {player.first_name} {player.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {player.cedula} · @{player.username}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {player.varkProfile?.dominant_style && (
                  <Badge variant="outline" className="text-xs">
                    {player.varkProfile.dominant_style}
                  </Badge>
                )}
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/players/${player.id}`}>Ver perfil</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}