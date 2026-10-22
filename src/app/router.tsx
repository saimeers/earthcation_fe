import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/features/landing'
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from '@/features/auth'
import {
  UsersPage, UserFormPage, UserDetailPage,
} from '@/features/users'
import { BulkImportUsersPage } from '@/features/bulk-import'
import { LocationsPage } from '@/features/locations'
import { OrganizationsPage } from '@/features/organizations'
import { AnalyticsPage } from '@/features/analytics'
import {
  SessionsPage, SessionDetailPage, ParticipantAnalysisPage, SessionReportPage,
} from '@/features/sessions'
import { HealthPage } from '@/features/health'
import { VersionsPage } from '@/features/deploy'
import { VisitsPage } from '@/features/visits'
import { AuditPage } from '@/features/audit'
import { ProtectedRoute } from './layout/ProtectedRoute'
import { AppShell } from './layout/AppShell'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<AnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/new" element={<UserFormPage />} />
          <Route path="users/bulk-import" element={<BulkImportUsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="users/:id/edit" element={<UserFormPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/:id" element={<SessionDetailPage />} />
          <Route path="sessions/:id/participants/:userId" element={<ParticipantAnalysisPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>

        {/* Instructor: mismo layout y pantallas de sesiones que el admin, solo con sus salas */}
        <Route path="/instructor" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<SessionsPage />} />
          <Route path="sessions/:id" element={<SessionDetailPage />} />
          <Route path="sessions/:id/participants/:userId" element={<ParticipantAnalysisPage />} />
        </Route>
        <Route path="/instructor/sessions/:id/report" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <SessionReportPage />
          </ProtectedRoute>
        } />

        {/* Desarrollador/Soporte: despliegue + consulta del panel en modo lectura (useCanEdit) */}
        <Route path="/developer" element={
          <ProtectedRoute allowedRoles={['developer', 'admin']}>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<HealthPage />} />
          <Route path="versions" element={<VersionsPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/:id" element={<SessionDetailPage />} />
          <Route path="sessions/:id/participants/:userId" element={<ParticipantAnalysisPage />} />
        </Route>
        <Route path="/developer/sessions/:id/report" element={
          <ProtectedRoute allowedRoles={['developer', 'admin']}>
            <SessionReportPage />
          </ProtectedRoute>
        } />

        {/* Informe imprimible de una sesión — fuera del layout con sidebar para que el PDF salga limpio */}
        <Route path="/admin/sessions/:id/report" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SessionReportPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
