import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Toaster } from '../ui/sonner'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}