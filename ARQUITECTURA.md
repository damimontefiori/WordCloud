# Instrucciones Arquitectónicas - WordCloud App

## 🏗️ Arquitectura Principal

**IMPORTANTE**: Esta aplicación está diseñada para funcionar completamente con el **plan gratuito Firebase Spark + Netlify**. 

### 📋 Reglas Arquitectónicas Obligatorias

1. **❌ NO USAR Firebase Functions**
   - El plan Spark (gratuito) no permite Functions
   - Toda la lógica debe implementarse del lado cliente o usando Firestore directamente
   - Si se sugiere usar Functions, rechazar y buscar alternativas con Firestore

2. **✅ Stack Tecnológico Permitido**
   - **Frontend**: React 18 + Vite + Tailwind CSS
   - **Base de Datos**: Firebase Firestore (plan Spark)
   - **Autenticación**: Firebase Auth (plan Spark)
   - **Hosting**: Netlify (gratuito)
   - **Build**: Vite + scripts personalizados

3. **🔄 Implementación de Lógica de Negocio**
   - Usar **transacciones Firestore** para operaciones complejas
   - Implementar validaciones del lado cliente
   - Usar **reglas de seguridad Firestore** para validaciones del servidor
   - Aprovechar **listeners en tiempo real** de Firestore

### 🛠️ Patrones de Implementación

#### Para Operaciones CRUD:
```javascript
// ✅ CORRECTO - Firestore directo
import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore'

// ❌ INCORRECTO - Firebase Functions
import { httpsCallable } from 'firebase/functions'
```

#### Para Lógica Compleja:
```javascript
// ✅ CORRECTO - Transacciones Firestore
import { runTransaction } from 'firebase/firestore'

await runTransaction(db, async (transaction) => {
  // Lógica de negocio aquí
})
```

#### Para Validaciones:
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

### 📁 Estructura de Archivos

```
src/
├── services/
│   ├── firebase.js        # Configuración Firebase
│   ├── api.js            # API usando solo Firestore
│   └── firestore/        # Operaciones específicas Firestore
├── utils/
│   ├── validation.js     # Validaciones cliente
│   ├── normalize.js      # Normalización de datos
│   └── buildInfo.js      # Info de versión
├── components/           # Componentes React
├── pages/               # Páginas de la app
└── contexts/            # Contexts React (Firebase, Auth)
```

### 🚀 Deployment Pipeline

1. **Código → GitHub**
2. **GitHub → Netlify** (auto-deploy)
3. **Firestore Rules → Firebase Console** (manual cuando sea necesario)

### 🔐 Seguridad

- **Autenticación**: Firebase Auth
- **Autorización**: Firestore Security Rules
- **Validación**: Cliente + Rules
- **CORS**: Configurado en Netlify

### 💡 Cuando el Usuario Pida Features

**SIEMPRE pregunta**: "¿Cómo implemento esto sin Firebase Functions?"

**Alternativas comunes**:
- Functions → Transacciones Firestore + validaciones cliente
- Scheduled Functions → Cleanup manual o por TTL en Firestore  
- HTTP Functions → API endpoints en Netlify Functions (si es absolutamente necesario)
- Server logic → Cliente + Firestore Rules

### 📝 Ejemplos de Implementación Correcta

#### ✅ Envío de Palabras (sin Functions):
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

#### ✅ Validación de Salas (sin Functions):
```javascript
// Firestore Rules
match /rooms/{roomId} {
  allow read: if true;
  allow create: if request.auth != null 
    && isValidRoomData(request.resource.data);
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.createdBy;
}
```

### 🎯 Objetivo

Mantener una aplicación **100% funcional** usando solo herramientas **gratuitas** sin comprometer la experiencia del usuario ni la seguridad.

---

**💡 Recordatorio**: Si alguien sugiere usar Firebase Functions o cualquier servicio de pago, responder con: "Esta app usa Firebase Spark (gratuito), busquemos una alternativa sin Functions."
