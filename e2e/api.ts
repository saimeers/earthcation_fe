import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page, Route } from '@playwright/test'

// La API se simula con respuestas reales grabadas desde una API local sembrada (earthcation_be,
// tests/support/seed.cjs). Grabar de nuevo: E2E_RECORD_URL=http://localhost:3999 y E2E_TOKEN_<ROL>.
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const RECORD_URL = process.env.E2E_RECORD_URL

interface Recording { status: number, body: unknown }

export interface PanelUser { id: string, role: string, first_name: string, last_name: string }

const fileFor = (role: string, method: string, url: string) => {
  const { pathname, search } = new URL(url)
  const name = `${method} ${pathname}${search}`.replace(/[^a-zA-Z0-9._-]+/g, '_')
  return path.join(DIR, role, `${name}.json`)
}

const record = async (route: Route, file: string): Promise<Recording> => {
  const req = route.request()
  const { pathname, search } = new URL(req.url())
  const res = await fetch(`${RECORD_URL}${pathname}${search}`, {
    method: req.method(), headers: { authorization: req.headers().authorization ?? '', 'content-type': 'application/json' },
    body: req.postData() ?? undefined,
  })
  const body: unknown = await res.json().catch(() => null)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ status: res.status, body }, null, 2))
  return { status: res.status, body }
}

const replay = (file: string): Recording | null =>
  (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) as Recording : null)

// Devuelve las llamadas sin respuesta grabada: la prueba falla si la página pide algo nuevo
export async function mockApi(page: Page, role: string): Promise<string[]> {
  const missing: string[] = []
  await page.route('http://api.test/**', async (route) => {
    const file = fileFor(role, route.request().method(), route.request().url())
    const hit = RECORD_URL ? await record(route, file) : replay(file)
    if (!hit) missing.push(path.basename(file))
    await route.fulfill({ status: hit?.status ?? 404, json: hit?.body ?? { error: 'Sin respuesta grabada' } })
  })
  return missing
}

// Sesión iniciada como la deja el login (zustand persist en localStorage)
export async function loginAs(page: Page, user: PanelUser): Promise<void> {
  const token = process.env[`E2E_TOKEN_${user.role.toUpperCase()}`] ?? 'token-de-prueba'
  const state = { state: { token, user, onboardingSeen: true, pageToursSeen: {} }, version: 0 }
  await page.addInitScript((s) => localStorage.setItem('auth-storage', s), JSON.stringify(state))
}
