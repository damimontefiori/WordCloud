# WordCloud App - Arquitectura Técnica

## 🏗️ Resumen del Proyecto

Aplicación web tipo Word Cloud en tiempo real similar a Mentimeter, con funcionalidad de salas colaborativas para votaciones y encuestas. Diseñada para funcionar completamente con planes gratuitos.

## 📋 Reglas Arquitectónicas Fundamentales

**IMPORTANTE**: Esta aplicación está diseñada para funcionar completamente con el **plan gratuito Firebase Spark + Netlify**.

### ❌ Restricciones Obligatorias

1. **NO USAR Firebase Functions**
   - El plan Spark (gratuito) no permite Functions
   - Toda la lógica debe implementarse del lado cliente o usando Firestore directamente
   - Si se sugiere usar Functions, rechazar y buscar alternativas con Firestore

2. **NO usar servicios de pago**
   - Mantener compatibilidad con tiers gratuitos
   - Implementar alternativas client-side para lógica compleja

### ✅ Stack Tecnológico Permitido

#### Frontend
- **Framework**: React 18
- **Bundler**: Vite
- **CSS Framework**: Tailwind CSS
- **Hosting**: Netlify (gratuito)
- **Librerías adicionales**:
  - React Router DOM (navegación)
  - D3.js o WordCloud2.js (visualización de word cloud)
  - React Hot Toast (notificaciones)

#### Backend
- **BaaS**: Firebase Firestore (plan Spark)
- **Autenticación**: Firebase Auth (plan Spark)
- **Tiempo Real**: Firestore Real-time Listeners
- **Build**: Vite + scripts personalizados

## 🛠️ Patrones de Implementación

### Para Operaciones CRUD
```javascript
// ✅ CORRECTO - Firestore directo
import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore'

// ❌ INCORRECTO - Firebase Functions
import { httpsCallable } from 'firebase/functions'
```

### Para Lógica Compleja
```javascript
// ✅ CORRECTO - Transacciones Firestore
import { runTransaction } from 'firebase/firestore'

await runTransaction(db, async (transaction) => {
  // Lógica de negocio aquí
})
```

### Para Validaciones
```javascript
// ✅ CORRECTO - Validaciones cliente + reglas Firestore
// Cliente: validación UX
if (!isValidInput(data)) throw new Error('Invalid input')

// Firestore Rules: validación seguridad
// rules_version = '2';
// service cloud.firestore {
//   match /collection/{doc} {
//     allow write: if isValidData(request.resource.data);
//   }
// }
```

## 📁 Estructura de Archivos

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
├── services/
│   ├── firebase.js        # Configuración Firebase
│   ├── api.js            # API usando solo Firestore
│   └── deleteRoom.js     # Operaciones específicas Firestore
├── contexts/              # Contexts React (Firebase, Auth)
│   ├── AuthContext.jsx
│   └── FirebaseContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useFirestore.js
│   └── useRealtime.js
└── utils/
    ├── validation.js     # Validaciones cliente
    ├── normalize.js      # Normalización de datos
    ├── buildInfo.js      # Info de versión
    ├── constants.js
    └── helpers.js
```

## 💾 Estructura de Base de Datos (Firestore)

### Colección: `rooms`
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

### Colección: `words`
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

### Colección: `participants`
```javascript
{
  participantId: "auto-generated-id",
  roomId: "room-reference",
  name: "Juan",
  originalName: "Juan", // antes del número auto-generado
  hasVoted: true,
  joinedAt: timestamp,
  lastSeen: timestamp,
  sessionId: "browser-generated-uuid", // prevenir votos múltiples
  isActive: true
}
```

### Colección: `users` (administradores)
```javascript
{
  uid: "firebase-auth-uid",
  email: "admin@example.com",
  createdAt: timestamp,
  lastLogin: timestamp,
  roomsCreated: 5
}
```

## 🔐 Seguridad

### Reglas de Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - solo el propio usuario puede leer/escribir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rooms - lectura pública, escritura solo por el creador
    match /rooms/{roomId} {
      allow read: if true; // Lectura pública para que cualquiera pueda unirse
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
    
    // Words - lectura pública, escritura permitida si la sala está activa
    match /words/{wordId} {
      allow read: if true; // Lectura pública para mostrar word cloud
      allow create: if true; // Permitir que invitados envíen palabras
      allow update: if true; // Permitir incrementar contador de palabras existentes
      allow delete: if request.auth != null && 
        request.auth.uid == get(/databases/$(database)/documents/rooms/$(resource.data.roomId)).data.createdBy;
    }
    
    // Participants - lectura pública, escritura permitida para unirse
    match /participants/{participantId} {
      allow read: if true; // Lectura pública para contar participantes
      allow create: if true; // Permitir que invitados se unan
      allow update: if false; // Solo lectura después de unirse
      allow delete: if request.auth != null && 
        request.auth.uid == get(/databases/$(database)/documents/rooms/$(resource.data.roomId)).data.createdBy;
    }
  }
}
```

