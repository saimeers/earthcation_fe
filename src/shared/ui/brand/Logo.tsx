import '@fontsource-variable/archivo/wdth.css'
import { cn } from '@/shared/lib/utils'

/** Ámbar de seguridad de la marca: el mismo de la portada y del favicon (public/logo.svg). */
const AMBER = '#f4a51c'

/** Glifo de la marca: la entrada de la mina con su labor bajando en ámbar. Toma el color del texto. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 14 22" className={className}>
      <path d="M1 7 L7 1 L13 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="5" y="9" width="4" height="13" fill={AMBER} />
    </svg>
  )
}

/** Logotipo completo (glifo + nombre condensado). Es el único que usan portada, acceso, panel e informes. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-end gap-1.5 text-2xl leading-none font-extrabold uppercase', className)}
      style={{ fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif", fontStretch: '68%' }}>
      <LogoMark className="h-[0.95em] w-auto" />
      Earthcation
    </span>
  )
}
