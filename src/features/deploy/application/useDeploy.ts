import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePort } from '@/shared/lib/ports'
import type { Uuid } from '@/shared/api/types'
import { isPublishing } from '../domain/deploy'
import { deployKeys, deployPort, type UploadProgress } from './ports'

export function useDeployStatus() {
  const gateway = usePort(deployPort)
  return useQuery({ queryKey: deployKeys.status(), queryFn: () => gateway.status() })
}

/** Mientras una versión se publica se consulta cada 3 s hasta que quede lista o falle. */
export function useVersions() {
  const gateway = usePort(deployPort)
  return useQuery({
    queryKey: deployKeys.versions(),
    queryFn: () => gateway.versions(),
    refetchInterval: (query) => (isPublishing(query.state.data) ? 3000 : false),
  })
}

interface UploadInput { file: File, label: string, notes: string, onProgress?: UploadProgress }

export function useDeployActions() {
  const gateway = usePort(deployPort)
  const qc = useQueryClient()
  const refresh = () => void qc.invalidateQueries({ queryKey: ['deploy'] })

  // Crear la versión → subir el ZIP (S3 prefirmado o API) → pedir la publicación
  const upload = useMutation({
    mutationFn: async ({ file, label, notes, onProgress }: UploadInput) => {
      const { version, upload: ticket } = await gateway.create({ label, notes, size_bytes: file.size })
      await gateway.upload(ticket, file, onProgress)
      return gateway.complete(version.id)
    },
    onSettled: refresh,
  })
  const retry = useMutation({ mutationFn: (id: Uuid) => gateway.complete(id), onSettled: refresh })
  const activate = useMutation({ mutationFn: (id: Uuid) => gateway.activate(id), onSettled: refresh })
  const editNotes = useMutation({ mutationFn: ({ id, notes }: { id: Uuid, notes: string }) => gateway.editNotes(id, notes), onSettled: refresh })
  const remove = useMutation({ mutationFn: (id: Uuid) => gateway.remove(id), onSettled: refresh })
  const preview = useMutation({ mutationFn: (id: Uuid) => gateway.preview(id) })

  return { upload, retry, activate, editNotes, remove, preview }
}
