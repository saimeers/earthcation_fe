import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/client'
import { usePort } from '@/shared/lib/ports'
import { importSideEffects, type ImportResult, type ImportRow } from '../domain/importRows'
import { bulkImportPort } from './ports'

const unexpected = (err: unknown) => apiErrorMessage(err, 'Ocurrió un error inesperado')

function announce(result: ImportResult) {
  const { newOrgs, newLocations, noMatchLocations } = importSideEffects(result)
  toast.success('Carga completada', {
    description: `${result.created.length} usuarios creados, ${result.skipped.length} omitidos.`,
  })
  if (newOrgs.length) {
    toast.info(`${newOrgs.length} organización(es) nueva(s) creada(s)`, {
      description: `${newOrgs.join(', ')} — revisa que no sean duplicados de una ya existente con nombre distinto.`,
    })
  }
  if (newLocations.length) {
    toast.info(`${newLocations.length} localidad(es) nueva(s) creada(s)`, { description: newLocations.join(', ') })
  }
  if (noMatchLocations.length) {
    toast.warning(`${noMatchLocations.length} localidad(es) sin coincidencia en el catálogo oficial`, {
      description: `${noMatchLocations.join(', ')} — revisa si son typos de un municipio ya existente.`,
    })
  }
}

export function useParseImport() {
  const gateway = usePort(bulkImportPort)
  return useMutation({
    mutationFn: (file: File) => gateway.parse(file),
    onError: (err) => toast.error('Error al leer el archivo', { description: unexpected(err) }),
  })
}

export function useConfirmImport() {
  const gateway = usePort(bulkImportPort)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rows: ImportRow[]) => gateway.confirm(rows),
    onSuccess: (result) => {
      // La carga crea usuarios, organizaciones y localidades y mueve las analíticas: se refresca todo
      void qc.invalidateQueries()
      announce(result)
    },
    onError: (err) => toast.error('Error al confirmar la carga', { description: unexpected(err) }),
  })
}
