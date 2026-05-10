import {
  Users, MapPin, Building2, Shield, LayoutDashboard, CalendarDays, BarChart3
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavUser }      from './NavUser'
import { useAuthStore } from '@/store/authStore'

const adminNav = [
  {
    label: 'Principal',
    items: [
      { title: 'Analíticas',     url: '/admin',               icon: BarChart3       },
      { title: 'Usuarios',       url: '/admin/users',          icon: Users           },
      { title: 'Sesiones',       url: '/admin/sessions',       icon: CalendarDays    },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { title: 'Localidades',    url: '/admin/locations',      icon: MapPin          },
      { title: 'Organizaciones', url: '/admin/organizations',  icon: Building2       },
    ],
  },
]

export function AppSidebar({ ...props }) {
  const location      = useLocation()
  const user          = useAuthStore(s => s.user)
  const { setOpen }   = useSidebar()

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">Earthcation</span>
                  <span className="truncate text-xs capitalize text-sidebar-foreground/60">
                    {user?.role ?? 'admin'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {adminNav.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => {
                  const active = location.pathname === item.url
                    || (item.url !== '/admin' && location.pathname.startsWith(item.url))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
                        onClick={() => setOpen(false)}>
                        <Link to={item.url}>
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

    </Sidebar>
  )
}