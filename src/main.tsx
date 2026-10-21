import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/index.css'
import { Toaster } from '@/shared/ui/sonner'
import { AppProviders } from './app/providers'
import { AppRouter } from './app/router'

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el elemento #root')

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
    <Toaster richColors position="top-right" theme="system" />
  </StrictMode>,
)
