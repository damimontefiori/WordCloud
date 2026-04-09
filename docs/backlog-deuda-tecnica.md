# Backlog de Deuda Técnica — WordCloud App

> **Creado**: Abril 2026  
> **Basado en**: Análisis exhaustivo del código fuente  
> **Prioridad**: 🔴 Alta | 🟡 Media | 🔵 Baja

---

## Resumen

| # | Tarea | Prioridad | Estimación | Estado |
|---|-------|-----------|------------|--------|
| DT-01 | Fix bug import en roomActivation.js | 🔴 Alta | 5 min | ⬜ Pendiente |
| DT-02 | Implementar tests E2E con Playwright | 🔴 Alta | 2-3 hrs | ⬜ Pendiente |
| DT-03 | Activar orderBy en queries Firestore | 🟡 Media | 15 min | ⬜ Pendiente |
| DT-04 | Implementar scripts de versionado | 🟡 Media | 30 min | ⬜ Pendiente |
| DT-05 | Limpiar console.log de producción | 🟡 Media | 30 min | ⬜ Pendiente |
| DT-06 | Eliminar archivos vestigio | 🔵 Baja | 5 min | ⬜ Pendiente |
| DT-07 | Clarificar rol de Cloud Functions | 🟡 Media | 15 min | ⬜ Pendiente |
| DT-08 | Agregar scripts npm de versión a package.json | 🟡 Media | 15 min | ⬜ Pendiente |

---

## DT-01 — Fix bug: import incorrecto en roomActivation.js

**Prioridad**: 🔴 Alta  
**Archivo**: `src/services/roomActivation.js` (línea 3)

### Problema
```js
// ❌ ACTUAL — named import que no existe
import { app } from './firebase';
```
`firebase.js` exporta `app` como **default export** (`export default app`), no como named export. Este import causa un error en runtime cuando se carga el módulo.

### Solución
```js
// ✅ CORRECTO
import app from './firebase';
```

### Notas adicionales
- Este servicio además inicializa emuladores de forma independiente (duplicando lógica de `firebase.js`).
- Evaluar si `roomActivation.js` sigue siendo necesario dado que la activación de salas se hace directamente en `Room.jsx` vía `updateDoc`.

---

## DT-02 — Implementar tests E2E con Playwright

**Prioridad**: 🔴 Alta  
**Archivos afectados**: `tests/main-scenarios.spec.js` (vacío), `playwright.config.js` (no existe)

### Problema
- No existe configuración de Playwright.
- El archivo de tests está vacío.
- Las instrucciones del proyecto (`copilot-instructions.md`) exigen pruebas E2E antes de cada despliegue.

### Tareas
1. Instalar Playwright: `npm init playwright@latest`
2. Crear `playwright.config.js` con configuración base
3. Implementar tests para los flujos críticos:
   - [ ] Carga de landing page (Home)
   - [ ] Registro e inicio de sesión (Login)
   - [ ] Creación de sala desde Dashboard
   - [ ] Flujo de unirse a sala (Join)
   - [ ] Envío de palabra y visualización en word cloud
   - [ ] Activación y finalización de sala
   - [ ] Eliminación de sala
   - [ ] Modo presentación

---

## DT-03 — Activar orderBy en queries Firestore

**Prioridad**: 🟡 Media  
**Archivos afectados**:
- `src/contexts/FirebaseContext.jsx` (líneas 111, 128)
- `src/pages/Dashboard.jsx` (línea 74)

### Problema
Hay 3 queries con `orderBy` comentado como TODO. Los índices compuestos **ya existen** en `firestore.indexes.json`:

| Colección | Campos | Estado del índice |
|---|---|---|
| `rooms` | `createdBy` ASC + `createdAt` DESC | ✅ Definido |
| `words` | `roomId` ASC + `count` DESC | ✅ Definido |
| `participants` | `roomId` ASC + `joinedAt` ASC | ✅ Definido |

### Tareas
1. **Dashboard.jsx** — Descomentar `orderBy('createdAt', 'desc')` en la query de salas del usuario y eliminar el sort en memoria:
   ```js
   // Eliminar: userRooms = userRooms.sort(...)
   ```
2. **FirebaseContext.jsx (participantes)** — Descomentar `orderBy('joinedAt', 'asc')`
3. **FirebaseContext.jsx (palabras)** — Descomentar `orderBy('count', 'desc')` (o `createdAt`)
4. Verificar que los índices estén desplegados en Firebase Console

---

## DT-04 — Implementar script de versionado (bump-version.mjs)

**Prioridad**: 🟡 Media  
**Archivo**: `scripts/bump-version.mjs` (vacío)

### Problema
El script está vacío. La versión se define manualmente (hardcoded `"v2.1.0"`) en `scripts/generate-build-info.mjs`. Las instrucciones del proyecto requieren comandos de versionado semántico.

### Tareas
1. Implementar `bump-version.mjs` que:
   - Lea la versión actual de `package.json`
   - Acepte argumento `patch`, `minor` o `major`
   - Actualice `package.json` (campo `version`)
   - Actualice `generate-build-info.mjs` (campo `version`)
   - Opcionalmente cree un git tag

2. Agregar scripts a `package.json` (ver DT-08)

---

## DT-05 — Limpiar console.log de producción

**Prioridad**: 🟡 Media  
**~43 llamadas a console.log/warn/error distribuidas en:**

