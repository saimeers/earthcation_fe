import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { bindPort, PortsProvider } from '@/shared/lib/ports'
import { deployPort, type DeployGateway } from '../../application/ports'
import type { GameVersion } from '../../domain/deploy'
import { NotesEditor } from './NotesEditor'

const version = { id: 'v1', label: '2.1.2', notes: 'Iluminaci�n de la mina' } as GameVersion

function setup(editNotes = vi.fn().mockResolvedValue({ ...version, notes: 'ok' })) {
  const gateway = { editNotes } as unknown as DeployGateway
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <PortsProvider bindings={[bindPort(deployPort, gateway)]}><NotesEditor v={version} /></PortsProvider>
    </QueryClientProvider>,
  )
  return editNotes
}

describe('NotesEditor', () => {
  it('muestra la nota y la corrige con el lápiz: manda el texto recortado y vuelve a la lectura', async () => {
    const editNotes = setup()
    const user = userEvent.setup()
    expect(screen.getByText('Iluminaci�n de la mina')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar la nota de la versión 2.1.2' }))
    const box = screen.getByRole('textbox', { name: 'Nota de la versión 2.1.2' })
    await user.clear(box)
    await user.type(box, '  Iluminación de la mina  ')
    await user.click(screen.getByRole('button', { name: /Guardar/ }))

    await waitFor(() => { expect(editNotes).toHaveBeenCalledWith('v1', 'Iluminación de la mina') })
    await waitFor(() => { expect(screen.queryByRole('textbox')).not.toBeInTheDocument() })
  })

  it('cancelar descarta el cambio sin llamar a la API', async () => {
    const editNotes = setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Editar la nota de la versión 2.1.2' }))
    await user.type(screen.getByRole('textbox'), ' extra')
    await user.click(screen.getByRole('button', { name: /Cancelar/ }))
    expect(editNotes).not.toHaveBeenCalled()
    expect(screen.getByText('Iluminaci�n de la mina')).toBeInTheDocument()
  })
})
