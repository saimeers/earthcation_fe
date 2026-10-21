import { TransitionLink } from '@/shared/ui/TransitionLink'
import { cn } from '@/shared/lib/utils'
import { Logo } from '@/shared/ui/brand/Logo'

const LINKS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#protocolos', label: 'Protocolos' },
  { href: '#instructores', label: 'Instructores' },
]

/** Barra superior: clara en la superficie, oscura en cuanto se empieza a bajar. */
export function LandingHeader({ underground }: { underground: boolean }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-500',
        underground
          ? 'border-(--l-paper)/10 bg-(--l-coal)/95 text-(--l-paper) backdrop-blur'
          : 'border-transparent bg-(--l-limestone) text-(--l-ink)',
      )}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <a href="#superficie" className="l-focus [view-transition-name:brand]" aria-label="Earthcation, volver arriba">
          <Logo />
        </a>
        <nav aria-label="Secciones" className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="l-focus underline-offset-4 hover:underline">{label}</a>
          ))}
        </nav>
        <TransitionLink
          to="/login"
          className={cn(
            'l-focus border-2 px-3 py-1.5 text-sm font-semibold transition-colors',
            underground
              ? 'border-(--l-paper) hover:bg-(--l-paper) hover:text-(--l-ink)'
              : 'border-(--l-ink) hover:bg-(--l-ink) hover:text-(--l-paper)',
          )}>
          Acceso instructores
        </TransitionLink>
      </div>
    </header>
  )
}
