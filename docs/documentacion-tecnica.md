# WordCloud App — Documentación Técnica Completa

> **Versión actual**: v2.1.0  
> **Última actualización del documento**: Abril 2026  
> **URL de producción**: https://wordcloud.com.ar  
> **Repositorio**: GitHub → desplegado automáticamente en Netlify

---

## 1. Descripción General

**WordCloud App** es una aplicación web interactiva que permite generar nubes de palabras (word clouds) colaborativas en tiempo real. Un presentador (docente, facilitador, conferencista) crea una "sala" virtual con un código único de 6 caracteres. Los participantes ingresan ese código desde cualquier dispositivo y envían palabras. Estas se visualizan instantáneamente en una nube donde los términos más repetidos aparecen con mayor tamaño.

### Casos de uso principales
- **Educación**: Evaluación de conocimientos previos, feedback instantáneo de alumnos.
- **Presentaciones corporativas**: Romper el hielo, recopilar opiniones de audiencia.
- **Reuniones de equipo**: Retrospectivas ágiles, definición de valores, brainstorming.
- **Eventos y dinámicas grupales**: Juegos participativos interactivos.

### Democratización frente a Mentimeter
Herramientas como Mentimeter, Slido o Kahoot operan bajo modelos Freemium altamente restrictivos (límite de 2 preguntas, máximo de participantes, planes de pago elevados). WordCloud App democratiza esta tecnología:

1. **100% gratuito**: Sin planes premium, sin límites artificiales. Todas las funcionalidades disponibles para todos.
2. **Sin registro para participantes**: Solo necesitan el código de 6 caracteres. No se recolectan datos personales innecesarios.
3. **Infraestructura de bajo costo**: Arquitectura serverless sobre Firebase Spark (plan gratuito) + Netlify (free tier), lo que permite mantener la herramienta gratuita indefinidamente.
4. **Código abierto**: Cualquiera puede inspeccionar, contribuir o desplegar su propia instancia.

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 18.2 | Biblioteca de UI, componentes funcionales con Hooks |
| **Vite** | 4.4 | Bundler y dev server ultrarrápido |
| **Tailwind CSS** | 3.3 | Framework CSS utility-first, diseño mobile-first |
| **React Router DOM** | 6.15 | Navegación SPA (Single Page Application) |
| **React Query** | 3.39 | Caché y gestión de estado asíncrono |
| **React Hot Toast** | 2.4 | Sistema de notificaciones toast |

### Backend-as-a-Service (BaaS)
| Servicio | Plan | Propósito |
|---|---|---|
| **Firebase Auth** | Spark (gratis) | Autenticación de presentadores (Email/Password + Google) |
| **Firebase Firestore** | Spark (gratis) | Base de datos NoSQL en tiempo real |
| **Firebase Functions** | Spark (gratis) | Funciones serverless (con fallback a Firestore directo) |

### Infraestructura & DevOps
| Herramienta | Propósito |
|---|---|
| **Netlify** | Hosting estático, CDN global, despliegue continuo |
| **GitHub** | Control de versiones, trigger de despliegue |
| **ESLint** | Linting de código JavaScript/JSX |
| **PostCSS + Autoprefixer** | Procesamiento de CSS para compatibilidad cross-browser |

### Lenguaje
- **JavaScript** (no TypeScript) — decisión deliberada para mantener simplicidad.

---

## 3. Arquitectura

