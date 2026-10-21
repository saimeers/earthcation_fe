import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { PortsProvider } from '@/shared/lib/ports'
import { configureHttp } from '@/shared/api/client'
import { analyticsBindings } from '@/features/analytics'
import { authBindings, currentToken, expireSession } from '@/features/auth'
import { bulkImportBindings } from '@/features/bulk-import'
import { deployBindings } from '@/features/deploy'
import { healthBindings } from '@/features/health'
import { locationsBindings } from '@/features/locations'
import { organizationsBindings } from '@/features/organizations'
import { sessionsBindings } from '@/features/sessions'
import { usersBindings } from '@/features/users'
import { visitsBindings } from '@/features/visits'
import { auditBindings } from '@/features/audit'

// El cliente HTTP (shared/api/client) no conoce la sesión: la composición de la app lo conecta con
// el feature de auth. Se hace una sola vez, al cargar este módulo.
configureHttp({ getToken: currentToken, onUnauthorized: expireSession })

const BINDINGS = [
  ...authBindings,
  ...usersBindings,
  ...sessionsBindings,
  ...bulkImportBindings,
  ...locationsBindings,
  ...organizationsBindings,
  ...analyticsBindings,
  ...deployBindings,
  ...visitsBindings,
  ...auditBindings,
  ...healthBindings,
]

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

/** Providers de toda la app: React Query, tooltips y la inyección de dependencias de los features. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PortsProvider bindings={BINDINGS}>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </TooltipProvider>
    </PortsProvider>
  )
}
