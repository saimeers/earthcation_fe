import { test, expect } from '@playwright/test'
import { mockApi, loginAs, type PanelUser } from './api'

// Humo: cada panel abre su página inicial con datos reales grabados, sin errores de JavaScript ni
// llamadas a la API sin respuesta.
const PANELS: { role: string, url: string, heading: string, user: PanelUser }[] = [
  { role: 'admin', url: '/admin', heading: 'Panel de analíticas', user: { id: 'u-admin', role: 'admin', first_name: 'Admin', last_name: 'Semilla' } },
  { role: 'instructor', url: '/instructor', heading: 'Mis sesiones', user: { id: 'u-instructor', role: 'instructor', first_name: 'Instructor', last_name: 'Semilla' } },
  { role: 'developer', url: '/developer', heading: 'Salud del servicio', user: { id: 'u-developer', role: 'developer', first_name: 'Soporte', last_name: 'Semilla' } },
]

for (const { role, url, heading, user } of PANELS) {
  test(`panel ${role}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    const missing = await mockApi(page, role)
    await loginAs(page, user)

    await page.goto(url)
    await expect(page.getByText(`${user.first_name} ${user.last_name}`).first()).toBeVisible()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await page.screenshot({ path: `test-results/panel-${role}.png`, fullPage: true })

    expect(errors).toEqual([])
    expect(missing).toEqual([])
  })
}
