import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deployService } from '@/services/deploy.service'

const busy = (versions) => versions?.some(v => v.status === 'processing')

export function useDeployStatus() {
  return useQuery({
    queryKey: ['deploy', 'status'],
    queryFn: () => deployService.status().then(r => r.data),
  })
}

// Mientras una versión se publica se consulta cada 3 s hasta que quede lista o falle
export function useVersions() {
  return useQuery({
    queryKey: ['deploy', 'versions'],
    queryFn: () => deployService.versions().then(r => r.data),
    refetchInterval: (query) => (busy(query.state.data) ? 3000 : false),
  })
}

export function useDeployActions() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: ['deploy'] })

  // Crear la versión → subir el ZIP (S3 prefirmado o API) → pedir la publicación
  const upload = useMutation({
    mutationFn: async ({ file, label, notes, onProgress }) => {
      const { data } = await deployService.create({ label, notes, size_bytes: file.size })
      await deployService.upload(data.upload, file, e => onProgress?.(e.total ? e.loaded / e.total : 0))
      return (await deployService.complete(data.version.id)).data
    },
    onSettled: refresh,
  })
  const retry = useMutation({ mutationFn: (id) => deployService.complete(id), onSettled: refresh })
  const activate = useMutation({ mutationFn: (id) => deployService.activate(id).then(r => r.data), onSettled: refresh })
  const remove = useMutation({ mutationFn: (id) => deployService.remove(id), onSettled: refresh })
  const preview = useMutation({ mutationFn: (id) => deployService.preview(id).then(r => r.data) })

  return { upload, retry, activate, remove, preview }
}
