// API pública del feature de despliegue del juego (panel developer).
import { bindPort } from '@/shared/lib/ports'
import { deployPort } from './application/ports'
import { deployHttp } from './infrastructure/deployHttp'

export { VersionsPage } from './ui/pages/VersionsPage'

export const deployBindings = [bindPort(deployPort, deployHttp)]
