export default function Features() {
  return (
    <section id="objetivos" className="py-24 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">

        <div className="mb-16 text-center space-y-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Objetivos de aprendizaje
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Lo que el jugador desarrolla
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              number: '01',
              title:  'Reconocimiento de riesgos',
              desc:   'Identificar visualmente los peligros presentes en un entorno minero y clasificarlos por tipo y nivel de criticidad.',
            },
            {
              number: '02',
              title:  'Aplicación de protocolos',
              desc:   'Ejecutar correctamente los procedimientos de seguridad establecidos ante cada tipo de riesgo identificado.',
            },
            {
              number: '03',
              title:  'Toma de decisiones',
              desc:   'Desarrollar criterio para actuar de forma segura y oportuna ante situaciones de emergencia en el pozo.',
            },
          ].map(item => (
            <div key={item.number} className="space-y-3">
              <span className="text-3xl font-bold text-muted-foreground/30 font-mono">
                {item.number}
              </span>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}