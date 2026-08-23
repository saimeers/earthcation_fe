import { BookOpen, HardHat, AlertTriangle, Gauge } from 'lucide-react'

const ITEMS = [
  {
    icon: BookOpen,
    title: 'Diagnóstico VARK',
    desc: 'Al iniciar, el juego identifica tu estilo de aprendizaje predominante — visual, auditivo o lector — y adapta la instrucción para que la información llegue de la manera más efectiva para ti.',
  },
  {
    icon: HardHat,
    title: 'Equipamiento de protección',
    desc: 'Antes de ingresar a la mina, el jugador debe equiparse correctamente con todos los elementos de protección personal. El sistema valida cada prenda y ofrece retroalimentación contextualizada.',
  },
  {
    icon: AlertTriangle,
    title: 'Identificación de riesgos',
    desc: 'En cada nivel, el jugador enfrenta situaciones que replican riesgos reales del entorno minero: riesgos mecánicos, eléctricos, químicos y de altura. Debe tomar decisiones correctas bajo presión.',
  },
  {
    icon: Gauge,
    title: 'Seguimiento en tiempo real',
    desc: 'Los instructores monitorean el avance de cada jugador durante las sesiones de capacitación, visualizando métricas de desempeño, tiempo de reacción y porcentaje de riesgos mitigados.',
  },
]

export default function About() {
  return (
    <section id="sobre" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-16 max-w-xl space-y-3">
          <p className="text-xs font-mono font-medium tracking-widest text-primary uppercase">
            // Sobre el juego
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Capacitación en seguridad minera a través de un videojuego
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Earthcation combina tecnología educativa con simulación de entornos mineros
            para formar trabajadores capaces de identificar y mitigar riesgos reales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="p-6 bg-card hover:bg-accent/40 transition-colors space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
