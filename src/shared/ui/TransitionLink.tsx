import type { MouseEvent } from 'react'
import { Link, useNavigate, type LinkProps } from 'react-router-dom'
import { withViewTransition, type TransitionDirection } from '@/shared/lib/viewTransition'

type TransitionLinkProps = Omit<LinkProps, 'to'> & { to: string, direction?: TransitionDirection }

// Clic normal (sin teclas modificadoras ni botón del medio): esos casos abren otra pestaña y se dejan al navegador
const isPlainClick = (e: MouseEvent<HTMLAnchorElement>): boolean =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented

/** Link que navega dentro de una View Transition (portada ↔ acceso). Sin soporte, se comporta como un Link. */
export function TransitionLink({ to, direction = 'down', onClick, ...props }: TransitionLinkProps) {
  const navigate = useNavigate()
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (!isPlainClick(e)) return
    e.preventDefault()
    withViewTransition(() => { void navigate(to) }, direction)
  }
  return <Link to={to} onClick={handleClick} {...props} />
}
