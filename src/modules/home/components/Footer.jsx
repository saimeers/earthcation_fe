import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2 text-sm font-semibold">
          Earthcation
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Texto Footer
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