### 3.1 Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │  React   │  │ React    │  │ Tailwind  │  │  React Query     ││
│  │  Router  │  │ Context  │  │ CSS       │  │  (Cache)         ││
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────────────┘│
│       │              │                                           │
│  ┌────▼──────────────▼──────────────────────────────────────┐   │
│  │              Capa de Servicios (api.js)                    │   │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │   │
│  │  │ Cloud Functions  │  │  Firestore Direct (fallback) │   │   │
│  │  │ (httpsCallable)  │  │  (addDoc, updateDoc, etc.)   │   │   │
│  │  └────────┬─────────┘  └──────────────┬───────────────┘   │   │
│  └───────────┼───────────────────────────┼───────────────────┘   │
└──────────────┼───────────────────────────┼───────────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FIREBASE (Google Cloud)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │  Firebase     │  │  Firestore   │  │  Cloud Functions    │    │
│  │  Auth         │  │  (NoSQL DB)  │  │  (Node.js 18)      │    │
│  │              │  │              │  │  (Spark: limitado)  │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      NETLIFY (Hosting)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │  CDN Global   │  │  SPA Redirect│  │  Auto-deploy from   │    │
│  │  (dist/)      │  │  (/* → /)    │  │  GitHub main branch │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Principio arquitectónico: Client-Side Only

La decisión más importante de la arquitectura es operar **sin backend propio**. Toda la lógica de negocio reside en el cliente (browser). Esto es consecuencia directa del uso del **plan Spark (gratuito) de Firebase**, que limita severamente el uso de Cloud Functions.

**Patrón de fallback**: La capa de servicios (`api.js`) intenta primero ejecutar Cloud Functions. Si fallan (porque no están desplegadas o el plan no las soporta), hace fallback automático a operaciones directas contra Firestore desde el cliente:

```
api.createRoom(data)
  → Intenta: createRoomFunction(data)       // Cloud Function
  → Fallback: this.createRoomDirect(data)   // Firestore directo
```

### 3.3 Modelo de datos (Firestore)

```
Firestore Database
├── rooms/
│   └── {roomId}
│       ├── title: string
│       ├── description: string
│       ├── code: string (6 chars, ej: "ABC123")
│       ├── state: "waiting" | "active" | "ended"
│       ├── isActive: boolean
│       ├── maxParticipants: number (default: 50)
│       ├── timeLimit: number (minutos)
│       ├── adminEmail: string
│       ├── createdBy: string (UID del creador)
│       ├── createdAt: Timestamp
│       ├── activatedAt: Timestamp?
│       ├── endedAt: Timestamp?
│       └── participantCount: number
│
├── participants/
│   └── {participantId}
│       ├── name: string
│       ├── roomId: string (referencia a rooms)
│       ├── roomCode: string
│       ├── joinedAt: Timestamp
│       └── isActive: boolean
│
├── words/
│   └── {wordId}
│       ├── text: string (normalizado)
│       ├── originalText: string
│       ├── participantId: string
│       ├── roomId: string (referencia a rooms)
│       ├── roomCode: string
│       ├── count: number (votos/repeticiones)
│       ├── createdAt: Timestamp
│       └── lastUpdated: Timestamp?
│
└── users/
    └── {userId}
        └── (datos de usuario registrado)
```

### 3.4 Reglas de seguridad (Firestore Security Rules)

| Colección | Lectura | Escritura | Borrado |
|---|---|---|---|
| `rooms` | Pública (cualquiera puede unirse) | Solo usuarios autenticados crean | Solo el creador (createdBy == UID) |
| `words` | Pública (para mostrar word cloud) | Pública (invitados envían palabras) | Solo el creador de la sala |
| `participants` | Pública (para contar participantes) | Pública (invitados se unen) | Solo el creador de la sala |
| `users` | Solo el propio usuario | Solo el propio usuario | Solo el propio usuario |

---

## 4. Estructura del Proyecto

```
WordCloud/
├── index.html                  # Entry point HTML (SPA)
├── package.json                # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind CSS
├── postcss.config.js           # Procesamiento de CSS
├── firebase.json               # Config Firebase (hosting, emulators)
├── firestore.rules             # Reglas de seguridad Firestore
├── firestore.indexes.json      # Índices compuestos Firestore
├── netlify.toml                # Configuración de Netlify (build + redirects)
├── .env                        # Variables de entorno (Firebase keys)
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── _redirects              # Redirects de Netlify (SPA fallback)
│
├── scripts/
│   ├── generate-build-info.mjs # Genera buildInfo.js en cada build
│   └── bump-version.mjs        # Script de versionado (vacío/pendiente)
│
├── src/
│   ├── main.jsx                # Punto de entrada React
│   ├── App.jsx                 # Router principal + Providers
│   ├── AppSimple.jsx           # App simplificada (testing/debug)
│   ├── index.css               # Estilos globales + Tailwind layers
│   │
│   ├── pages/                  # Páginas/vistas principales
│   │   ├── Home.jsx            # Landing page pública
│   │   ├── Login.jsx           # Registro / Inicio de sesión
│   │   ├── Dashboard.jsx       # Panel del presentador (CRUD de salas)
│   │   ├── Room.jsx            # Sala activa (word cloud + modo presentación)
│   │   ├── Join.jsx            # Unirse a sala (desktop)
│   │   ├── MobileJoin.jsx      # Unirse a sala (experiencia móvil)
│   │   └── EmailVerification.jsx # Verificación de email
│   │
│   ├── components/
│   │   ├── WordCloudVisualization.jsx  # Visualización de la nube de palabras
│   │   ├── MobileRedirect.jsx          # Redirect automático móvil → MobileJoin
│   │   ├── PersonalBadge.jsx           # Badge del desarrollador en header
│   │   ├── AboutModal.jsx              # Modal "Acerca de"
│   │   ├── GuideModal.jsx              # Modal de guía de uso
│   │   ├── ShareModal.jsx              # Modal para compartir app
│   │   ├── VersionModal.jsx            # Modal de información de versión
│   │   ├── TestPage.jsx                # Página de testing
│   │   │
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.jsx      # HOC: rutas que requieren login
│   │   │   └── EmailVerificationBanner.jsx # Banner de verificación de email
│   │   │
│   │   ├── layout/
│   │   │   ├── Layout.jsx              # Layout wrapper (Header + Footer)
│   │   │   ├── Header.jsx              # Navegación principal (desktop + mobile)
│   │   │   ├── Footer.jsx              # Pie de página
│   │   │   ├── HamburgerMenu.jsx       # Menú hamburguesa (mobile)
│   │   │   └── VersionInfo.jsx         # Badge de versión fijo (esquina superior)
│   │   │
│   │   └── common/
│   │       └── LoadingSpinner.jsx      # Spinner de carga reutilizable
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx             # Estado global de autenticación
│   │   ├── FirebaseContext.jsx         # Conexión Firebase + listeners real-time
│   │   └── FirebaseContextNew.jsx      # (versión alternativa/experimental)
│   │
│   ├── hooks/
│   │   └── useDeviceDetection.js       # Hook para detectar móvil/tablet/desktop
│   │
│   ├── services/
│   │   ├── firebase.js                 # Inicialización Firebase (app, auth, db, functions)
│   │   ├── api.js                      # Capa de servicios (Functions + fallback Firestore)
│   │   ├── deleteRoom.js               # Eliminación de sala con transacción
│   │   └── roomActivation.js           # Activación de sala via Cloud Function
│   │
│   └── utils/
│       ├── constants.js                # Constantes de la app
│       ├── helpers.js                  # Funciones auxiliares (generateRoomCode, etc.)
│       ├── wordNormalizer.js           # Normalización de palabras (acentos, case, etc.)
│       ├── geekNames.js               # Lista de nombres aleatorios (superhéroes, anime, etc.)
│       └── buildInfo.js               # Info del build (auto-generado en cada build)
│
├── functions/                  # Firebase Cloud Functions (Node.js 18)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/                    # TypeScript source
│   │   ├── index.ts
│   │   ├── rooms/
│   │   │   ├── createRoom.ts
│   │   │   ├── activateRoom.ts
│   │   │   └── joinRoom.ts
│   │   ├── words/
│   │   │   └── submitWord.ts
│   │   ├── cleanup/
│   │   │   └── cleanupExpiredRooms.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       ├── helpers.ts
│   │       └── wordNormalizer.ts
│   └── lib/                    # JavaScript compilado
│
├── tests/
│   └── main-scenarios.spec.js  # Tests E2E con Playwright (pendiente)
│
└── docs/
    ├── estado-proyecto.md      # Estado histórico del proyecto
    └── documentacion-tecnica.md # Este documento
```

---

## 5. Flujos Funcionales

### 5.1 Flujo del Presentador (Admin)

```
1. Registro/Login
   ├── Email + Password → Firebase Auth (createUserWithEmailAndPassword)
   ├── Google OAuth → Firebase Auth (signInWithPopup + GoogleAuthProvider)
   └── Verificación de email → sendEmailVerification()

2. Dashboard (/dashboard) — Ruta protegida por ProtectedRoute
   ├── Ver lista de salas creadas (query Firestore: rooms WHERE createdBy == UID)
   ├── Crear nueva sala → modal con título, descripción, opción "iniciar al crear"
   │   └── api.createRoom() → genera código 6 chars → guarda en Firestore
   ├── Iniciar sala (waiting → active) → api.startRoom() → updateDoc state='active'
   ├── Finalizar sala (active → ended) → api.endRoom() → updateDoc state='ended'
   ├── Eliminar sala → deleteRoom() → transacción que borra sala + participantes + palabras
   └── Copiar link de invitación → clipboard: {origin}/join?code={CODE}

3. Sala en vivo (/room/:roomCode)
   ├── Suscripción real-time a la sala (onSnapshot)
   ├── Suscripción real-time a participantes (onSnapshot)
   ├── Suscripción real-time a palabras (onSnapshot)
   ├── Visualización del word cloud (WordCloudVisualization)
   ├── Modo presentación (fullscreen, fondo oscuro, palabras grandes)
   └── Activar/desactivar sala
```

### 5.2 Flujo del Participante (Invitado)

```
1. Unirse a sala
   ├── Accede a /join (desktop) o /mobile-join (móvil, redirect automático)
   ├── Ingresa código de 6 caracteres (o lo recibe via URL: /join?code=ABC123)
   ├── Ingresa nombre (opcional: si vacío, se asigna nombre geek aleatorio)
   └── api.joinRoom() → crea documento en participants/ → guarda info en localStorage

2. Participar en sala (/room/:roomCode)
   ├── Ve el word cloud en tiempo real
   ├── Envía una palabra → api.submitWord()
   │   ├── Normalización: trim + lowercase + removeAccents
   │   ├── Si la palabra ya existe: incrementa count
   │   └── Si es nueva: crea documento en words/
   └── Marca como "votado" en localStorage (1 voto por participante por sala)
```

### 5.3 Flujo del Word Cloud (Visualización)

```
Firestore (words collection)
  │ onSnapshot listener
  ▼
words[] → map to { text, count, size }
  │ size = min(12 + count*3, 36) para vista normal
  ▼
WordCloudVisualization component
  ├── Color: hash del texto → paleta de 15 colores vibrantes
  ├── Tamaño: proporcional al count (16px-64px normal, 24px-120px presentación)
  ├── Animación: word-appear (scale + rotate), word-bounce, stagger delay
  └── Modo presentación: fondo oscuro, text-shadow con glow, tamaños amplificados
```

### 5.4 Normalización de Palabras

El sistema de normalización (`wordNormalizer.js`) garantiza que palabras equivalentes se cuenten como una sola:

1. **Trim** de espacios al inicio y final
2. **Reducción** de espacios múltiples a uno
3. **Lowercase** (minúsculas)
4. **Remoción de acentos** (á→a, é→e, etc.) excepto la ñ que se preserva
5. **Remoción de caracteres especiales** no permitidos
6. **Eliminación de caracteres invisibles** (zero-width spaces, etc.)

Ejemplo: `"  Tecnología  "` → `"tecnologia"`, `"  INNOVACIÓN "` → `"innovacion"`

### 5.5 Nombres Aleatorios (geekNames)

Cuando un participante no ingresa nombre, se le asigna automáticamente un nombre geek aleatorio de una lista de ~200 nombres que incluye:
- Superhéroes Marvel y DC
- Personajes de anime/manga
- Personajes de videojuegos
- Personajes de Star Wars, Harry Potter, LOTR
- Personajes de ciencia ficción clásica

---

## 6. Gestión de Estado

### 6.1 Context API (React Context)

La app utiliza dos contextos principales, envueltos como Providers en `App.jsx`:

#### AuthContext (`contexts/AuthContext.jsx`)
Provee el estado de autenticación a toda la app:
- `currentUser`: Objeto del usuario autenticado (o null)
- `loading`: Estado de carga inicial de la sesión
- `signup(email, password)`: Registro + envío de verificación de email
- `login(email, password)`: Login con email/password
- `loginWithGoogle()`: Login con Google popup
- `sendVerificationEmail()`: Reenviar email de verificación
- `logout()`: Cerrar sesión

#### FirebaseContext (`contexts/FirebaseContext.jsx`)
Provee acceso a Firebase y funciones de suscripción real-time:
- `auth`, `db`, `functions`: Instancias de Firebase
- `api`: Objeto `apiService` con todos los métodos CRUD
- `subscribeToRoom(roomCode, callback)`: Listener real-time de la sala
- `subscribeToParticipants(roomId, callback)`: Listener real-time de participantes
- `subscribeToWords(roomId, callback)`: Listener real-time de palabras

### 6.2 Estado Local

- **localStorage**: Almacena datos del participante (`participant`) y estado de voto (`voted_{roomCode}`).
- **useState en componentes**: Estado local de cada página (loading, error, form data).

### 6.3 React Query
Configurado con retry=3 y staleTime=5min. Se usa como wrapper general pero la mayoría de las queries son real-time vía Firestore `onSnapshot`.

---

## 7. Sistema de Rutas

### Definidas en `App.jsx`:

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/` | `Home` | Público | Landing page |
| `/login` | `Login` | Público | Registro e inicio de sesión |
| `/join` | `Join` | Público | Unirse a sala (desktop) |
| `/mobile-join` | `MobileJoin` | Público | Unirse a sala (móvil) |
| `/mobile-join/:roomCode` | `MobileJoin` | Público | Unirse directo con código |
| `/room/:roomCode` | `Room` | Público | Vista de la sala/word cloud |
| `/dashboard` | `Dashboard` | Protegido | Panel del presentador |
| `*` | Redirect a `/` | — | Catch-all |

### MobileRedirect
El componente `MobileRedirect` envuelve todas las rutas. Si detecta un dispositivo móvil accediendo a `/join`, redirige automáticamente a `/mobile-join` preservando query params.

### ProtectedRoute
Componente HOC que verifica `currentUser` del AuthContext. Si no hay usuario autenticado, redirige a `/login`.

---

## 8. Jerarquía de Providers

```jsx
<ErrorBoundary>                    // Captura errores de React
  <QueryClientProvider>            // React Query cache
    <FirebaseProvider>             // Firebase instances + API + subscriptions
      <AuthProvider>               // Autenticación + currentUser
        <Router>                   // React Router
          <MobileRedirect>         // Redirect automático móvil
            <Layout>               // Header + Footer wrapper
              <Routes>...</Routes>
            </Layout>
          </MobileRedirect>
          <VersionInfo />          // Badge de versión (fixed position)
          <Toaster />              // Notificaciones toast
        </Router>
      </AuthProvider>
    </FirebaseProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

---

## 9. Capa de Servicios (api.js)

### Patrón de Fallback (Functions → Firestore directo)

Cada operación tiene dos implementaciones:

| Método | Cloud Function | Fallback Firestore directo |
|---|---|---|
| `createRoom(data)` | `createRoomFunction` | `createRoomDirect` — genera código, valida unicidad, crea doc |
| `joinRoom(data)` | `joinRoomFunction` | `joinRoomDirect` — busca sala por código, crea participante |
| `submitWord(data)` | *(no usa Functions)* | `submitWordDirect` — normaliza, busca duplicados, crea/incrementa |
| `startRoom(roomId)` | — | `updateDoc(state: 'active')` |
| `endRoom(roomId)` | — | `updateDoc(state: 'ended')` |

### deleteRoom (servicio independiente)
Usa `runTransaction` para eliminar atómicamente:
1. Verifica ownership (createdBy == currentUser.uid)
2. Elimina todos los participantes de la sala
3. Elimina todas las palabras de la sala
4. Elimina el documento de la sala

### Generación de código de sala
Genera un código alfanumérico de 6 caracteres (A-Z0-9). Intenta hasta 10 veces verificar unicidad contra Firestore antes de asignarlo.

---

## 10. Conexión a Firebase

### Inicialización (`services/firebase.js`)
- Lee configuración desde variables de entorno `VITE_FIREBASE_*`
- Valida que todas las claves requeridas estén presentes
- Inicializa `app`, `auth`, `db`, `functions`
- Configura `GoogleAuthProvider` con `prompt: 'select_account'`
- **Emuladores**: Se conecta a emuladores locales solo si `VITE_USE_EMULATORS=true` y está en modo DEV

### Variables de entorno (.env)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=wordcloudlive.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wordcloudlive
VITE_FIREBASE_STORAGE_BUCKET=wordcloudlive.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_USE_EMULATORS=false
```

---

## 11. Despligue Continuo (CI/CD)

### Pipeline: GitHub → Netlify

```
Developer push to main
        │
        ▼
GitHub repo detecta cambio
        │
        ▼
Netlify webhook se activa automáticamente
        │
        ▼
Netlify ejecuta:
  1. npm install
  2. npm run build
     ├── prebuild: node scripts/generate-build-info.mjs
     │   └── Genera src/utils/buildInfo.js con: version, git commit, timestamp
     └── vite build → produce dist/
        │
        ▼
Netlify deploys dist/ a CDN global
        │
        ▼
Aplicación en producción actualizada
  URL: https://wordcloud.com.ar
```

### Configuración de Netlify (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200       # SPA: todas las rutas van a index.html
```

### Configuración de Vite (`vite.config.js`)
```js
export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  build: { outDir: 'dist', sourcemap: true },
  server: { port: 3000, open: true }
})
```

### Información de Build
El script `scripts/generate-build-info.mjs` se ejecuta como prebuild y genera `src/utils/buildInfo.js` con:
- Versión de la app (hardcoded: `v2.1.0`)
- Fecha y hora del build
- Commit hash de Git
- Branch de Git
- Entorno (production/development)

Esta información se muestra en el componente `VersionInfo` (esquina superior izquierda en desktop) y en el `VersionModal` (accesible desde el menú hamburguesa en móvil).

### Versionado
El proyecto usa versionado semántico. La versión actual se define en `generate-build-info.mjs` y en `package.json`. Scripts de npm definidos para versionado:
- `npm run version:patch` / `npm run version:minor` / `npm run version:major`
- `npm run release:patch` / `npm run release:minor` / `npm run release:major`

> **Nota**: El script `bump-version.mjs` actualmente está vacío. El versionado se realiza manualmente editando la versión en el script de build.

---

## 12. Componentes Clave

### WordCloudVisualization
Componente principal de visualización. Recibe un array de `{ text, count }` y renderiza las palabras con:
- **Tamaño dinámico**: Proporcional al `count` relativo al máximo.
- **Colores**: Asignados por hash del texto sobre una paleta de 15 colores vibrantes.
- **Animaciones**: Entrada con scale+rotate+blur, bounce para palabras nuevas, stagger delay.
- **Modo presentación**: Fondo transparente (sobre gradient oscuro), text-shadow con glow, tamaños amplificados (24px-120px).

### Room.jsx
La página más compleja. Incluye:
- Suscripciones real-time a sala, participantes y palabras.
- Vista dual: Admin (gestión de sala) vs Participante (envío de palabras).
- **Modo presentación**: Fullscreen inmersivo con gradient azul-púrpura, header minimalista, word cloud amplificado.
- Activación de sala (waiting → active).
- Botón de copiar link de invitación.

### Dashboard.jsx
Panel del presentador con:
- Lista de salas propias con conteo de participantes en tiempo real.
- Modal de creación de sala (título, descripción, auto-inicio).
- Acciones: iniciar, finalizar, eliminar sala con confirmación.
- Estadísticas: salas activas, total de participantes.
- Acceso a guía de uso y función de compartir.

---

## 13. Diseño Responsive y PWA

### Mobile-First con Tailwind
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
- Estilos base orientados a móvil, con override progresivo para pantallas más grandes.
- Inputs con `font-size: 16px` para evitar zoom en iOS.
- Touch targets mínimos de 44px.

### PWA (Progressive Web App)
Configuración en `public/manifest.json`:
- `display: standalone` (sin barra de navegador)
- `theme_color: #2563eb` (azul primario)
- Shortcuts para "Unirse a Sala" y "Dashboard"
- Categorías: education, productivity, utilities

### MobileRedirect
Detecta automáticamente dispositivos móviles usando `useDeviceDetection` (user-agent + viewport width) y redirige `/join` → `/mobile-join` para una experiencia optimizada con inputs más grandes y menos distracciones.

---

## 14. Autenticación

### Métodos soportados
1. **Email + Password**: Registro con verificación obligatoria de email.
2. **Google OAuth**: Login con popup, provider configurado con `select_account`.

### Flujo de verificación de email
1. Usuario se registra → `sendEmailVerification()` automático.
2. Si no verifica, ve `EmailVerificationBanner` persistente.
3. No puede crear salas hasta verificar email (validación en Dashboard).
4. Puede reenviar email de verificación desde el banner.

### Seguridad
- Tokens de Firebase Auth manejados automáticamente por el SDK.
- `ProtectedRoute` impide acceso a `/dashboard` sin autenticación.
- Las reglas de Firestore validan `request.auth.uid` para operaciones sensibles.

---

## 15. Emuladores Firebase (Desarrollo Local)

Configurados en `firebase.json`:
| Servicio | Puerto |
|---|---|
| Auth | 9099 |
| Functions | 5001 |
| Firestore | 8080 |
| Hosting | 5000 |
| Emulator UI | 4000 |

Se activan con `VITE_USE_EMULATORS=true` en `.env` y solo en modo desarrollo (`import.meta.env.DEV`).

---

## 16. Testing

### Estado actual
- Archivo `tests/main-scenarios.spec.js` existe pero está **vacío**.
- La infraestructura para Playwright está prevista según las instrucciones del proyecto.
- No hay tests unitarios ni de integración implementados actualmente.

### Plan de testing (según copilot-instructions)
- **Playwright** para pruebas end-to-end.
- Se deben ejecutar antes de cada despliegue.
- Flujos críticos a testear:
  1. Registro e inicio de sesión
  2. Creación de sala y obtención de código
  3. Unión de participante a sala
  4. Envío de palabra y visualización en word cloud
  5. Activación/finalización de sala
  6. Eliminación de sala

---

## 17. Dependencias Principales

### Producción
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.15.0",
  "firebase": "^10.3.1",
  "react-query": "^3.39.3",
  "react-hot-toast": "^2.4.1"
}
```

### Desarrollo
```json
{
  "@vitejs/plugin-react": "^4.0.3",
  "vite": "^4.4.5",
  "tailwindcss": "^3.3.3",
  "autoprefixer": "^10.4.15",
  "postcss": "^8.4.29",
  "eslint": "^8.45.0"
}
```

---

## 18. Aspectos Pendientes y Deuda Técnica

| Área | Estado | Detalle |
|---|---|---|
| Tests E2E | ❌ Vacío | `main-scenarios.spec.js` sin contenido |
| Bump version script | ❌ Vacío | `bump-version.mjs` sin implementar |
| Índices Firestore | ⚠️ TODO | `orderBy` comentado en queries por falta de índices compuestos |
| Firebase Functions | ⚠️ Parcial | Existen en `/functions/` pero la app hace fallback a Firestore directo |
| Console logs | ⚠️ Debug | Múltiples `console.log` con emojis para debugging que deberían limpiarse en producción |
| AppSimple.jsx | ℹ️ Vestigio | Versión simplificada sin Firebase, posiblemente obsoleta |
| Room_old.jsx / Room_new.jsx | ℹ️ Vestigio | Versiones anteriores de la página Room |
| FirebaseContextNew.jsx | ℹ️ Vestigio | Versión alternativa del contexto, sin usar |
| roomActivation.js | ⚠️ Bug | Importa `app` como named export de firebase.js, pero firebase.js lo exporta como default |

---

## 19. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm run dev

# Build de producción (genera dist/)
npm run build

# Preview del build local
npm run preview

# Lint
npm run lint
```

---

*Documento generado a partir del análisis exhaustivo del código fuente, configuraciones y estructura del proyecto WordCloud App.*
