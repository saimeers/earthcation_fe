import { Link } from 'react-router-dom'
import TextPressure      from '@/components/TextPressure'
import RotatingText      from '@/components/RotatingText'

export default function Hero() {
  return (
    <section id="inicio" className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="max-w-4xl mx-auto text-center space-y-10">

        <div style={{ position: 'relative', height: '120px' }}>
          <TextPressure
            text="Earthcation"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="currentColor"
            minFontSize={48}
            className="text-foreground"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xl sm:text-2xl font-medium text-muted-foreground">
          <span>Un juego serio para</span>
          <RotatingText
            texts={['aprender', 'identificar', 'entrenar', 'protegerte']}
            mainClassName="px-3 py-1 bg-primary text-primary-foreground rounded-md overflow-hidden"
            staggerFrom="last"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-120%' }}
            staggerDuration={0.03}
            splitLevelClassName="overflow-hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={2200}
          />
        </div>

        {/* Descripción */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Earthcation es una plataforma de capacitación en seguridad minera que adapta
          el aprendizaje a tu estilo cognitivo, permitiéndote identificar riesgos y
          aplicar protocolos de seguridad en un entorno simulado.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://play.earthcation.saimers.dev"
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium text-sm hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md w-full sm:w-auto text-center"
          >
            Jugar ahora
          </a>
          <Link
            to="/login"
            className="border border-border bg-background/50 px-8 py-3 rounded-md font-medium text-sm hover:bg-muted transition-colors w-full sm:w-auto text-center">
            Acceso instructores
          </Link>
        </div>
      </div>
    </section>
  )
}