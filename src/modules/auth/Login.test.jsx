import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import Login from './Login'
import { useAuthStore } from '@/store/authStore'
import { server, API } from '@/test/server'

// Aurora dibuja con WebGL, que jsdom no tiene
vi.mock('@/components/Aurora', () => ({ default: () => null }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const loginAs = (user, status = 200) => server.use(
  http.post(`${API}/auth/login`, () => (status === 200
    ? HttpResponse.json({ message: 'Login exitoso', token: 'jwt', user })
    : HttpResponse.json({ error: 'Credenciales inválidas' }, { status }))),
)

const submit = async () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        {['admin', 'instructor', 'developer'].map(p => <Route key={p} path={`/${p}`} element={<p>panel {p}</p>} />)}
      </Routes>
    </MemoryRouter>,
  )
  await userEvent.type(screen.getByLabelText('Cédula'), '10000001')
  await userEvent.type(screen.getByLabelText('Contraseña'), 'clave')
  await userEvent.click(screen.getByRole('button', { name: /iniciar|ingresar|entrar/i }))
}

describe('Login', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null })
    vi.clearAllMocks()
  })

  it.each(['admin', 'instructor', 'developer'])('%s entra a su panel', async (role) => {
    loginAs({ id: '1', role, first_name: 'Ana' })
    await submit()
    expect(await screen.findByText(`panel ${role}`)).toBeInTheDocument()
    expect(useAuthStore.getState()).toMatchObject({ token: 'jwt', user: { role } })
  })

  it('un jugador no entra al panel', async () => {
    loginAs({ id: '2', role: 'player', first_name: 'Luis' })
    await submit()
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith('Acceso restringido', expect.anything()))
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('credenciales erradas muestran el mensaje de la API', async () => {
    loginAs(null, 401)
    await submit()
    await vi.waitFor(() => expect(toast.error)
      .toHaveBeenCalledWith('Error al iniciar sesión', { description: 'Credenciales inválidas' }))
  })
})
