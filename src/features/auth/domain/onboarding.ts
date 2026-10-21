// Guías de bienvenida por página: cada una se recuerda por su clave. La de Analíticas ('dashboard')
// usa la bandera histórica `onboardingSeen`; el resto, `pageToursSeen[clave]`.
export const DASHBOARD_GUIDE = 'dashboard'

export interface GuidesState {
  onboardingSeen: boolean
  pageToursSeen: Record<string, boolean>
}

export const guideSeen = (state: GuidesState, key: string): boolean =>
  key === DASHBOARD_GUIDE ? state.onboardingSeen : !!state.pageToursSeen[key]

export const dismissGuide = (state: GuidesState, key: string): Partial<GuidesState> =>
  key === DASHBOARD_GUIDE ? { onboardingSeen: true } : { pageToursSeen: { ...state.pageToursSeen, [key]: true } }

export const resetGuides = (): GuidesState => ({ onboardingSeen: false, pageToursSeen: {} })
