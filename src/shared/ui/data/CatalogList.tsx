import type { ReactNode } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

// Piezas de las páginas de catálogo (localidades, organizaciones): fila con estado y confirmación de
// habilitar/deshabilitar con los colores semánticos (ámbar deshabilita, verde habilita).

interface CatalogRowProps {
  title: string
  subtitle: ReactNode
  subtitleClassName?: string
  isActive: boolean
  onEdit: () => void
  onToggle: () => void
}

export function CatalogRow({ title, subtitle, subtitleClassName = '', isActive, onEdit, onToggle }: CatalogRowProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-colors ${
        isActive
          ? 'hover:bg-muted/40'
          : 'bg-muted/30 opacity-60 hover:opacity-80'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${!isActive && 'text-muted-foreground line-through decoration-muted-foreground/50'}`}>
            {title}
          </p>
          <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px] uppercase font-semibold tracking-wider">
            {isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <p className={`text-xs text-muted-foreground ${subtitleClassName}`.trim()}>
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" className="h-8" onClick={onEdit}>
          Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 ${
            isActive
              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
          }`}
          onClick={onToggle}>
          {isActive ? 'Deshabilitar' : 'Habilitar'}
        </Button>
      </div>
    </div>
  )
}

interface ToggleActiveDialogProps {
  /** Elemento a confirmar (null = cerrado). */
  target: { isActive: boolean } | null
  noun: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ToggleActiveDialog({ target, noun, description, onConfirm, onCancel }: ToggleActiveDialogProps) {
  const verb = target?.isActive ? 'deshabilitar' : 'habilitar'
  return (
    <AlertDialog open={!!target} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="bg-background border border-border shadow-2xl z-300 max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de {verb} {noun}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={target?.isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}
          >
            Sí, {verb}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
