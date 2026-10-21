import { test, expect } from '@playwright/test'

// Humo de la portada pública: carga sin errores de JavaScript, sin llamar a la API y con los enlaces
// al juego y al acceso de instructores.
for (const { name, viewport } of [
  { name: 'escritorio', viewport: { width: 1440, height: 900 } },
  { name: 'movil', viewport: { width: 390, height: 844 } },
]) {
  test(`portada ${name}`, async ({ page }) => {
    const errors: string[] = []
    const apiCalls: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()) })
    page.on('request', (r) => { if (r.url().startsWith('http://api.test')) apiCalls.push(r.url()) })
    await page.setViewportSize(viewport)

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /Aprende a ver el riesgo/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Jugar ahora/ })).toHaveAttribute('href', 'https://play.test')
    await expect(page.getByRole('link', { name: 'Acceso instructores' }).first()).toHaveAttribute('href', '/login')
    await page.screenshot({ path: `test-results/portada-${name}.png`, fullPage: true })

    // Portada → acceso (con View Transition donde el navegador la soporta)
    await page.getByRole('link', { name: 'Soy instructor' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText('Iniciar sesión').first()).toBeVisible()

    expect(errors).toEqual([])
    expect(apiCalls).toEqual([])
  })
}
