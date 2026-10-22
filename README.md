# Earthcation, panel web

Panel web de Earthcation, un Juego Serio para reforzar la identificación de riesgos en la labor minera subterránea de
carbón en Norte de Santander. Incluye la portada pública del proyecto y el panel de trabajo para tres roles:
instructores, administración y soporte técnico. El juego vive en `earthcation_sg` (Unity) y la API en `earthcation_be`,
que es la fuente de verdad de la plataforma.

Proyecto del Semillero VIRAL de la Universidad Francisco de Paula Santander (UFPS), desarrollado como trabajo de grado
de Ingeniería de Sistemas.

## Contenido

1. [Qué incluye](#qué-incluye)
2. [Arquitectura](#arquitectura)
3. [Requisitos y puesta en marcha](#requisitos-y-puesta-en-marcha)
4. [Configuración](#configuración)
5. [Pruebas y calidad](#pruebas-y-calidad)
6. [Despliegue](#despliegue)
7. [Decisiones de diseño](#decisiones-de-diseño)
8. [Cómo contribuir](#cómo-contribuir)

## Qué incluye

| Ruta | Para quién | Qué ofrece |
|---|---|---|
| `/` | Público | Portada del proyecto: qué es el juego, cómo funciona y acceso para instructores |
| `/login`, `/forgot-password`, `/reset-password` | Personal | Acceso con cédula y contraseña, y recuperación de la contraseña |
| `/instructor` | Instructor | Sus salas de capacitación: crear, iniciar y terminar, código y QR, seguimiento en vivo, análisis por participante e informe |
| `/admin` | Administración | Todo lo del instructor más usuarios, importación masiva desde la planilla de la ANM, organizaciones, localidades y analíticas con el mapa de minas |
| `/developer` | Soporte técnico | Despliegue de versiones del juego, salud del servicio y visitas, más la consulta en solo lectura de lo anterior |

Los jugadores no usan este panel: entran al juego con su cédula o con el código de una sala.

## Arquitectura

El código está organizado por funcionalidad, no por tipo de archivo. Cada funcionalidad es una capa autocontenida:

```
src/
  app/                       raíz de composición: rutas, proveedores, diseño del panel y control de acceso por rol
  features/<nombre>/
    domain/                  tipos y reglas puras (sin React ni HTTP); es lo que se prueba unitariamente
    application/             hooks de TanStack Query y el puerto de la funcionalidad
    infrastructure/          adaptador HTTP que implementa el puerto contra la API
    ui/                      páginas y componentes
    index.ts                 única API pública de la funcionalidad
  shared/
    api/                     cliente HTTP, errores y tipos de la API
    config/                  variables de entorno validadas (único acceso a import.meta.env)
    lib/                     utilidades sin negocio
    ui/                      kit de componentes (shadcn/ui) y piezas de datos reutilizables
```

Reglas que el linter hace cumplir: una funcionalidad solo importa a otra a través de su `index.ts`
(`eslint-plugin-boundaries`); `ui` depende de `application`, y `application` de `domain`. Los hooks nunca importan el
adaptador HTTP: piden un puerto y la raíz de composición lo conecta (`shared/lib/ports`), de modo que se pueden probar
con un doble y que cambiar de versión de la API toca solo los archivos `infrastructure/*Http.ts`.

Funcionalidades: `auth`, `sessions`, `users`, `bulk-import`, `organizations`, `locations`, `analytics`, `deploy`,
`visits`, `health` y `landing`.

La portada y el acceso comparten una identidad visual propia (tierra, carbón y ámbar de seguridad; tipografía Archivo
con eje de ancho y JetBrains Mono para datos) y el panel usa la misma paleta, en modo claro y oscuro. Los detalles
están en [`CLAUDE.md`](./CLAUDE.md).

## Requisitos y puesta en marcha

- Node 22 o superior
- Una instancia de la API (`earthcation_be`) accesible

```bash
npm ci
echo "VITE_API_URL=http://localhost:3000" > .env     # ver la tabla de variables
npm run dev              # http://localhost:5173
```

Para trabajar sin la API de producción, levanta `earthcation_be` en local (ver su README) y apunta `VITE_API_URL` a
`http://localhost:3000`.

## Configuración

Las variables se validan al arrancar en `src/shared/config/env.ts`, el único lugar que lee `import.meta.env`.

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `VITE_API_URL` | Sí | Origen de la API, sin `/api` ni barra final |
| `VITE_PLAY_URL` | No | Dominio del juego; el QR de una sala apunta a `<dominio>/?sala=<código>`. Por defecto el de producción |

## Pruebas y calidad

```bash
npm run lint         # ESLint con los límites entre funcionalidades
npx tsc --noEmit     # tipos (strict)
npm test             # Vitest, Testing Library y MSW
npm run e2e          # Playwright: humo de la portada y de los tres paneles sobre el build de producción
npm run build        # build de producción
```

- Las pruebas unitarias viven junto al código que prueban (`domain/*.test.ts`).
- Las pruebas de humo de Playwright usan respuestas **grabadas** de una API con datos de semilla (`e2e/fixtures`): una
  página que llame a un endpoint sin grabación falla la prueba.
- El CI (`.github/workflows/ci.yml`) corre en cada pull request: lint, pruebas, build, auditoría de dependencias de
  producción y Playwright.

## Despliegue

Vercel despliega el panel: cada pull request genera una vista previa y `main` pasa a producción con el CI en verde.
`vercel.json` reescribe todas las rutas a `index.html` porque el enrutado es del lado del cliente. La variable
`VITE_API_URL` se configura en el proyecto de Vercel.

Para publicar una versión: abrir `release/vX.Y.Z` desde `develop`, subir la versión en `package.json`, fusionar en
`main`, poner el tag `vX.Y.Z` y sincronizar `main` en `develop`.

## Decisiones de diseño

- **Funcionalidades en lugar de capas técnicas.** Cada pantalla grande es un contexto con sus tipos, hooks, adaptador
  y componentes, igual que en el backend. Es más fácil de leer y de cambiar sin efectos laterales.
- **Puertos para el acceso a datos.** El adaptador HTTP implementa una interfaz que define la funcionalidad. La API
  puede cambiar de versión sin tocar hooks ni componentes.
- **TypeScript estricto en todo el código.** No queda JSX sin tipar.
- **Estado del servidor en TanStack Query y estado de sesión en Zustand.** Los datos remotos no se copian a estados
  locales.
- **Accesibilidad como requisito.** Contraste AA en la paleta y en el medidor de la portada, foco visible, navegación
  por teclado y respeto de `prefers-reduced-motion` en las animaciones y en la transición hacia el acceso.
- **Las gráficas usan una paleta validada para daltonismo** con orden fijo, y los estados llevan siempre ícono y texto,
  no solo color.

## Cómo contribuir

El flujo de trabajo (git flow, convención de commits y lista de comprobación del pull request) está en
[`CONTRIBUTING.md`](./CONTRIBUTING.md). Las particularidades del código que importan al editarlo están en
[`CLAUDE.md`](./CLAUDE.md).
