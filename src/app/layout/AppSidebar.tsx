import type { ComponentProps } from 'react'
import { Users, MapPin, Building2, CalendarDays, BarChart3, Activity, Rocket, Globe2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  useSidebar,
} from '@/shared/ui/sidebar'
import { useAuthStore, type PanelBase } from '@/features/auth'
import { LogoMark } from '@/shared/ui/brand/Logo'
import { NavUser } from './NavUser'

interface NavItem { title: string, url: string, icon: LucideIcon }
interface NavGroup { label: string, items: NavItem[] }

const adminNav: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { title: 'Analíticas', url: '/admin', icon: BarChart3 },
      { title: 'Usuarios', url: '/admin/users', icon: Users },
      { title: 'Sesiones', url: '/admin/sessions', icon: CalendarDays },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { title: 'Localidades', url: '/admin/locations', icon: MapPin },
      { title: 'Organizaciones', url: '/admin/organizations', icon: Building2 },
    ],
  },
]

// El instructor solo gestiona sus sesiones (y ve el "Juego libre" de su ubicación)
const instructorNav: NavGroup[] = [
  {
    label: 'Principal',
    items: [{ title: 'Mis sesiones', url: '/instructor', icon: CalendarDays }],
  },
]

// Desarrollador/Soporte: despliegue del juego y soporte; el resto del panel en modo lectura
const developerNav: NavGroup[] = [
  {
    label: 'Despliegue',
    items: [
      { title: 'Salud del servicio', url: '/developer', icon: Activity },
      { title: 'Versiones del juego', url: '/developer/versions', icon: Rocket },
      { title: 'Visitas', url: '/developer/visits', icon: Globe2 },
    ],
  },
  {
    label: 'Consulta',
    items: [
      { title: 'Analíticas', url: '/developer/analytics', icon: BarChart3 },
      { title: 'Usuarios', url: '/developer/users', icon: Users },
      { title: 'Sesiones', url: '/developer/sessions', icon: CalendarDays },
    ],
  },
]

const NAV_BY_BASE: Record<PanelBase, NavGroup[]> = {
  '/admin': adminNav,
  '/instructor': instructorNav,
  '/developer': developerNav,
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const user = useAuthStore(s => s.user)
  const { setOpen } = useSidebar()
  const isInstructor = location.pathname.startsWith('/instructor')
  const isDeveloper = location.pathname.startsWith('/developer')
  const base: PanelBase = isInstructor ? '/instructor' : isDeveloper ? '/developer' : '/admin'
  const nav = NAV_BY_BASE[base]

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={base}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#1b1613] text-[#f1e7d3] ring-1 ring-sidebar-border shrink-0">
                  <LogoMark className="h-5 w-auto" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate text-base font-extrabold uppercase [font-stretch:68%]">Earthcation</span>
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
        {nav.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => {
                  const active = location.pathname === item.url
                    || (item.url !== base && location.pathname.startsWith(item.url))
                    || (isInstructor && location.pathname.startsWith('/instructor/sessions'))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
                        onClick={() => setOpen(true)}>
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
