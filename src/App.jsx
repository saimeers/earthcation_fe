import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'


import AdminPage from './pages/admin/AdminPage'
import UsersAdminPage from './pages/admin/UsersAdminPage'
import UserFormAdminPage from './pages/admin/UserFormAdminPage'
import UserDetailAdminPage from './pages/admin/UserDetailAdminPage'
import BulkImportUsersAdminPage from './pages/admin/BulkImportUsersAdminPage'
import LocationsAdminPage from './pages/admin/LocationsAdminPage'
import OrganizationsAdminPage from './pages/admin/OrganizationsAdminPage'

import AnalyticsAdminPage from './pages/admin/AnalyticsAdminPage'
import SessionsAdminPage from './pages/admin/SessionsAdminPage'
import SessionDetailAdminPage from './pages/admin/SessionDetailAdminPage'

import { ProtectedRoute } from './components/shared/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function App() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }>
              <Route index element={<AnalyticsAdminPage />} />
              <Route path="users" element={<UsersAdminPage />} />
              <Route path="users/new" element={<UserFormAdminPage />} />
              <Route path="users/bulk-import" element={<BulkImportUsersAdminPage />} />
              <Route path="users/:id" element={<UserDetailAdminPage />} />
              <Route path="users/:id/edit" element={<UserFormAdminPage />} />
              <Route path="sessions" element={<SessionsAdminPage />} />
              <Route path="sessions/:id" element={<SessionDetailAdminPage />} />
              <Route path="locations" element={<LocationsAdminPage />} />
              <Route path="organizations" element={<OrganizationsAdminPage />} />
            </Route>

          </Routes>
        </Router>
      </QueryClientProvider>
    </TooltipProvider>
  )
}

export default App