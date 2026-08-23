import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user:  null,
      onboardingSeen: false,
      pageToursSeen: {},

      setAuth: (token, user) => set({ token, user }),
      logout:  ()            => set({ token: null, user: null }),
      completeOnboarding: () => set({ onboardingSeen: true }),
      resetOnboarding:    () => set({ onboardingSeen: false }),
      completePageTour: (key) => set(s => ({ pageToursSeen: { ...s.pageToursSeen, [key]: true } })),
      resetPageTour:    (key) => set(s => ({ pageToursSeen: { ...s.pageToursSeen, [key]: false } })),
      resetAllTours:    ()    => set({ onboardingSeen: false, pageToursSeen: {} }),

      isAuthenticated: () => {
        const state = useAuthStore.getState()
        return !!state.token
      },
    }),
    { name: 'auth-storage' }
  )
)