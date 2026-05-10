import { Outlet, useLocation }  from 'react-router-dom'
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
  '/admin/locations':     'Localidades',
  '/admin/organizations': 'Organizaciones',
}

export default function AdminPage() {
  const location = useLocation()
  const label    = breadcrumbMap[location.pathname] ?? 'Admin'
  const isIndex  = location.pathname === '/admin'

  return (
    // defaultOpen={false} en mobile, true en desktop via CSS
    <SidebarProvider
      style={{ '--sidebar-width': '16rem' }}>
      <AppSidebar />

      <SidebarInset className="min-h-svh">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-20 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {!isIndex && (
                <>
                  <BreadcrumbItem className="hidden sm:block">
                    <BreadcrumbLink href="/admin" className="text-xs">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-medium">{label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Contenido */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}