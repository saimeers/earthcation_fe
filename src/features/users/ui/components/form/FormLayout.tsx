import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'

export const inputCls = 'h-9 text-sm md:text-sm'

export function FormSection({ icon: Icon, title, description, children }: { icon: LucideIcon, title: string, description?: string, children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex items-start gap-3 border-b px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="h-4 w-4" /></span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </header>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  )
}

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function Field({ label, required, error, hint, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
