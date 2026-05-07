import { Link }   from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">

      <div className="space-y-4 mb-12">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Juego serio de capacitación
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Earthcation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Plataforma de capacitación en seguridad minera mediante aprendizaje experiencial.
          Identifica riesgos, aplica protocolos y desarrolla competencias de seguridad
          en un entorno simulado adaptado a tu estilo de aprendizaje.
        </p>
      </div>

      <Separator className="my-8" />

      <div className="grid sm:grid-cols-3 gap-8 mb-12">
        {[
          {
            title: 'Diagnóstico VARK',
            desc:  'El juego adapta el contenido educativo a tu estilo de aprendizaje predominante.',
          },
          {
            title: 'Identificación de riesgos',
            desc:  'Aprende a reconocer y mitigar riesgos mecánicos, eléctricos y químicos en la mina.',
          },
          {
            title: 'Seguimiento del progreso',
            desc:  'Los instructores monitorean el avance de cada jugador en tiempo real.',
          },
        ].map(obj => (
          <div key={obj.title} className="space-y-2">
            <h3 className="font-semibold text-sm">{obj.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{obj.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <a href="https://play.earthcation.saimers.dev" target="_blank" rel="noreferrer">
            Jugar ahora
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Acceso instructores</Link>
        </Button>
      </div>

    </div>
  )
}