| Archivo | Cantidad | Tipo |
|---|---|---|
| `src/pages/Room.jsx` | 10 | log(9), error(1) |
| `src/contexts/FirebaseContext.jsx` | 8 | log(7), error(1) |
| `src/pages/Join.jsx` | 4 | log(3), error(1) |
| `src/pages/Login.jsx` | 4 | error(4) |
| `src/pages/MobileJoin.jsx` | 4 | log(4) |
| `src/services/firebase.js` | 3 | log(3) |
| `src/services/api.js` | 3 | warn(2), log(1) |
| `src/pages/Dashboard.jsx` | 2 | log(1), error(1) |
| `src/services/deleteRoom.js` | 3 | log(2), error(1) |
| Otros (auth, modals) | 2 | error(2) |

### Tareas
1. Eliminar `console.log` de debugging (los que inician con emojis como 🔧, 📱, 🔍, 📝, etc.)
2. Conservar `console.error` en catches reales pero envolver en un logger condicional
3. **Opcional**: Crear un utility `logger.js` que solo imprima en desarrollo:
   ```js
   const isDev = import.meta.env.DEV
   export const logger = {
     log: (...args) => isDev && console.log(...args),
     warn: (...args) => isDev && console.warn(...args),
     error: (...args) => console.error(...args) // siempre
   }
   ```

---

## DT-06 — Eliminar archivos vestigio

**Prioridad**: 🔵 Baja  
**Archivos a eliminar:**

| Archivo | Razón |
|---|---|
| `src/pages/Room_old.jsx` | Versión anterior de Room.jsx, duplicado de Room_new.jsx |
| `src/pages/Room_new.jsx` | Versión anterior de Room.jsx, duplicado de Room_old.jsx |
| `src/contexts/FirebaseContextNew.jsx` | Archivo vacío, implementación abandonada |
| `src/AppSimple.jsx` | App de prueba/fallback sin Firebase, posiblemente obsoleta |

### Verificación previa
- Buscar imports de estos archivos en todo el proyecto para confirmar que no se usen.
- `Room_old.jsx` y `Room_new.jsx`: verificar que `Room.jsx` es la versión activa (confirmado en `App.jsx`).
- `FirebaseContextNew.jsx`: vacío, no importado en ningún lado.
- `AppSimple.jsx`: no importado en `main.jsx` ni en ningún otro archivo.

---

## DT-07 — Clarificar rol de Cloud Functions vs Firestore directo

**Prioridad**: 🟡 Media  
**Archivos**: `functions/`, `src/services/api.js`, `src/services/roomActivation.js`

### Situación actual
- Las Cloud Functions existen en `functions/src/` (TypeScript) con código compilado en `functions/lib/`.
- El proyecto está en **Firebase Spark plan** (gratuito), que **no permite** desplegar Cloud Functions.
- `copilot-instructions.md` dice explícitamente: *"NO Firebase Functions"*.
- `api.js` intenta Functions y hace fallback a Firestore directo.
- `submitWord` ya no intenta Functions (usa Firestore directo siempre).

### Tareas
**Opción A**: Eliminar toda la carpeta `functions/` y las referencias a `httpsCallable` en `api.js`. Aceptar que la app es 100% client-side.

**Opción B**: Mantener `functions/` como código de referencia para un futuro upgrade a plan Blaze, pero limpiar los imports y hacer que `api.js` use Firestore directo sin intentar Functions primero (eliminar el try/catch de fallback).

### Recomendación
**Opción B** — Mantener el código pero simplificar `api.js` para que vaya directo a Firestore sin intentar llamar funciones que no están desplegadas (evita errores en consola y latencia innecesaria).

---

## DT-08 — Agregar scripts de npm para versionado

**Prioridad**: 🟡 Media  
**Archivo**: `package.json`

### Problema
`copilot-instructions.md` documenta estos comandos, pero no existen en `package.json`:

```
npm run version:patch   # 2.1.0 → 2.1.1
npm run version:minor   # 2.1.0 → 2.2.0
npm run version:major   # 2.1.0 → 3.0.0
npm run release:patch   # versión + commit + tag
npm run release:minor
npm run release:major
```

### Tareas
1. Implementar `bump-version.mjs` (DT-04)
2. Agregar a `package.json`:
   ```json
   {
     "scripts": {
       "version:patch": "node scripts/bump-version.mjs patch",
       "version:minor": "node scripts/bump-version.mjs minor",
       "version:major": "node scripts/bump-version.mjs major",
       "release:patch": "npm run version:patch && git add -A && git commit -m \"release: patch\" && git tag v$(node -p \"require('./package.json').version\")",
       "release:minor": "npm run version:minor && git add -A && git commit -m \"release: minor\" && git tag v$(node -p \"require('./package.json').version\")",
       "release:major": "npm run version:major && git add -A && git commit -m \"release: major\" && git tag v$(node -p \"require('./package.json').version\")"
     }
   }
   ```

---

## Orden de ejecución sugerido

```
1. DT-01  Fix bug roomActivation.js        (5 min)   — Bug activo en producción
2. DT-06  Eliminar archivos vestigio        (5 min)   — Limpieza rápida
3. DT-03  Activar orderBy en Firestore      (15 min)  — Mejora de rendimiento
4. DT-05  Limpiar console.log               (30 min)  — Higiene de código
5. DT-07  Clarificar Cloud Functions         (15 min)  — Simplificar arquitectura
6. DT-04  Implementar bump-version.mjs      (30 min)  — Infraestructura
7. DT-08  Agregar scripts npm de versión    (15 min)  — Complemento de DT-04
8. DT-02  Implementar tests E2E Playwright  (2-3 hrs) — El más largo, al final
```

**Tiempo total estimado**: ~4-5 horas
