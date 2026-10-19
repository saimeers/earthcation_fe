import { defineConfig, devices } from '@playwright/test'

// Humo de los 3 paneles sobre el build de producción (vite preview) con la API simulada (e2e/api.js)
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: { VITE_API_URL: 'http://api.test', VITE_PLAY_URL: 'https://play.test' },
  },
})
