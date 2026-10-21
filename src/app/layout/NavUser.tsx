import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronsUpDown, LogOut, Sun, Moon, Monitor, HelpCircle } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuPortal,
} from '@/shared/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar'
import { useAuthStore } from '@/features/auth'

type Theme = 'light' | 'dark' | 'system'

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme | null) ?? 'system')

  const apply = (t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') root.classList.add('dark')
    else if (t === 'light') root.classList.remove('dark')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }

  const change = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    apply(t)
  }

  useEffect(() => { apply(theme) }, [theme])
  return { theme, change }
}

export function NavUser() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const resetAllTours = useAuthStore(s => s.resetAllTours)
  const navigate = useNavigate()
  const { theme, change } = useTheme()

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'U'
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                {initials}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64 rounded-xl z-101 bg-popover text-popover-foreground shadow-xl"
            side="top"
            align="start"
            sideOffset={8}
            collisionPadding={16}>

            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-2.5 ">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  {initials}
                </div>
                <div className="grid flex-1 text-left leading-tight min-w-0">
                  <span className="truncate font-semibold text-sm text-foreground">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
                <ThemeIcon className="size-4 text-muted-foreground shrink-0" />
                <span>Apariencia</span>
                <span className="ml-auto text-xs text-muted-foreground capitalize">{
                  theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'
                }</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  className="min-w-40 rounded-xl bg-popover shadow-xl z-101"
                  sideOffset={8}>
                  {([
                    { value: 'light', label: 'Claro', Icon: Sun },
                    { value: 'dark', label: 'Oscuro', Icon: Moon },
                    { value: 'system', label: 'Sistema', Icon: Monitor },
                  ] as const).map(({ value, label, Icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => change(value)}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                      <Icon className="size-4 text-muted-foreground shrink-0" />
                      <span>{label}</span>
                      {theme === value && (
                        <span className="ml-auto text-xs text-muted-foreground">activo</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={resetAllTours}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
              <HelpCircle className="size-4 text-muted-foreground shrink-0" />
              <span>Ver guías de nuevo</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm  text-">
              <LogOut className="size-4 shrink-0" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
