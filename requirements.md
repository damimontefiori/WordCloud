# Requerimientos - Word Cloud App

## Visión General

Aplicación web interactiva tipo Word Cloud similar a Mentimeter, diseñada para sesiones educativas y presentaciones donde un administrador (docente/presentador) puede crear salas de votación en tiempo real y los participantes (alumnos) pueden enviar palabras que se visualizan proporcionalmente según su frecuencia.

## Roles del Sistema

### 1. Administrador (Presentador/Docente)
**Descripción**: Usuario autenticado que gestiona las salas de Word Cloud.

### 2. Invitado (Alumno/Participante)
**Descripción**: Usuario sin autenticación que participa enviando palabras.

---

## Funcionalidades por Rol

### 👨‍🏫 Administrador

#### Autenticación
- **REQ-ADM-001**: Debe autenticarse mediante email/contraseña
- **REQ-ADM-002**: Acceso a dashboard principal post-autenticación
- **REQ-ADM-003**: Sesión persistente hasta logout manual

#### Gestión de Salas
- **REQ-ADM-004**: Crear nuevas salas de Word Cloud
- **REQ-ADM-005**: Asignar título descriptivo a cada sala
- **REQ-ADM-006**: Generar código único de 6 caracteres para compartir
- **REQ-ADM-007**: Generar URL única de acceso directo
- **REQ-ADM-008**: Crear ilimitadas salas por administrador

#### Configuración de Sala
- **REQ-ADM-009**: Configurar tiempo límite para la votación (opcional)
- **REQ-ADM-010**: Activar/desactivar confirmación manual para iniciar votación
- **REQ-ADM-011**: Establecer fecha de expiración automática (7 días)

#### Control de Sesión
- **REQ-ADM-012**: Acceder a salas desde dashboard o URL directa
- **REQ-ADM-013**: Iniciar votación manualmente (si requiere confirmación)
- **REQ-ADM-014**: Finalizar votación manualmente en cualquier momento
- **REQ-ADM-015**: Eliminar salas antes de su expiración

#### Dashboard de Administración
- **REQ-ADM-016**: Listar todas las salas creadas
- **REQ-ADM-017**: Ver estado de cada sala (activa, finalizada, pendiente)
- **REQ-ADM-018**: Acciones rápidas: eliminar, finalizar, acceder
- **REQ-ADM-019**: Mostrar código y URL de cada sala
- **REQ-ADM-020**: Indicador de participantes conectados

### 👥 Invitado (Participante)

#### Acceso
- **REQ-INV-001**: Acceder sin autenticación mediante código o URL
- **REQ-INV-002**: Validar existencia y estado activo de la sala
- **REQ-INV-003**: Solicitar nombre al ingresar
- **REQ-INV-004**: Generar nombre predeterminado si no ingresa uno
- **REQ-INV-005**: Auto-generar sufijo numérico para nombres duplicados

#### Participación
- **REQ-INV-006**: Enviar exactamente una palabra por sesión
- **REQ-INV-007**: Deshabilitar envío después de participar
- **REQ-INV-008**: Mantener restricción tras refresco de página
- **REQ-INV-009**: Validar palabra no vacía y formato válido
- **REQ-INV-010**: Mostrar confirmación de envío exitoso

#### Estado de Espera
- **REQ-INV-011**: Esperar confirmación del admin (si está configurado)
- **REQ-INV-012**: Ver mensaje de "Esperando inicio" cuando corresponda
- **REQ-INV-013**: Recibir notificación automática cuando inicie la votación

---

## Pantallas y Componentes

### 🏠 Pantalla Principal de Word Cloud

#### Visualización
- **REQ-VIS-001**: Mostrar palabras en tiempo real conforme se envían
- **REQ-VIS-002**: Tamaño proporcional según frecuencia de la palabra
- **REQ-VIS-003**: Posicionamiento: palabras más frecuentes al centro
- **REQ-VIS-004**: Reorganización automática cuando se agregan palabras
- **REQ-VIS-005**: Colores variados para mejor visualización
- **REQ-VIS-006**: Animación suave en cambios de posición y tamaño

#### Información de Sesión
- **REQ-VIS-007**: Mostrar título de la sala
- **REQ-VIS-008**: Contador de participantes conectados
- **REQ-VIS-009**: Contador de palabras enviadas
- **REQ-VIS-010**: Indicador de tiempo restante (si aplica)

#### Estados de Finalización
- **REQ-VIS-011**: Mensaje de finalización cuando todos hayan votado
- **REQ-VIS-012**: Mensaje cuando admin finaliza manualmente
- **REQ-VIS-013**: Mensaje cuando expira el tiempo límite
- **REQ-VIS-014**: Mostrar resultados finales al terminar
- **REQ-VIS-015**: Botones de descarga (PNG, CSV) en vista final

