import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../domain/roles'
import { dismissGuide, resetGuides, type GuidesState } from '../domain/onboarding'

/** Clave de localStorage de la sesión (la usan también las pruebas de humo para entrar). */
export const AUTH_STORAGE_KEY = 'auth-storage'

interface AuthState extends GuidesState {
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
  dismissGuide: (key: string) => void
  resetAllTours: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      onboardingSeen: false,
      pageToursSeen: {},

      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      dismissGuide: (key) => set(s => dismissGuide(s, key)),
      resetAllTours: () => set(resetGuides()),
    }),
    { name: AUTH_STORAGE_KEY },
  ),
)

/** Token actual fuera de React (cliente HTTP). */
export const currentToken = (): string | null => useAuthStore.getState().token

/** La API respondió 401: se borra la sesión guardada y se vuelve al login con recarga completa. */
export function expireSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.location.href = '/login'
}
