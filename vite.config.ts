import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

// Las cabeceras de seguridad viven en vercel.json (la única fuente). `vite preview` las sirve igual para que las pruebas
// de Playwright corran con la misma política de contenido que producción; solo se agrega el origen de la API de la prueba
// (VITE_API_URL), que en producción ya está en vercel.json.
interface VercelHeaders { headers: { source: string, headers: { key: string, value: string }[] }[] }

const securityHeaders = (apiUrl: string | undefined): Record<string, string> => {
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as VercelHeaders
  const all = Object.fromEntries((config.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value]))
  const origin = apiUrl ? new URL(apiUrl).origin : ''
  return { ...all, 'Content-Security-Policy': (all['Content-Security-Policy'] ?? '').replace('connect-src', `connect-src ${origin}`) }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  preview: { headers: securityHeaders(loadEnv(mode, process.cwd(), '').VITE_API_URL ?? process.env.VITE_API_URL) },
}))
