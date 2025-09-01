# Arquitectura de Word Cloud App

## Resumen del Proyecto

Aplicación web tipo Word Cloud en tiempo real similar a Mentimeter, con funcionalidad de salas colaborativas para votaciones y encuestas.

## Stack Tecnológico

### Frontend
- **Framework**: React 18
- **Hosting**: Netlify (gratuito)
- **Bundler**: Vite
- **CSS Framework**: Tailwind CSS
- **Librerías adicionales**:
  - React Router DOM (navegación)
  - React Query/TanStack Query (manejo de estado servidor)
  - D3.js o WordCloud2.js (visualización de word cloud)
  - React Hot Toast (notificaciones)

### Backend
- **BaaS**: Firebase
- **Hosting de funciones**: Firebase Functions
- **Runtime**: Node.js 18

### Base de Datos
- **Principal**: Cloud Firestore (NoSQL)
- **Ventajas**:
  - Listeners en tiempo real nativos
  - Escalabilidad automática
  - Tier gratuito generoso (1GB, 50K lecturas/día)

### Autenticación
- **Sistema**: Firebase Authentication
- **Métodos**: Email/Password para administradores
- **Gestión de sesiones**: Automática con Firebase

### Tiempo Real
- **Sistema**: Firestore Real-time Listeners
- **Ventajas**: Sincronización automática sin WebSockets

## Arquitectura de la Aplicación

### Estructura de Componentes Frontend

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── admin/
│   │   ├── RoomList.jsx
│   │   ├── CreateRoom.jsx
│   │   └── RoomManagement.jsx
│   ├── wordcloud/
│   │   ├── WordCloudDisplay.jsx
│   │   ├── WordInput.jsx
│   │   └── ParticipantList.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Room.jsx
│   └── Join.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useFirestore.js
│   └── useRealtime.js
├── services/
│   ├── firebase.js
│   ├── auth.js
│   └── firestore.js
└── utils/
    ├── constants.js
    └── helpers.js
```

### Estructura de Base de Datos (Firestore)

#### Colección: `rooms`
```javascript
{
  roomId: "auto-generated-id",
  title: "Mi Word Cloud",
  code: "ABC123",
  createdBy: "admin-uid",
  createdAt: timestamp,
  expiresAt: timestamp, // +7 días
  isActive: true,
  isFinished: false,
  requiresConfirmation: true,
  timeLimit: 300, // segundos (opcional)
  startedAt: timestamp, // cuando se inicia la votación
  settings: {
    maxWords: 100,
    allowDuplicates: false,
    moderateWords: true
  }
}
```

#### Colección: `words`
```javascript
{
  wordId: "auto-generated-id",
  roomId: "room-reference",
  text: "palabra",
  count: 3,
  submittedBy: ["user1", "user2", "user3"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Colección: `participants`
```javascript
{
  participantId: "auto-generated-id",
  roomId: "room-reference",
  name: "Juan",
  originalName: "Juan", // antes del número auto-generado
  hasVoted: true,
  joinedAt: timestamp,
  lastSeen: timestamp,
  sessionId: "browser-generated-uuid" // prevenir votos múltiples
}
```

#### Colección: `users` (administradores)
```javascript
{
  uid: "firebase-auth-uid",
  email: "admin@example.com",
  createdAt: timestamp,
  lastLogin: timestamp,
  roomsCreated: 5
}
```

### Backend Functions (Firebase Functions)

#### Funciones Cloud Functions

1. **`onRoomCreate`** (Trigger: onCreate en rooms)
   - Genera código único de 6 caracteres
   - Establece fecha de expiración (+7 días)
   - Valida datos de entrada

2. **`onWordSubmit`** (HTTP Function)
   - Valida participante no haya votado
   - Procesa palabra (lowercase, trim)
   - Actualiza o crea entrada en words
   - Marca participante como votado

3. **`cleanupExpiredRooms`** (Scheduled Function - diaria)
   - Elimina salas expiradas
   - Limpia palabras y participantes asociados

4. **`generateRoomCode`** (HTTP Function)
   - Genera códigos únicos de sala
   - Verifica no exista duplicado

5. **`joinRoom`** (HTTP Function)
   - Valida sala existe y está activa
   - Genera nombre único si hay duplicados
   - Crea participante

## Flujo de Datos

### Flujo de Administrador

1. **Login** → Firebase Auth → Dashboard
2. **Crear Sala** → Cloud Function → Firestore → Código generado
3. **Gestionar Sala** → Real-time listeners → Estado actualizado
4. **Finalizar Sala** → Update Firestore → Notificación en tiempo real

### Flujo de Participante

1. **Acceso por código/URL** → Validación → Formulario nombre
2. **Unirse a sala** → Cloud Function → Firestore participant
3. **Enviar palabra** → Cloud Function → Update words collection
4. **Ver resultados** → Real-time listener → Word cloud actualizado

### Sincronización en Tiempo Real

```javascript
// Ejemplo de listener para word cloud
useEffect(() => {
  const unsubscribe = db
    .collection('words')
    .where('roomId', '==', roomId)
    .orderBy('count', 'desc')
    .onSnapshot((snapshot) => {
      const words = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWordsData(words);
      updateWordCloud(words);
    });

  return () => unsubscribe();
}, [roomId]);
```

## Seguridad

### Reglas de Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rooms - solo creador puede modificar
    match /rooms/{roomId} {
      allow read: if true; // lectura pública
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
    
    // Words - solo functions pueden escribir
    match /words/{wordId} {
      allow read: if true;
      allow write: if false; // solo Cloud Functions
    }
    
    // Participants - lectura pública, escritura por functions
    match /participants/{participantId} {
      allow read: if true;
      allow write: if false; // solo Cloud Functions
    }
    
    // Users - solo el propio usuario
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Deployment

### Frontend (Netlify)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`

### Backend (Firebase)
1. Deploy functions: `firebase deploy --only functions`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Environment config: Firebase Functions config

## Consideraciones de Performance

### Optimizaciones Frontend
- Lazy loading de componentes
- Debounce en word cloud updates
- Virtual scrolling para listas grandes
- Service Worker para cache

### Optimizaciones Backend
- Índices compuestos en Firestore
- Paginación en consultas grandes
- Cache en Cloud Functions
- Batch operations para cleanup

## Limitaciones del Tier Gratuito

### Firebase (Spark Plan)
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Functions**: 125K invocations/month
- **Hosting**: 1GB storage, 10GB transfer/month
- **Auth**: Sin límite de usuarios

### Netlify (Free Plan)
- **Bandwidth**: 100GB/month
- **Build minutes**: 300/month
- **Sites**: 500 deploys/month

## Escalabilidad

### Para crecimiento futuro
1. **Upgrade a Firebase Blaze** (pay-as-you-go)
2. **CDN** para assets estáticos
3. **Redis** para cache (Firebase Extensions)
4. **Analytics** con Google Analytics 4

## Estimación de Recursos

### Para 100 salas concurrentes:
- **Firestore reads**: ~50K/día
- **Functions invocations**: ~10K/día
- **Bandwidth**: ~5GB/mes

**Conclusión**: El tier gratuito es suficiente para un MVP y primeras fases de uso.
