import { Fragment, type CSSProperties } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui/sidebar'
import { Separator } from '@/shared/ui/separator'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink,
} from '@/shared/ui/breadcrumb'
import { usePanelBase, type PanelBase } from '@/features/auth'
import { AppSidebar } from './AppSidebar'

interface Crumb { label: string, href: string }

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Resumen',
  '/admin/users': 'Usuarios',
  '/admin/sessions': 'Sesiones',
  '/admin/locations': 'Localidades',
  '/admin/organizations': 'Organizaciones',
  '/admin/audit': 'Auditoría',
  '/instructor': 'Mis sesiones',
  '/developer': 'Salud del servicio',
  '/developer/versions': 'Versiones del juego',
  '/developer/visits': 'Visitas',
  '/developer/audit': 'Auditoría',
  '/developer/analytics': 'Analíticas',
  '/developer/users': 'Usuarios',
  '/developer/sessions': 'Sesiones',
}

const BASE_LABEL: Record<PanelBase, string> = { '/admin': 'Admin', '/instructor': 'Instructor', '/developer': 'Soporte' }

function breadcrumbsFor(pathname: string, base: PanelBase, isIndex: boolean): Crumb[] {
  const sessionsHref = base === '/instructor' ? '/instructor' : `${base}/sessions`
  const sessionsLabel = base === '/instructor' ? 'Mis sesiones' : 'Sesiones'

  const participantMatch = /^\/(?:admin|instructor|developer)\/sessions\/([^/]+)\/participants\//.exec(pathname)
  if (participantMatch) {
    return [
      { label: sessionsLabel, href: sessionsHref },
      { label: 'Detalle de la sesión', href: `${base}/sessions/${participantMatch[1]}` },
      { label: 'Análisis del participante', href: pathname },
    ]
  }
  if (pathname.startsWith(`${base}/sessions/`)) {
    return [
      { label: sessionsLabel, href: sessionsHref },
      { label: 'Detalle de la sesión', href: pathname },
    ]
  }
  if (pathname.startsWith(`${base}/users/`)) {
    const label = pathname.endsWith('/new') ? 'Nuevo usuario'
      : pathname.endsWith('/edit') ? 'Editar usuario'
      : pathname.endsWith('/bulk-import') ? 'Importación masiva'
      : 'Detalle'
    return [
      { label: 'Usuarios', href: `${base}/users` },
      { label, href: pathname },
    ]
  }
  const label = BREADCRUMB_MAP[pathname] ?? 'Admin'
  return isIndex ? [] : [{ label, href: pathname }]
}

// Layout de los 3 paneles (admin/instructor/developer): sidebar + encabezado con migas de pan + Outlet.
export function AppShell() {
  const location = useLocation()
  const base = usePanelBase()
  const isIndex = location.pathname === base
  const breadcrumbs = breadcrumbsFor(location.pathname, base, isIndex)

  return (
    <SidebarProvider style={{ '--sidebar-width': '16rem' } as CSSProperties}>
      <AppSidebar />

      <SidebarInset className="min-h-svh">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-20 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              {!isIndex && (
                <>
                  <BreadcrumbItem className="hidden sm:block">
                    <BreadcrumbLink asChild>
                      <Link to={base} className="text-xs">{BASE_LABEL[base]}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                </>
              )}

              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-xs font-medium">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href} className="text-xs">{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator className="hidden sm:block" />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-muted/10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