#### Modo Presentación
- **REQ-VIS-016**: Botón para activar modo pantalla completa
- **REQ-VIS-017**: Ocultación de controles de navegador
- **REQ-VIS-018**: Optimización de colores para proyección
- **REQ-VIS-019**: Auto-refresh cada 2 segundos sin parpadeo

### 📊 Dashboard de Administración

#### Lista de Salas
- **REQ-DASH-001**: Tabla con todas las salas del administrador
- **REQ-DASH-002**: Columnas: Título, Código, Estado, Participantes, Fecha
- **REQ-DASH-003**: Filtros por estado: Todas, Activas, Finalizadas
- **REQ-DASH-004**: Ordenamiento por fecha de creación (más recientes primero)

#### Acciones por Sala
- **REQ-DASH-005**: Botón "Ver" - Acceder a la sala
- **REQ-DASH-006**: Botón "Compartir" - Copiar código/URL
- **REQ-DASH-007**: Botón "Finalizar" - Terminar votación
- **REQ-DASH-008**: Botón "Eliminar" - Confirmar y eliminar
- **REQ-DASH-009**: Indicadores visuales de estado
- **REQ-DASH-010**: Botón "Presentar" - Modo pantalla completa
- **REQ-DASH-011**: Opciones de descarga (PNG, CSV) para salas finalizadas

---

## Reglas de Negocio

### Gestión de Salas
- **RN-001**: Códigos de sala únicos de 6 caracteres alfanuméricos
- **RN-002**: Auto-eliminación de salas después de 7 días
- **RN-003**: Máximo 100 participantes por sala (límite técnico)
- **RN-004**: Tiempo límite máximo de 60 minutos por sesión

### Participación
- **RN-005**: Una sola palabra por participante por sala
- **RN-006**: Palabras de 1-30 caracteres, solo letras y números
- **RN-007**: Conversión automática a minúsculas para comparación
- **RN-008**: Filtro automático de palabras ofensivas con lista configurable

### Exportación y Descarga
- **RN-009**: Descarga de word cloud en formato PNG (1920x1080)
- **RN-010**: Exportación CSV con columnas: palabra, frecuencia, timestamp
- **RN-011**: Nombres de archivo con formato: sala-titulo-fecha-tipo.ext

### Finalización Automática
- **RN-012**: Finalizar cuando 100% de participantes hayan votado
- **RN-013**: Finalizar cuando expire el tiempo límite (si está configurado)
- **RN-014**: Finalizar cuando admin presione "Finalizar"
- **RN-015**: No permitir nuevos participantes en salas finalizadas

---

## Funcionalidades Incluidas en Primera Versión

### 📥 Exportación de Resultados
- **REQ-EXP-001**: Exportar word cloud como imagen PNG
- **REQ-EXP-002**: Exportar datos en CSV (palabra, frecuencia)
- **REQ-EXP-003**: Botón de descarga en vista de administrador
- **REQ-EXP-004**: Incluir metadatos: título de sala, fecha, participantes

### 🛡️ Moderación de Contenido
- **REQ-MOD-001**: Lista básica de palabras prohibidas (configurable)
- **REQ-MOD-002**: Filtro automático de palabras ofensivas
- **REQ-MOD-003**: Reemplazo de palabras prohibidas con asteriscos
- **REQ-MOD-004**: Log de palabras filtradas para revisión

### 📱 Optimización Móvil
- **REQ-MOB-001**: Diseño responsive para smartphones y tablets
- **REQ-MOB-002**: Interfaz táctil optimizada para participantes
- **REQ-MOB-003**: Teclado virtual compatible
- **REQ-MOB-004**: Gestos touch para navegación

### 🎭 Modo Presentación
- **REQ-PRES-001**: Vista de pantalla completa para administrador
- **REQ-PRES-002**: Ocultación de controles de navegador
- **REQ-PRES-003**: Optimización para proyección (colores, contraste)
- **REQ-PRES-004**: Tecla ESC para salir del modo presentación
- **REQ-PRES-005**: Auto-refresh sin intervención manual

## Mejoras para Futuras Versiones

### ♿ Accesibilidad (Fase Final)
- Soporte para lectores de pantalla
- Navegación por teclado
- Alto contraste para mejor visibilidad
- Cumplimiento WCAG 2.1

### 🔧 Configuraciones Avanzadas (Fase Final)
- Límite de caracteres personalizable por sala
- Permitir frases cortas (2-3 palabras)
- Temas de colores personalizables
- Notificaciones push y email

---

## 🛣️ Roadmap de Desarrollo

### Fase 1: MVP (Minimum Viable Product)
**Objetivo**: Funcionalidad básica operativa

#### Core Features MVP
- **Autenticación**: Login/logout de administradores
- **Gestión básica de salas**: Crear, listar, eliminar salas
- **Códigos de acceso**: Generación y validación de códigos únicos
- **Participación básica**: Unirse sin registro, enviar una palabra
- **Word Cloud básico**: Visualización simple en tiempo real
- **Estados básicos**: Activa, finalizada, expirada

