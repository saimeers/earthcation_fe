import { describe, expect, it } from 'vitest'
import { ApiError, endsSession } from './client'

const err = (status: number | null, serverMessage: string | null = null, code: string | null = null) => new ApiError('x', status, serverMessage, code)

describe('endsSession', () => {
  it('un 401 termina la sesión', () => {
    expect(endsSession(err(401))).toBe(true)
  })

  it('un 403 por token inválido o cuenta deshabilitada termina la sesión, en la API anterior (mensaje) y en v1 (código)', () => {
    expect(endsSession(err(403, 'Token inválido o expirado'))).toBe(true)
    expect(endsSession(err(403, 'La cuenta está deshabilitada'))).toBe(true)
    expect(endsSession(err(403, null, 'TOKEN_INVALID'))).toBe(true)
    expect(endsSession(err(403, 'La cuenta está deshabilitada', 'ACCOUNT_DISABLED'))).toBe(true)
  })

  it('otro 403 es "sin permiso para esto" y no cierra la sesión', () => {
    expect(endsSession(err(403, 'No tienes permiso para esta acción'))).toBe(false)
    expect(endsSession(err(403, 'Ese usuario no está en tus salas', 'USER_OUT_OF_SCOPE'))).toBe(false)
    expect(endsSession(err(403))).toBe(false)
  })

  it('un error de red o de otro estado no cierra la sesión', () => {
    expect(endsSession(err(null))).toBe(false)
    expect(endsSession(err(404, 'No existe'))).toBe(false)
    expect(endsSession(err(500))).toBe(false)
  })
})
