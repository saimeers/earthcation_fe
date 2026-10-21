import type { AxiosProgressEvent } from 'axios'
import { externalHttp, http } from '@/shared/api/client'
import type { CreateVersionResponseDto, DeployStatusDto, GameVersionDto, PreviewDto } from '@/shared/api/types'
import type { DeployGateway } from '../application/ports'

export const deployHttp: DeployGateway = {
  status: () => http.get<DeployStatusDto>('/api/deploy/status'),
  versions: () => http.get<GameVersionDto[]>('/api/deploy/versions'),
  create: (input) => http.post<CreateVersionResponseDto>('/api/deploy/versions', input),
  upload: (ticket, file, onProgress) => {
    const options = {
      headers: ticket.headers,
      onUploadProgress: (e: AxiosProgressEvent) => onProgress?.(e.total ? e.loaded / e.total : 0),
    }
    return ticket.mode === 'presigned' ? externalHttp.upload(ticket.url, file, options) : http.upload(ticket.url, file, options)
  },
  complete: (id) => http.post<GameVersionDto>(`/api/deploy/versions/${id}/complete`),
  activate: (id) => http.post<GameVersionDto>(`/api/deploy/versions/${id}/activate`),
  preview: (id) => http.get<PreviewDto>(`/api/deploy/versions/${id}/preview`).then(r => r.url),
  remove: (id) => http.delete(`/api/deploy/versions/${id}`),
}
