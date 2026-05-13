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

const breadcrumbMap = {
  '/admin':               'Resumen',
  '/admin/users':         'Usuarios',
  '/admin/sessions':      'Sesiones', 
  '/admin/locations':     'Localidades',
  '/admin/organizations': 'Organizaciones',
}

export default function AdminPage() {
  const location = useLocation()
  const isIndex  = location.pathname === '/admin'

  const getBreadcrumbs = () => {
    const paths = []
    
    if (location.pathname.startsWith('/admin/sessions/')) {
      paths.push({ label: 'Sesiones', href: '/admin/sessions' })
      paths.push({ label: 'Detalle de la sesión', href: location.pathname })
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
                      <Link to="/admin" className="text-xs">Admin</Link>
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