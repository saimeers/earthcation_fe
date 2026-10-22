import type { AxiosProgressEvent } from 'axios'
import { externalHttp, http } from '@/shared/api/client'
import { v1 } from '@/shared/api/v1'
import type { CreateVersionResponseDto, DeployStatusDto, GameVersionDto, PreviewDto } from '@/shared/api/types'
import type { DeployGateway } from '../application/ports'

export const deployHttp: DeployGateway = {
  status: () => v1.get<DeployStatusDto>('/game-versions/status'),
  versions: () => v1.list<GameVersionDto>('/game-versions'),
  create: (input) => v1.post<CreateVersionResponseDto>('/game-versions', input),
  upload: (ticket, file, onProgress) => {
    const options = {
      headers: ticket.headers,
      onUploadProgress: (e: AxiosProgressEvent) => onProgress?.(e.total ? e.loaded / e.total : 0),
    }
    return ticket.mode === 'presigned' ? externalHttp.upload(ticket.url, file, options) : http.upload(ticket.url, file, options)
  },
  complete: (id) => v1.post<GameVersionDto>(`/game-versions/${id}/completion`),
  activate: (id) => v1.post<GameVersionDto>(`/game-versions/${id}/activation`),
  preview: (id) => v1.get<PreviewDto>(`/game-versions/${id}/preview-url`).then(r => r.url),
  editNotes: (id, notes) => v1.patch<GameVersionDto>(`/game-versions/${id}`, { notes }),
  remove: (id) => v1.delete(`/game-versions/${id}`),
}
