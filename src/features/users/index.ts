// API pública del feature de usuarios.
import { bindPort } from '@/shared/lib/ports'
import { usersPort } from './application/ports'
import { usersHttp } from './infrastructure/usersHttp'

export { UsersPage } from './ui/pages/UsersPage'
export { UserDetailPage } from './ui/pages/UserDetailPage'
export { UserFormPage } from './ui/pages/UserFormPage'

export const usersBindings = [bindPort(usersPort, usersHttp)]
