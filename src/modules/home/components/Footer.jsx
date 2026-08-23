import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto py-10 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2 text-sm font-semibold">
          Earthcation
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Proyecto del Semillero VIRAL — Universidad Francisco de Paula Santander
        </p>

        <Link
          to="/login"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Acceso instructores
        </Link>

      </div>
    </footer>
  )
}
