import { setupServer } from 'msw/node'

// Cada prueba agrega sus handlers con server.use(...); API = VITE_API_URL de vitest.config.js
export const server = setupServer()
export const API = 'http://api.test/api'
