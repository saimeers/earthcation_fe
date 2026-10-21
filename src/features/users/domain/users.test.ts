import { describe, it, expect } from 'vitest'
import { createdMessage, EMPTY_USER_FORM, filterByRole, roleLabel, toUserForm, toUserPayload, type User } from './users'

const user = (data: Partial<User>): User => ({
  id: 'u1', role: 'player', first_name: 'Ana', last_name: 'Ruiz', username: null, cedula: '1090', email: null, age: null, is_active: true, ...data,
})

describe('usuarios', () => {
  it('etiquetas y filtro por rol', () => {
    expect(roleLabel('developer')).toBe('Desarrollador')
    expect(roleLabel('otro')).toBe('otro')
    const list = [user({ id: '1' }), user({ id: '2', role: 'admin' })]
    expect(filterByRole(list, 'admin').map(u => u.id)).toEqual(['2'])
    expect(filterByRole(list, 'all')).toHaveLength(2)
  })

  it('los opcionales vacíos van como null y el usuario por defecto es la cédula', () => {
    const payload = toUserPayload({ ...EMPTY_USER_FORM, first_name: 'Ana', cedula: ' 1090 ', email: '  ' }, false)
    expect(payload).toMatchObject({ email: null, username: '1090', age: null, organization_id: null, location_id: null })
    expect(toUserPayload({ ...EMPTY_USER_FORM, age: '30' }, true)).toMatchObject({ username: undefined, age: 30 })
  })

  it('carga el formulario desde el usuario', () => {
    const form = toUserForm(user({ age: 30, profile: { organization_id: 'o1', location_id: null } }))
    expect(form).toMatchObject({ first_name: 'Ana', age: 30, organization_id: 'o1', location_id: '', email: '' })
  })

  it('aviso tras crear según el rol', () => {
    expect(createdMessage('player', false)).toBe('Ya puede entrar al juego con su cédula.')
    expect(createdMessage('admin', true)).toBe('Le enviamos un correo para que defina su contraseña.')
  })
})
