import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `.claude/worktrees` puede traer una copia completa del repo (worktrees de agentes de IA);
  // `dist` es el build. Ninguno de los dos debe analizarse.
  globalIgnores(['dist', '.claude']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Repetitivo con noUnusedLocals/noUnusedParameters de tsc (que sí ve los tipos); evita el doble aviso.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Límite de imports entre features: cada feature en src/features/<nombre> solo puede ser
    // consumido desde fuera (otro feature, src/app, código viejo) a través de su `index.ts`
    // (la "API pública" del feature) — nunca importando domain/application/infrastructure/ui
    // directamente. Dentro del propio feature (mismo <nombre>) sí se puede importar libremente.
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
      ],
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'boundaries/entry-point': ['error', {
        default: 'disallow',
        policies: [
          { target: { element: { type: 'feature' } }, allow: ['index.ts'] },
        ],
      }],
    },
  },
  {
    // Kit de UI generado por shadcn y utilidades que a propósito exportan un componente junto con
    // constantes/variantes/helpers del mismo archivo (patrón de shadcn, no un error): Fast Refresh
    // pierde el estado local al editar estos archivos, pero no vale la pena partirlos por eso.
    files: ['src/shared/ui/**/*.tsx', 'src/shared/lib/ports.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Configs y pruebas de humo corren en Node, no en el navegador
    files: ['*.config.{js,ts}', 'e2e/**/*.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
])
