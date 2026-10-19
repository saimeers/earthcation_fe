import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

const renderAdmin = () => render(
  <MemoryRouter initialEntries={['/admin']}>
    <Routes>
      <Route path="/" element={<p>inicio</p>} />
      <Route path="/login" element={<p>login</p>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><p>panel admin</p></ProtectedRoute>} />
    </Routes>
  </MemoryRouter>,
)

describe('ProtectedRoute', () => {
  beforeEach(() => useAuthStore.setState({ token: null, user: null }))

  it('sin token manda al login', () => {
    renderAdmin()
    expect(screen.getByText('login')).toBeInTheDocument()
  })

  it('con otro rol manda al inicio', () => {
    useAuthStore.setState({ token: 't', user: { role: 'instructor' } })
    renderAdmin()
    expect(screen.getByText('inicio')).toBeInTheDocument()
  })

  it('con el rol permitido muestra la página', () => {
    useAuthStore.setState({ token: 't', user: { role: 'admin' } })
    renderAdmin()
    expect(screen.getByText('panel admin')).toBeInTheDocument()
  })
})
