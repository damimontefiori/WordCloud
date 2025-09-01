# WordCloud Collaborative App

**Una aplicación web interactiva tipo Mentimeter para crear Word Clouds colaborativos en tiempo real durante presentaciones y sesiones educativas.**

## 📋 Descripción

WordCloud App permite a presentadores y docentes crear salas de votación interactivas donde los participantes pueden enviar palabras que se visualizan proporcionalmente según su frecuencia. Ideal para dinámicas educativas, lluvia de ideas, encuestas de opinión y feedback en tiempo real.

## ✨ Características Principales

- 🎯 **Salas colaborativas** con códigos únicos de acceso
- 👨‍🏫 **Administrador autenticado** para gestión completa
- 👥 **Participantes sin registro** para acceso inmediato
- ⚡ **Tiempo real** con sincronización automática
- 📱 **Responsive design** optimizado para móviles
- 🎭 **Modo presentación** en pantalla completa
- 📊 **Exportación** de resultados (PNG, CSV)
- 🛡️ **Filtro de contenido** con moderación automática

## 🏗️ Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Firebase Functions (Node.js)
- **Base de datos:** Cloud Firestore (tiempo real)
- **Autenticación:** Firebase Auth
- **Hosting:** Netlify + Firebase
- **Deployment:** 100% gratuito en tiers free

## 🚀 Funcionalidades

### Para Administradores
- ✅ Crear y gestionar salas ilimitadas
- ✅ Configurar tiempo límite y confirmaciones
- ✅ Compartir mediante código o URL directa
- ✅ Finalizar sesiones manualmente
- ✅ Descargar resultados en múltiples formatos
- ✅ Dashboard con control total de salas

### Para Participantes
- ✅ Acceso sin registro ni autenticación
- ✅ Unirse con código de 6 caracteres
- ✅ Envío de una palabra por sesión
- ✅ Visualización en tiempo real de resultados
- ✅ Nombres únicos con auto-numeración
- ✅ Interfaz optimizada para touch/móvil

### Características Técnicas
- ✅ Word Cloud con posicionamiento inteligente
- ✅ Tamaños proporcionales por frecuencia
- ✅ Animaciones suaves y reorganización automática
- ✅ Auto-eliminación de salas (7 días)
- ✅ Moderación de contenido automática
- ✅ Rate limiting y validaciones robustas

## 🛣️ Roadmap

### Fase 1: MVP ✅ (En desarrollo)
- Core functionality: salas, participación, word cloud básico
- Autenticación y gestión básica
- Deploy funcional

### Fase 2: Funcionalidades Avanzadas
- Exportación (PNG, CSV)
- Moderación de contenido
- Optimización móvil completa
- Modo presentación

### Fase 3: Pulimiento
- Performance optimization
- UX refinado
- Testing exhaustivo

### Fase 4: Futuro
- Accesibilidad WCAG 2.1
- Configuraciones avanzadas
- Integraciones LMS

## 🎯 Casos de Uso

- **Educación:** Lluvia de ideas en clase, feedback estudiantil
- **Corporativo:** Dinámicas de team building, encuestas rápidas
- **Eventos:** Interacción con audiencia, Q&A sessions
- **Talleres:** Recopilación de conceptos, evaluación de temas

## 🔧 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase (para backend)
- Git

### Configuración Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/[usuario]/wordcloud-app.git
cd wordcloud-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilita Authentication (Email/Password)
   - Crea una base de datos Firestore
   - Copia las credenciales de configuración

4. **Variables de entorno**
```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales de Firebase
```

5. **Iniciar desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción  
npm run preview      # Preview del build
npm run lint         # Verificar código con ESLint
```

### Estado Actual del Proyecto

🎉 **MVP COMPLETAMENTE FUNCIONAL** ✅

**Core Features Implementadas:**
- [x] Estructura completa React + Vite + Tailwind
- [x] Sistema de rutas y navegación completamente funcional
- [x] Páginas principales implementadas y operativas
- [x] Firebase Functions configuradas y desplegadas
- [x] Autenticación Firebase Auth funcionando
- [x] Base de datos Firestore en tiempo real
- [x] Sistema de salas colaborativas
- [x] Word Cloud dinámico en tiempo real
- [x] Sincronización múltiples usuarios
- [x] Estados de sala (Esperando/Activa/Finalizada)
- [x] Validaciones y manejo de errores
- [x] UI responsive y optimizada

**Funcionalidades Validadas en Producción:**
- ✅ Creación de salas con códigos únicos (Ej: L681MI)
- ✅ Unión de participantes sin registro
- ✅ Envío de palabras en tiempo real
- ✅ Visualización de Word Cloud actualizada instantáneamente
- ✅ Múltiples participantes simultáneos (7+ usuarios confirmados)
- ✅ Sincronización perfecta entre dispositivos
- ✅ Gestión de estados de participantes

**Firebase Functions Operativas:**
- ✅ `createRoom` - Creación de salas
- ✅ `joinRoom` - Unión de participantes
- ✅ `activateRoom` - Activación de salas
- ✅ `submitWord` - Envío de palabras
- ✅ `cleanupExpiredRooms` - Limpieza automática

**Demostración Exitosa:**
- 🎯 Sala L681MI con 7 participantes activos
- 📝 3 palabras enviadas: "innovación", "creatividad", "innovacion"
- ⚡ Sincronización en tiempo real validada
- 🖥️ Múltiples navegadores actualizándose instantáneamente

## 📖 Documentación

- [Requerimientos Detallados](./requirements.md)
- [Arquitectura Técnica](./architecture.md)
- [Guía de Instalación](./docs/installation.md) *(próximamente)*
- [API Documentation](./docs/api.md) *(próximamente)*

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🚀 Deploy

La aplicación se deploya automáticamente:
- **Frontend:** Netlify (desde main branch)
- **Backend:** Firebase Functions (automático)
- **Base de datos:** Firestore (configuración automática)

**Demo en vivo:** [Próximamente]

---

⭐ **Si te gusta este proyecto, no olvides darle una estrella en GitHub**
