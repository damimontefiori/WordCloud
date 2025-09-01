# 🚀 Guía de Deployment - WordCloud

## 📋 Información del Repositorio

- **Repositorio:** https://github.com/damimontefiori/WordCloud
- **Rama principal:** `main`
- **Estado:** MVP completamente funcional y validado

## 🔧 Configuración de Firebase para Producción

### 1. Crear Proyecto Firebase
```bash
# Si no tienes un proyecto, créalo en Firebase Console
# https://console.firebase.google.com
```

### 2. Configurar Firebase CLI
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Verificar proyectos disponibles
firebase projects:list
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` con las credenciales de tu proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key_real
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Configurar Firestore Database
En Firebase Console:
1. Ir a "Firestore Database"
2. Crear base de datos en modo "test" o "production"
3. Configurar reglas de seguridad (ya incluidas en `firestore.rules`)

### 5. Configurar Authentication
En Firebase Console:
1. Ir a "Authentication"
2. Habilitar "Email/Password"
3. Configurar dominio autorizado para tu aplicación

## 🏗️ Deploy de Firebase Functions

### 1. Compilar Functions
```bash
cd functions
npm install
npm run build
cd ..
```

### 2. Deploy Functions
```bash
# Deploy solo las functions
firebase deploy --only functions

# O deploy completo (functions + firestore rules)
firebase deploy
```

### 3. Verificar Functions Desplegadas
Las siguientes functions deben estar disponibles:
- `createRoom`
- `joinRoom` 
- `activateRoom`
- `submitWord`
- `cleanupExpiredRooms`
- `manualCleanup`

## 🌐 Deploy del Frontend

### Opción 1: Netlify (Recomendado)

1. **Conectar Repositorio:**
   - Ir a [Netlify](https://netlify.com)
   - "New site from Git"
   - Conectar con GitHub
   - Seleccionar repositorio `WordCloud`

2. **Configurar Build:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variables de Entorno:**
   En Netlify Dashboard > Site Settings > Environment Variables:
   ```
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Deploy:**
   - Netlify hará deploy automático al hacer push a `main`

### Opción 2: Firebase Hosting

1. **Configurar Hosting:**
   ```bash
   firebase init hosting
   ```

2. **Build y Deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Opción 3: Vercel

1. **Conectar Repositorio:**
   - Ir a [Vercel](https://vercel.com)
   - Import repository
   - Seleccionar `WordCloud`

2. **Configurar Variables de Entorno:**
   Las mismas variables que Netlify

## ✅ Checklist de Deployment

### Pre-deployment
- [ ] Variables de entorno configuradas
- [ ] Firebase project creado y configurado
- [ ] Firestore Database habilitado
- [ ] Authentication habilitado (Email/Password)
- [ ] Functions compiladas sin errores
- [ ] Frontend builds correctamente

### Post-deployment
- [ ] Functions desplegadas y funcionando
- [ ] Frontend accesible en la URL
- [ ] Conexión Firebase establecida
- [ ] Autenticación funcionando
- [ ] Creación de salas funcionando
- [ ] Unión de participantes funcionando
- [ ] Envío de palabras funcionando
- [ ] Word Cloud actualizándose en tiempo real

## 🔍 Verificación de Funcionalidad

### Test Completo Post-Deploy:

1. **Acceder a la aplicación**
2. **Registrarse/Iniciar sesión**
3. **Crear una nueva sala**
4. **Activar la sala**
5. **Unirse como participante** (en otra pestaña/dispositivo)
6. **Enviar palabras**
7. **Verificar word cloud en tiempo real**

## 🐛 Troubleshooting

### Error: Functions no disponibles
```bash
# Verificar que las functions estén desplegadas
firebase functions:list

# Re-deploy si es necesario
firebase deploy --only functions
```

### Error: CORS en producción
Verificar que el dominio esté autorizado en Firebase Console > Authentication > Settings > Authorized domains

### Error: Variables de entorno no cargadas
- Verificar que todas las variables `VITE_` estén configuradas
- Hacer rebuild después de configurar variables

## 📊 Monitoreo

### Firebase Console
- Monitorear uso de functions
- Revisar logs de errores
- Verificar métricas de Firestore

### Analytics (Opcional)
Habilitar Google Analytics en Firebase para métricas detalladas.

## 🚀 URL de Producción

Una vez desplegado, tu aplicación estará disponible en:
- **Netlify:** `https://tu-app-name.netlify.app`
- **Vercel:** `https://tu-app-name.vercel.app`
- **Firebase Hosting:** `https://tu-proyecto-id.web.app`

---

## 🎯 MVP Validado y Listo para Producción

El código subido al repositorio https://github.com/damimontefiori/WordCloud representa un **MVP completamente funcional** que ha sido validado con:

- ✅ **7 participantes simultáneos**
- ✅ **3 palabras enviadas exitosamente**
- ✅ **Sincronización en tiempo real confirmada**
- ✅ **Todas las funcionalidades core operativas**

**¡Tu aplicación WordCloud está lista para ser desplegada y usada en producción!** 🎉
