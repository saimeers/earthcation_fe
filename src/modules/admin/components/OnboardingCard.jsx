import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

// Guía de bienvenida por página — reemplaza el tour tipo "spotlight" (se sacó porque
// desalineaba el contenido al hacer scroll). Es una tarjeta normal en el flujo de la página,
// descartable, que se recuerda por `storageKey` en authStore (`pageToursSeen`, o `onboardingSeen`
// para la de Analíticas). No bloquea nada ni se superpone a otros elementos.
export function OnboardingCard({ storageKey, title, description, tips, ctaLabel, onCta }) {
  const seen = useAuthStore(s => storageKey === 'dashboard' ? s.onboardingSeen : s.pageToursSeen[storageKey])
  const completeOnboarding = useAuthStore(s => s.completeOnboarding)
  const completePageTour = useAuthStore(s => s.completePageTour)

  const dismiss = () => {
    if (storageKey === 'dashboard') completeOnboarding()
    else completePageTour(storageKey)
  }

  if (seen) return null

  return (
    <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label="Cerrar guía">
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>

          {tips?.length > 0 && (
            <ul className="space-y-1">
              {tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 pt-1">
            {ctaLabel && onCta && (
              <Button size="sm" className="h-8" onClick={() => { onCta(); dismiss() }}>
                {ctaLabel}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={dismiss}>
              Entendido, no mostrar de nuevo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
