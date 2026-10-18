import React from 'react'
import { Outlet, useLocation, Link }  from 'react-router-dom'
import { AppSidebar }           from '@/modules/admin/components/AppSidebar'
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator }            from '@/components/ui/separator'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink,
} from '@/components/ui/breadcrumb'
import { usePanelBase }         from '@/hooks/usePanelBase'

const breadcrumbMap = {
  '/admin':               'Resumen',
  '/admin/users':         'Usuarios',
  '/admin/sessions':      'Sesiones', 
  '/admin/locations':     'Localidades',
  '/admin/organizations': 'Organizaciones',
  '/instructor':           'Mis sesiones',
  '/developer':            'Salud del servicio',
  '/developer/versions':   'Versiones del juego',
  '/developer/visits':     'Visitas',
  '/developer/analytics':  'Analíticas',
  '/developer/users':      'Usuarios',
  '/developer/sessions':   'Sesiones',
}

export default function AdminPage() {
  const location = useLocation()
  const base     = usePanelBase()
  const isIndex  = location.pathname === base
  // en el panel del instructor la lista de sesiones es la portada (/instructor)
  const sessionsHref = base === '/instructor' ? '/instructor' : `${base}/sessions`
  const sessionsLabel = base === '/instructor' ? 'Mis sesiones' : 'Sesiones'

  const getBreadcrumbs = () => {
    const paths = []
    
    const participantMatch = location.pathname.match(/^\/(?:admin|instructor|developer)\/sessions\/([^/]+)\/participants\//)
    if (participantMatch) {
      paths.push({ label: sessionsLabel, href: sessionsHref })
      paths.push({ label: 'Detalle de la sesión', href: `${base}/sessions/${participantMatch[1]}` })
      paths.push({ label: 'Análisis del participante', href: location.pathname })
    } else if (location.pathname.startsWith(`${base}/sessions/`)) {
      paths.push({ label: sessionsLabel, href: sessionsHref })
      paths.push({ label: 'Detalle de la sesión', href: location.pathname })
    } else if (location.pathname.startsWith(`${base}/users/`)) {
      paths.push({ label: 'Usuarios', href: `${base}/users` })
      paths.push({ label: location.pathname.endsWith('/new') ? 'Nuevo usuario' : location.pathname.endsWith('/edit') ? 'Editar usuario' : location.pathname.endsWith('/bulk-import') ? 'Importación masiva' : 'Detalle', href: location.pathname })
    } else {
      const label = breadcrumbMap[location.pathname] ?? 'Admin'
      if (!isIndex) paths.push({ label, href: location.pathname })
    }
    return paths
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider style={{ '--sidebar-width': '16rem' }}>
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
                      <Link to={base} className="text-xs">{{ '/instructor': 'Instructor', '/developer': 'Soporte' }[base] ?? 'Admin'}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                </>
              )}
              
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.href}>
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
                  </React.Fragment>
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