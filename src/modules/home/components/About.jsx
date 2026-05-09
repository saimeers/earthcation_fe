export default function About() {
  return (
    <section id="sobre" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">

        <div className="mb-16 text-center space-y-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Sobre el juego
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Seguridad minera a través del aprendizaje experiencial
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Earthcation combina tecnología educativa con simulación de entornos mineros
            para formar trabajadores capaces de identificar y mitigar riesgos reales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Diagnóstico VARK',
              desc: 'Al iniciar, el juego identifica tu estilo de aprendizaje predominante — visual, auditivo o lector — y adapta la instrucción para que la información llegue de la manera más efectiva para ti.',
            },
            {
              title: 'Equipamiento de protección',
              desc: 'Antes de ingresar a la mina, el jugador debe equiparse correctamente con todos los elementos de protección personal. El sistema valida cada prenda y ofrece retroalimentación contextualizada.',
            },
            {
              title: 'Identificación de riesgos',
              desc: 'En cada nivel, el jugador enfrenta situaciones que replican riesgos reales del entorno minero: riesgos mecánicos, eléctricos, químicos y de altura. Debe tomar decisiones correctas bajo presión.',
            },
            {
              title: 'Seguimiento en tiempo real',
              desc: 'Los instructores monitorean el avance de cada jugador durante las sesiones de capacitación, visualizando métricas de desempeño, tiempo de reacción y porcentaje de riesgos mitigados.',
            },
          ].map(item => (
            <div key={item.title}
              className="p-6 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors space-y-2">
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}