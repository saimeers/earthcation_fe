import { describe, it, expect } from 'vitest'
import {
  countRows, editRow, importSideEffects, initialSelection, rowStatus, selectedRows, toggleAll, toggleIndex, type ImportRow,
} from './importRows'

const row = (cedula: string, status: string): ImportRow => ({
  cedula, status, first_name: 'Ana', last_name: 'Ruiz', email: '', organization_name: 'Mina', location_municipality: 'Cúcuta', location_department: 'Norte de Santander',
})
const ROWS = [row('1', 'ok'), row('2', 'duplicate_in_db'), row('3', 'missing_required'), row('4', 'ok'), row('5', 'duplicate_in_file')]

describe('carga masiva', () => {
  it('cuenta las filas por estado y selecciona solo las listas', () => {
    expect(countRows(ROWS)).toEqual({ ok: 2, duplicate: 2, missing: 1 })
    expect([...initialSelection(ROWS)]).toEqual([0, 3])
  })

  it('estados en español', () => {
    expect(rowStatus('duplicate_in_db')).toEqual({ text: 'Ya existe', tone: 'warning' })
    expect(rowStatus('raro')).toEqual({ text: 'raro', tone: 'none' })
  })

  it('selección y edición de filas', () => {
    const sel = toggleIndex(initialSelection(ROWS), 1)
    expect([...sel].sort()).toEqual([0, 1, 3])
    expect(toggleAll(sel, ROWS.length).size).toBe(5)
    expect(toggleAll(new Set([0, 1, 2, 3, 4]), 5).size).toBe(0)
    expect(selectedRows(ROWS, sel).map(r => r.cedula)).toEqual(['1', '2', '4'])
    expect(editRow(ROWS, 2, 'email', 'ana@mina.co')[2].email).toBe('ana@mina.co')
  })

  it('resume lo que la carga creó por el camino', () => {
    expect(importSideEffects({
      created: [{ organization_created: 'Mina Nueva' }, { organization_created: 'Mina Nueva', location_no_match: 'Cucta' }, {}],
      skipped: [],
    })).toEqual({ newOrgs: ['Mina Nueva'], newLocations: [], noMatchLocations: ['Cucta'] })
  })
})