#### Tecnología MVP
- Frontend: React básico con CSS simple
- Backend: Firebase Functions esenciales
- Base de datos: Firestore con estructura mínima
- Deploy: Netlify + Firebase

#### Criterios de Aceptación MVP
- ✅ Admin puede crear sala y obtener código
- ✅ Participantes pueden unirse y enviar palabra
- ✅ Word cloud se actualiza en tiempo real
- ✅ Salas se finalizan manualmente

---

### Fase 2: Funcionalidades Avanzadas
**Objetivo**: Mejoras operativas y UX

#### Nuevas Funcionalidades
- **Exportación**: Descarga PNG y CSV
- **Moderación**: Filtro de palabras ofensivas
- **Configuración de sala**: Tiempo límite, confirmación manual
- **Optimización móvil**: Responsive design completo
- **Modo presentación**: Vista pantalla completa
- **Gestión avanzada**: Dashboard mejorado con más acciones

#### Mejoras Técnicas
- Optimización de performance
- Mejor manejo de errores
- Validaciones robustas
- Animaciones suaves en word cloud

#### Criterios de Aceptación Fase 2
- ✅ Descarga de resultados funcional
- ✅ Filtro de contenido operativo
- ✅ Experiencia móvil óptima
- ✅ Modo presentación sin fallos

---

### Fase 3: Pulimiento y Optimización
**Objetivo**: Refinamiento y estabilidad

#### Mejoras de Performance
- **Caching**: Implementar cache de word clouds
- **Optimización**: Reducir llamadas a Firebase
- **Compresión**: Imágenes y assets optimizados
- **SEO**: Meta tags y structured data

#### Mejoras de UX
- **Feedback visual**: Loaders, transitions, micro-interactions
- **Manejo de errores**: Mensajes informativos y recovery
- **Onboarding**: Tutorial básico para nuevos usuarios
- **Estabilidad**: Testing exhaustivo de edge cases

#### Criterios de Aceptación Fase 3
- ✅ Carga rápida (<3 segundos)
- ✅ Sin errores en flujos principales
- ✅ Experiencia fluida en todos los dispositivos

---

### Fase 4 (Futuro): Accesibilidad y Configuraciones
**Objetivo**: Inclusión y personalización avanzada

#### Accesibilidad Completa
- **WCAG 2.1**: Cumplimiento nivel AA
- **Screen readers**: Soporte completo
- **Navegación por teclado**: Todos los flujos accesibles
- **Alto contraste**: Modo alternativo
- **Texto alternativo**: Descripciones completas

#### Configuraciones Avanzadas
- **Personalización de salas**: Límites custom, temas de color
- **Tipos de contenido**: Permitir frases, emojis
- **Notificaciones**: Email y push notifications
- **Integraciones**: APIs para LMS (Moodle, Canvas)

#### Criterios de Aceptación Fase 4
- ✅ Audit de accesibilidad aprobado
- ✅ Configuraciones flexibles operativas
- ✅ Documentación completa para usuarios

---

## 📈 Estrategia de Iteración

### Metodología
- **Testing continuo** al final de cada sprint
- **Deploy incremental** para validación temprana

### Métricas de Éxito por Fase
**MVP**: Funcionalidad básica sin errores críticos
**Fase 2**: 90% de casos de uso cubiertos exitosamente
**Fase 3**: Performance <3s carga, 0 bugs críticos
**Fase 4**: 100% accesibilidad, configuraciones flexibles

### Plan de Rollback
- **Branches protegidas** para cada fase
- **Backup de datos** antes de deploys
- **Rollback automático** si se detectan errores críticos
- **Comunicación clara** a usuarios sobre cambios

---

## Criterios de Aceptación

### Performance
- **PERF-001**: Carga inicial < 3 segundos
- **PERF-002**: Actualización en tiempo real < 500ms
- **PERF-003**: Soporte para 50 participantes concurrentes sin degradación

### Compatibilidad
- **COMP-001**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **COMP-002**: Responsive design para tablets y móviles (iOS/Android)
- **COMP-003**: Touch gestures para navegación móvil
- **COMP-004**: Funcionalidad básica sin JavaScript (graceful degradation)

### Seguridad
- **SEC-001**: Validación de entrada en cliente y servidor
- **SEC-002**: Rate limiting para prevenir spam
- **SEC-003**: Sanitización de palabras ingresadas
- **SEC-004**: Filtro de contenido ofensivo con lista actualizable

---

## Notas Técnicas

### Limitaciones Conocidas
- Tier gratuito de Firebase: 50K lecturas/día
- Netlify: 100GB transferencia/mes
- Tiempo real limitado por conexiones concurrentes de Firestore

### Consideraciones de Escalabilidad
- Implementar paginación en dashboard con +100 salas
- Cache de word clouds para mejor performance
- Monitoreo de uso para upgrades futuros

### Backup y Recuperación
- Backup automático diario de Firestore
- Logs de actividad para debugging
- Procedimiento de recuperación documentado