## 🚀 Deployment Pipeline

### Frontend (Netlify)
1. **Código → GitHub**
2. **GitHub → Netlify** (auto-deploy)
3. **Build command**: `npm run build`
4. **Publish directory**: `dist`
5. **Environment variables**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Base de Datos (Firebase)
3. **Firestore Rules → Firebase Console** (manual cuando sea necesario)
4. **Deploy rules**: `firebase deploy --only firestore:rules`

## 📊 Flujo de Datos

### Flujo de Administrador
1. **Login** → Firebase Auth → Dashboard
2. **Crear Sala** → Firestore directo → Código generado (cliente)
3. **Gestionar Sala** → Real-time listeners → Estado actualizado
4. **Eliminar Sala** → Transacción Firestore → Eliminación atómica
5. **Finalizar Sala** → Update Firestore → Notificación en tiempo real

### Flujo de Participante
1. **Acceso por código/URL** → Validación cliente → Formulario nombre
2. **Unirse a sala** → Firestore directo → Participant creado
3. **Enviar palabra** → Transacción Firestore → Update words collection
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

## 📝 Ejemplos de Implementación Sin Functions

### ✅ Envío de Palabras (sin Functions)
```javascript
// Normalización cliente
const normalizedWord = normalizeWord(word)

// Transacción Firestore
await runTransaction(db, async (transaction) => {
  const existingWord = await transaction.get(wordQuery)
  if (existingWord.exists()) {
    transaction.update(existingWord.ref, { count: increment(1) })
  } else {
    transaction.set(newWordRef, { text: normalizedWord, count: 1 })
  }
})
```

### ✅ Eliminación de Salas (sin Functions)
```javascript
// Eliminación atómica usando transacciones
await runTransaction(db, async (transaction) => {
  // Verificar ownership
  const roomDoc = await transaction.get(roomRef);
  if (roomDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('No tienes permisos');
  }
  
  // Eliminar participantes, palabras y sala
  participantsSnapshot.docs.forEach(doc => transaction.delete(doc.ref));
  wordsSnapshot.docs.forEach(doc => transaction.delete(doc.ref));
  transaction.delete(roomRef);
});
```

## 💡 Filosofía de Desarrollo

### Cuando el Usuario Pida Features

**SIEMPRE pregunta**: "¿Cómo implemento esto sin Firebase Functions?"

**Alternativas comunes**:
- Functions → Transacciones Firestore + validaciones cliente
- Scheduled Functions → Cleanup manual o por TTL en Firestore  
- HTTP Functions → Lógica client-side + Firestore Rules
- Server logic → Cliente + Firestore Rules

## ⚡ Consideraciones de Performance

### Optimizaciones Frontend
- Lazy loading de componentes
- Debounce en word cloud updates
- Virtual scrolling para listas grandes
- Service Worker para cache

### Optimizaciones Backend
- Índices compuestos en Firestore
- Paginación en consultas grandes
- Batch operations para operaciones masivas
- Real-time listeners optimizados

## 📊 Limitaciones del Tier Gratuito

### Firebase (Spark Plan)
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Auth**: Sin límite de usuarios
- **Hosting**: 1GB storage, 10GB transfer/month

### Netlify (Free Plan)
- **Bandwidth**: 100GB/month
- **Build minutes**: 300/month
- **Sites**: 500 deploys/month

### Estimación de Recursos
Para 100 salas concurrentes:
- **Firestore reads**: ~50K/día
- **Firestore writes**: ~10K/día
- **Bandwidth**: ~5GB/mes

**Conclusión**: El tier gratuito es suficiente para un MVP y primeras fases de uso.

## 🎯 Objetivo Arquitectónico

Mantener una aplicación **100% funcional** usando solo herramientas **gratuitas** sin comprometer la experiencia del usuario ni la seguridad.

---

**💡 Recordatorio**: Si alguien sugiere usar Firebase Functions o cualquier servicio de pago, responder con: "Esta app usa Firebase Spark (gratuito), busquemos una alternativa sin Functions."
