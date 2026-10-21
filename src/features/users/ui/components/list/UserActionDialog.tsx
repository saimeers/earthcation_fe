import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { roleLabel, type UserAction } from '../../../domain/users'

const TITLE = { disable: 'Deshabilitar usuario', enable: 'Habilitar usuario' } as const
const CONFIRM = { disable: 'Deshabilitar', enable: 'Habilitar', role: 'Confirmar' } as const

function description(a: UserAction): string {
  const name = `${a.user.first_name} ${a.user.last_name}`
  if (a.type === 'disable') return `Vas a deshabilitar a ${name}. No podrá acceder al sistema.`
  if (a.type === 'enable') return `Vas a habilitar a ${name}. Recuperará acceso al sistema.`
  return `Cambiarás el rol de ${name} de "${roleLabel(a.user.role)}" a "${roleLabel(a.newRole)}".`
}

/** Confirmación rápida (sin formulario) de deshabilitar, habilitar o cambiar el rol. */
export function UserActionDialog({ action, onConfirm, onCancel }: { action: UserAction | null, onConfirm: () => void, onCancel: () => void }) {
  return (
    <AlertDialog open={!!action} onOpenChange={v => !v && onCancel()}>
      <AlertDialogContent className="bg-background border border-border shadow-2xl z-300 max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action && (action.type === 'role' ? `Cambiar rol a ${roleLabel(action.newRole)}` : TITLE[action.type])}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {action && description(action)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={action?.type === 'disable' ? 'bg-amber-600 hover:bg-amber-700' : ''}>
            {action && CONFIRM[action.type]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
