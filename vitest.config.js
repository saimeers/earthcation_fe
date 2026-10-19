import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    env: { VITE_API_URL: 'http://api.test', VITE_PLAY_URL: 'https://play.test' },
  },
}))
