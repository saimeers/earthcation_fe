import { Eye, CheckCircle2, Target } from 'lucide-react'

const STEPS = [
  {
    icon: Eye,
    code: 'PROTOCOLO 01',
    title: 'Reconocimiento de riesgos',
    desc: 'Identificar visualmente los peligros presentes en un entorno minero y clasificarlos por tipo y nivel de criticidad.',
  },
  {
    icon: CheckCircle2,
    code: 'PROTOCOLO 02',
    title: 'Aplicación de protocolos',
    desc: 'Ejecutar correctamente los procedimientos de seguridad establecidos ante cada tipo de riesgo identificado.',
  },
  {
    icon: Target,
    code: 'PROTOCOLO 03',
    title: 'Toma de decisiones',
    desc: 'Desarrollar criterio para actuar de forma segura y oportuna ante situaciones de emergencia en el pozo.',
  },
]

export default function Features() {
  return (
    <section id="objetivos" className="py-24 px-6 border-t border-border relative">
      <div className="max-w-5xl mx-auto">

        <div className="mb-16 text-center space-y-3">
          <p className="text-xs font-mono font-medium tracking-widest text-primary uppercase">
            // Objetivos de aprendizaje
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Lo que el jugador desarrolla
          </h2>
        </div>

        <div className="relative grid sm:grid-cols-3 gap-8">
          {/* Línea conectora, evoca la secuencia de un protocolo de seguridad */}
          <div className="hidden sm:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-border" />

          {STEPS.map(({ icon: Icon, code, title, desc }) => (
            <div key={code} className="relative space-y-3 text-center sm:text-left">
              <div className="relative z-10 flex h-12 w-12 mx-auto sm:mx-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-mono font-semibold tracking-widest text-primary/80 uppercase">
                {code}
              </p>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
