import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { toast }       from 'sonner'

export function useBulkImportUsers() {
  const qc = useQueryClient()

  const parseMutation = useMutation({
    mutationFn: (file) => userService.parseBulkImport(file).then(r => r.data.rows),
    onError: (err) => toast.error('Error al leer el archivo', {
      description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
    }),
  })

  const confirmMutation = useMutation({
    mutationFn: (rows) => userService.confirmBulkImport(rows).then(r => r.data),
    onSuccess: (result) => {
      qc.invalidateQueries(['users', 'all'])

      const newOrgs = [...new Set(result.created.map(r => r.organization_created).filter(Boolean))]
      const newLocations = [...new Set(result.created.map(r => r.location_created).filter(Boolean))]

      toast.success('Carga completada', {
        description: `${result.created.length} usuarios creados, ${result.skipped.length} omitidos.`,
      })

      if (newOrgs.length) {
        toast.info(`${newOrgs.length} organización(es) nueva(s) creada(s)`, {
          description: `${newOrgs.join(', ')} — revisa que no sean duplicados de una ya existente con nombre distinto.`,
        })
      }
      if (newLocations.length) {
        toast.info(`${newLocations.length} localidad(es) nueva(s) creada(s)`, {
          description: newLocations.join(', '),
        })
      }
    },
    onError: (err) => toast.error('Error al confirmar la carga', {
      description: err.response?.data?.error ?? 'Ocurrió un error inesperado',
    }),
  })

  return {
    parseFile:   parseMutation.mutateAsync,
    isParsing:   parseMutation.isPending,
    confirmRows: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
  }
}
