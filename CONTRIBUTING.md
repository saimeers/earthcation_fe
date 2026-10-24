# Cómo trabajar en Panel (earthcation_fe)

## Git flow

| Rama | Para qué | Sale de | Vuelve a |
|---|---|---|---|
| `main` | Producción. Solo recibe merges de `release/*` y `hotfix/*` | — | — |
| `develop` | Integración de lo que va en la próxima versión | `main` | — |
| `feature/<tema>` | Un cambio (funcionalidad, refactor, docs) | `develop` | `develop` por PR |
| `release/vX.Y.Z` | Estabilizar una versión (solo correcciones) | `develop` | `main`, con tag `vX.Y.Z` |
| `hotfix/<tema>` | Arreglo urgente en producción | `main` | `main` y `develop`, con tag de parche |

- Todo entra por **pull request** con el CI en verde; no se hace push directo a `main` ni a `develop`.
- Las versiones siguen **SemVer**: mayor = cambio incompatible de contrato, menor = funcionalidad, parche = corrección.

### Publicar una versión

La versión se sube **en `develop`**, antes de abrir la rama de release. Así `main` y `develop` nunca
se separan y no hace falta un pull request de vuelta después de publicar.

1. En una rama desde `develop`: subir la versión en `package.json`.
   Pull request a `develop`.
2. Crear `release/vX.Y.Z` desde `develop` ya con eso dentro, y abrir el pull request a `main`. No lleva commits propios.
3. Fusionar en `main`, poner el tag `vX.Y.Z` y desplegar.

Un `hotfix/*` sí nace en `main`, y entonces hay que llevarlo de vuelta a `develop` por pull request: si no, el
siguiente release lo pisaría y el error volvería.

## Commits

Conventional Commits en **una línea**, en español, sin coautoría:

```
feat: QR de la sala en el informe
fix: el jugador ya no puede cambiar su propio rol
refactor: casos de uso de sesiones como funciones puras
docs | test | chore | ci | perf: ...
```

## Estructura del código

El panel está organizado **por feature**, no por capa técnica: cada capacidad de negocio vive en
`src/features/<nombre>/` con las subcarpetas `domain/` (funciones puras, con pruebas),
`application/` (hooks de React Query + el puerto del feature), `infrastructure/` (la implementación
HTTP del puerto) y `ui/` (páginas y componentes), y expone todo lo que usa el resto de la app por un
único `index.ts`. La composición (router, providers, layout de sidebar) está en `src/app/`; lo
compartido entre features en `src/shared/`. Un feature **nunca** importa los internos de otro —
solo su `index.ts`; ESLint (`eslint-plugin-boundaries`) lo marca como error. Detalle completo en
[`CLAUDE.md`](./CLAUDE.md).

Al agregar un feature nuevo, sigue el mismo patrón que uno ya existente (p. ej. `features/health`
o `features/locations` para uno simple) en vez de inventar una estructura distinta.

## Antes de abrir el PR
- `npm ci` y que el CI local pase (lint, `tsc --noEmit`, pruebas, build, e2e).
- Describir qué cambia, cómo se probó y si toca el contrato de la API o los datos.
- Nada de secretos ni datos personales en el código, los commits o los PR (el CI corre gitleaks).
