# Backlog de Mejoras — WordCloud App

> **Creado**: Abril 2026  
> **Objetivo**: Llevar la app al siguiente nivel, diferenciándose de Mentimeter  
> **Niveles**: 🟢 Quick Win | 🟠 Feature de Valor | 🔵 Polish Profesional

---

## Resumen

| # | Mejora | Nivel | Esfuerzo | Impacto | Estado |
|---|--------|-------|----------|---------|--------|
| M-01 | Limpiar deuda técnica existente | 🟢 Quick Win | 1 hr | Alto | ⬜ Pendiente |
| M-02 | Exportar word cloud como imagen PNG | 🟢 Quick Win | 2 hrs | Alto | ⬜ Pendiente |
| M-03 | Múltiples rondas por sala | 🟢 Quick Win | 3 hrs | Medio | ⬜ Pendiente |
| M-04 | Contador de participantes visible para todos | 🟢 Quick Win | 30 min | Medio | ⬜ Pendiente |
| M-05 | Múltiples palabras por participante (configurable) | 🟠 Feature | 4 hrs | Muy Alto | ⬜ Pendiente |
| M-06 | Moderación de palabras | 🟠 Feature | 4 hrs | Muy Alto | ⬜ Pendiente |
| M-07 | Temporizador visible | 🟠 Feature | 3 hrs | Alto | ⬜ Pendiente |
| M-08 | Ranking / Top Words | 🟠 Feature | 3 hrs | Alto | ⬜ Pendiente |
| M-09 | Temas visuales para presentación | 🟠 Feature | 3 hrs | Medio | ⬜ Pendiente |
| M-10 | QR Code para unirse | 🟠 Feature | 2 hrs | Muy Alto | ⬜ Pendiente |
| M-11 | Tests E2E con Playwright | 🔵 Polish | 3 hrs | Alto | ⬜ Pendiente |
| M-12 | PWA (Progressive Web App) | 🔵 Polish | 2 hrs | Medio | ⬜ Pendiente |
| M-13 | Analytics básicos para admin | 🔵 Polish | 4 hrs | Medio | ⬜ Pendiente |
| M-14 | Sonidos y feedback háptico | 🔵 Polish | 2 hrs | Bajo | ⬜ Pendiente |
| M-15 | Internacionalización (i18n) | 🔵 Polish | 4 hrs | Medio | ⬜ Pendiente |

---

## 🟢 NIVEL 1 — Quick Wins

---

### M-01 — Limpiar deuda técnica existente

**Nivel**: 🟢 Quick Win  
**Esfuerzo**: 1 hora  
**Impacto**: Alto — código más limpio, menos errores en consola, mejor mantenibilidad

#### Tareas
1. **Fix/eliminar `roomActivation.js`** — import incorrecto y servicio no utilizado (ver DT-01)
2. **Limpiar ~43 `console.log`** — eliminar logs de debug con emojis, conservar `console.error` en catches (ver DT-05)
3. **Eliminar archivos vestigio** — `Room_old.jsx`, `Room_new.jsx`, `FirebaseContextNew.jsx`, `AppSimple.jsx` (ver DT-06)
4. **Activar `orderBy` en queries Firestore** — índices ya existen, solo descomentar (ver DT-03)
5. **Simplificar `api.js`** — ir directo a Firestore sin intentar Cloud Functions (ver DT-07)

#### Referencia
Detalle completo en [`docs/backlog-deuda-tecnica.md`](backlog-deuda-tecnica.md)

---

### M-02 — Exportar word cloud como imagen PNG

**Nivel**: 🟢 Quick Win  
**Esfuerzo**: 2 horas  
**Impacto**: Alto — los admins se llevan un entregable visual de cada sesión

#### Descripción
Agregar botón "Descargar PNG" visible para el admin en:
- Vista normal de la sala (junto a los botones de acción)
- Modo presentación (en el header)

#### Implementación
1. Instalar `html2canvas` o `dom-to-image`
2. Capturar el contenedor `word-cloud-container` como canvas
3. Convertir a PNG y disparar descarga con nombre `wordcloud-{codigo-sala}-{fecha}.png`
4. En modo presentación, capturar solo el área de palabras (sin header/footer)

#### Archivos afectados
- `src/pages/Room.jsx` — botones de descarga
- `src/components/WordCloudVisualization.jsx` — exponer ref del contenedor
- `package.json` — nueva dependencia

---

### M-03 — Múltiples rondas por sala

**Nivel**: 🟢 Quick Win  
**Esfuerzo**: 3 horas  
**Impacto**: Medio — permite reutilizar salas sin recrear, más dinámico en talleres

#### Descripción
Actualmente: 1 submit por participante por sala, y para repetir hay que crear sala nueva.  
Mejora: el admin puede "limpiar" palabras y abrir nueva ronda manteniendo la misma sala y participantes.

#### Implementación
1. Agregar campo `round` (número de ronda) al documento de la sala en Firestore
2. Botón "Nueva Ronda" para admin que:
   - Incrementa `round` en el documento de la sala
   - Resetea el flag `voted_{roomCode}` de los participantes (vía evento de sala)
   - Opcionalmente archiva las palabras de la ronda anterior en subcolección `rounds/{n}/words`
3. Limpiar `localStorage.voted_{roomCode}` cuando el participante detecta cambio de ronda via `onSnapshot`
4. Mostrar indicador de ronda actual: "Ronda 2 de ..."

#### Archivos afectados
- `src/pages/Room.jsx` — botón nueva ronda, lógica de ronda
- `src/contexts/FirebaseContext.jsx` — query de palabras filtrada por ronda
- Firestore — campo `round` en rooms, posible subcolección de historial

---

### M-04 — Contador de participantes visible para todos

**Nivel**: 🟢 Quick Win  
**Esfuerzo**: 30 minutos  
**Impacto**: Medio — crea sensación de comunidad, el participante sabe que no está solo

#### Descripción
El conteo de participantes ya existe en la data (via `subscribeToParticipants`), pero solo es visible para el admin en el header de la sala. Mostrarlo también en la vista del participante.

#### Implementación
1. En `Room.jsx`, mostrar badge con número de participantes en la vista de participante
2. Ubicar debajo del formulario de envío o en el header de la sala
3. Texto: "👥 {n} participantes conectados"
4. Actualización en tiempo real (ya suscrito via `onSnapshot`)

#### Archivos afectados
- `src/pages/Room.jsx` — agregar badge en vista participante

---

## 🟠 NIVEL 2 — Features de Valor

---

### M-05 — Múltiples palabras por participante (configurable)

**Nivel**: 🟠 Feature de Valor  
**Esfuerzo**: 4 horas  
**Impacto**: Muy Alto — **diferenciador directo vs Mentimeter** (que cobra por esto)

#### Descripción
Actualmente cada participante puede enviar 1 sola palabra. El admin debería poder configurar cuántas palabras permite: 1, 3, 5, o ilimitadas.

#### Implementación
1. Agregar campo `maxWordsPerUser` al crear sala (default: 1)
2. UI de configuración en el formulario de creación de sala (Dashboard)
3. En `Room.jsx`, rastrear cuántas palabras ha enviado el participante:
   - `localStorage: words_sent_{roomCode} = [count]`
   - Mostrar "Te quedan {n} palabras" o "Enviaste {n}/{max}"
4. Deshabilitar formulario cuando se alcance el límite
5. Firestore: el campo se lee del documento de la sala

#### Archivos afectados
- `src/pages/Dashboard.jsx` — campo `maxWordsPerUser` en creación
- `src/pages/Room.jsx` — lógica de conteo y UI
- `src/contexts/FirebaseContext.jsx` — incluir campo en creación de sala

#### Notas
- No se valida server-side (misma estrategia actual con localStorage)
- En modo "ilimitado", el formulario nunca se deshabilita

---

### M-06 — Moderación de palabras

**Nivel**: 🟠 Feature de Valor  
**Esfuerzo**: 4 horas  
**Impacto**: Muy Alto — imprescindible para uso corporativo y educativo serio

#### Descripción
El admin necesita poder eliminar/ocultar palabras inapropiadas del word cloud en tiempo real.

#### Implementación

**Opción A — Eliminación directa:**
1. En `WordCloudVisualization.jsx`, mostrar botón "✕" al hover en cada palabra (solo si `isAdmin`)
2. Al hacer click, eliminar el documento de Firestore
3. El `onSnapshot` actualiza la nube automáticamente

**Opción B — Soft-delete con ocultamiento:**
1. Agregar campo `hidden: true` al documento de la palabra
2. Filtrar palabras ocultas en la query/render
3. Panel de "palabras ocultas" para el admin donde puede restaurarlas

**Lista de palabras bloqueadas (opcional):**
1. Campo `blockedWords: []` en el documento de la sala
2. Validar contra la lista antes de guardar en Firestore
3. Rechazar con mensaje genérico "Palabra no permitida"

#### Archivos afectados
- `src/components/WordCloudVisualization.jsx` — botón de eliminar por palabra
- `src/pages/Room.jsx` — pasar `isAdmin` al componente
- `src/contexts/FirebaseContext.jsx` — función `deleteWord()` o `hideWord()`
- `firestore.rules` — permitir delete de words al creador de la sala

---

### M-07 — Temporizador visible

**Nivel**: 🟠 Feature de Valor  
**Esfuerzo**: 3 horas  
**Impacto**: Alto — transforma la dinámica de "cuando quieras" a evento interactivo

#### Descripción
El admin configura la duración de la ronda. Un timer grande y visible para todos los participantes crea urgencia y dinamismo.

#### Implementación
1. Agregar campo `timerDuration` (en segundos) al crear/activar sala: 30s, 60s, 120s, 300s, o "sin límite"
2. Al activar la sala, guardar `timerStartedAt: serverTimestamp()` en Firestore
3. Componente `Timer.jsx`:
   - Calcula tiempo restante: `timerDuration - (now - timerStartedAt)`
   - Muestra contador regresivo grande y centrado
   - Cambia de color cuando quedan menos de 10 segundos (verde → amarillo → rojo)
   - Animación pulsante en los últimos 5 segundos
4. Al llegar a 0:
   - Cambiar estado de la sala a `ended` automáticamente
   - Mostrar mensaje "¡Tiempo terminado!"
   - Deshabilitar formulario de envío

#### Archivos afectados
- `src/pages/Dashboard.jsx` — selector de duración al crear sala
- `src/pages/Room.jsx` — renderizar Timer y lógica de auto-cierre
- `src/components/Timer.jsx` — nuevo componente
- Firestore — campos `timerDuration`, `timerStartedAt`

---

### M-08 — Ranking / Top Words

**Nivel**: 🟠 Feature de Valor  
**Esfuerzo**: 3 horas  
**Impacto**: Alto — complementa el word cloud con datos concretos

#### Descripción
Panel lateral o sección que muestra el ranking de las palabras más votadas, con opción de "reveal" progresivo.

#### Implementación

**Panel de ranking:**
1. Componente `TopWords.jsx` que muestra las Top 5-10 palabras ordenadas por `count`
2. Cada entrada: posición, palabra, barrita de progreso, count
3. Animación cuando cambia el ranking (subir/bajar)
4. Visible en vista admin y en modo presentación (toggle)

**Modo "Reveal" (para presentaciones):**
1. Botón "Revelar Top Words" para admin
2. Muestra palabras de la #10 a la #1, una a una, con pausa dramática
3. Efecto de entrada: fade-in + scale desde abajo
4. Sonido opcional al revelar cada palabra

#### Archivos afectados
- `src/components/TopWords.jsx` — nuevo componente
- `src/pages/Room.jsx` — integrar panel y toggle
- `src/components/WordCloudVisualization.jsx` — interacción con reveal

---

### M-09 — Temas visuales para presentación

**Nivel**: 🟠 Feature de Valor  
**Esfuerzo**: 3 horas  
**Impacto**: Medio — personalización visual para distintos contextos

#### Descripción
Varios temas de fondo para el modo presentación, permitiendo al admin adaptar la estética a su evento.

#### Implementación
1. Definir temas predefinidos con sus propiedades:

| Tema | Fondo | Colores texto | Icono |
|------|-------|---------------|-------|
| **Corporativo** | Gradiente azul oscuro → negro | Blancos + azules | 🏢 |
| **Educación** | Gradiente verde → azul teal | Blancos + verdes | 📚 |
| **Fun/Party** | Gradiente rosa → violeta + partículas | Multicolor vibrante | 🎉 |
| **Minimal** | Negro sólido | Blanco puro | ⚫ |
| **Naturaleza** | Gradiente verde bosque | Verdes claros + dorados | 🌿 |

2. Selector de tema al crear sala o desde el header de presentación
3. Guardar tema seleccionado en `roomData.theme`
4. `WordCloudVisualization.jsx` y `Room.jsx` aplican estilos según tema

#### Archivos afectados
- `src/utils/themes.js` — nuevo archivo con definición de temas
- `src/pages/Room.jsx` — selector y aplicación de tema
- `src/components/WordCloudVisualization.jsx` — estilos dinámicos
- `src/pages/Dashboard.jsx` — selector de tema al crear sala

---

### M-10 — QR Code para unirse a la sala

**Nivel**: 🟠 Feature de Valor  
**Esfuerzo**: 2 horas  
**Impacto**: Muy Alto — **fundamental para eventos presenciales** (proyector + audiencia con celular)

#### Descripción
Generar QR automáticamente con el link de la sala. Mostrar en modo presentación para que la audiencia escanee y participe.

#### Implementación
1. Instalar librería de QR: `qrcode.react` o `react-qr-code` (~3KB)
2. Generar QR con URL: `https://wordcloud-app.netlify.app/join?code={codigo}`
3. **En modo presentación:**
   - Botón toggle "Mostrar QR" en el header
   - QR grande centrado con código debajo: "Escanea para participar — Código: ABC123"
   - Overlay semi-transparente sobre el word cloud
4. **En vista admin normal:**
   - QR pequeño en el panel de acciones junto a "Copiar Link"
5. **En ShareModal:**
   - Incluir QR descargable junto a las opciones de compartir

#### Archivos afectados
- `package.json` — nueva dependencia `qrcode.react`
- `src/pages/Room.jsx` — QR en presentación y vista admin
- `src/components/ShareModal.jsx` — QR en modal de compartir
- `src/components/QROverlay.jsx` — nuevo componente para el overlay en presentación

---

## 🔵 NIVEL 3 — Polish Profesional

---

### M-11 — Tests E2E con Playwright

**Nivel**: 🔵 Polish  
**Esfuerzo**: 3 horas  
**Impacto**: Alto — estabilidad, confianza en deploys, requisito del proyecto

#### Descripción
Implementar suite de tests end-to-end cubriendo los flujos críticos. Integrar con GitHub Actions para CI.

#### Tareas
1. Instalar y configurar Playwright
2. Tests mínimos:
   - Carga de landing page
   - Flujo de registro e inicio de sesión
   - Creación de sala desde Dashboard
   - Unirse a sala con código
   - Envío de palabra y aparición en word cloud
   - Modo presentación (entrar/salir)
3. Configurar GitHub Actions workflow para ejecutar en cada push

#### Referencia
Detalle en [`docs/backlog-deuda-tecnica.md`](backlog-deuda-tecnica.md) — DT-02

---

### M-12 — PWA (Progressive Web App)

**Nivel**: 🔵 Polish  
**Esfuerzo**: 2 horas  
**Impacto**: Medio — experiencia nativa en móvil, acceso directo desde home screen

#### Descripción
`manifest.json` ya existe pero falta el service worker. Implementar para permitir "instalar" la app en móvil.

#### Implementación
1. Registrar service worker con Vite PWA plugin (`vite-plugin-pwa`)
2. Configurar estrategia de cache: network-first para Firestore, cache-first para assets
3. Icono de "instalar app" en el header para móvil
4. Splash screen con branding

#### Archivos afectados
- `vite.config.js` — plugin PWA
- `package.json` — dependencia `vite-plugin-pwa`
- `public/manifest.json` — completar con iconos y configuración
- `src/main.jsx` — registro de service worker

---

### M-13 — Analytics básicos para admin

**Nivel**: 🔵 Polish  
**Esfuerzo**: 4 horas  
**Impacto**: Medio — dashboard con estadísticas históricas

#### Descripción
Dashboard con métricas acumuladas para el admin: cuántas salas ha creado, total de participantes, palabras más populares a lo largo del tiempo.

#### Implementación
1. Sección en Dashboard con tarjetas estadísticas:
   - Total de salas creadas (todas / activas / finalizadas)
   - Total de participantes acumulado
   - Total de palabras recibidas
   - Promedio de participantes por sala
2. Calcular desde queries existentes de Firestore (sin colección adicional)
3. Gráfico simple con top 10 palabras más usadas (opcional, con chart.js o recharts)

#### Archivos afectados
- `src/pages/Dashboard.jsx` — sección de estadísticas
- `src/contexts/FirebaseContext.jsx` — queries de agregación

---

### M-14 — Sonidos y feedback háptico

**Nivel**: 🔵 Polish  
**Esfuerzo**: 2 horas  
**Impacto**: Bajo — detalle que mejora la experiencia sensorial

#### Descripción
Feedback auditivo y háptico sutil para eventos clave.

#### Implementación
1. **Sonido al llegar nueva palabra** (vista admin/presentación):
   - Sonido "pop" sutil, toggleable desde el header
   - Usar Web Audio API o archivos mp3 pequeños
2. **Vibración al enviar palabra** (participante en móvil):
   - `navigator.vibrate(50)` al confirmar envío
3. **Animación "pop" más pronunciada** para nuevas palabras en el word cloud:
   - Escala de 0 → 1.2 → 1.0 (ya medio implementado con `animate-word-bounce`)

#### Archivos afectados
- `src/pages/Room.jsx` — toggle de sonido, vibración al enviar
- `src/components/WordCloudVisualization.jsx` — trigger de sonido
- `public/sounds/` — nuevo directorio con archivos de audio (o generados via Web Audio API)

---

### M-15 — Internacionalización (i18n)

**Nivel**: 🔵 Polish  
**Esfuerzo**: 4 horas  
**Impacto**: Medio — amplía audiencia, la app es 100% en español actualmente

#### Descripción
Soporte multi-idioma comenzando con inglés. Detección automática del idioma del navegador.

#### Implementación
1. Instalar `react-i18next` + `i18next`
2. Crear archivos de traducción:
   - `src/locales/es.json` — español (extraer todos los strings actuales)
   - `src/locales/en.json` — inglés
3. Selector de idioma en el header/footer
4. Detectar idioma del navegador como default (`i18next-browser-languagedetector`)
5. Reemplazar strings hardcoded por `t('key')` en todos los componentes

#### Archivos afectados
- Todos los componentes con texto visible
- `src/i18n.js` — nuevo archivo de configuración
- `src/locales/` — nuevo directorio
- `package.json` — nuevas dependencias

---

## Prioridad recomendada de implementación

### Fase 1 — Fundamentos (semana 1)
1. **M-01** Limpiar deuda técnica
2. **M-10** QR Code para unirse
3. **M-02** Exportar PNG
4. **M-04** Contador visible para todos

### Fase 2 — Diferenciación (semana 2-3)
5. **M-05** Múltiples palabras por participante
6. **M-06** Moderación de palabras
7. **M-07** Temporizador visible
8. **M-08** Ranking / Top Words

### Fase 3 — Premium (semana 4+)
9. **M-09** Temas visuales
10. **M-03** Múltiples rondas
11. **M-11** Tests E2E
12. **M-12** PWA
13. **M-13** Analytics
14. **M-14** Sonidos
15. **M-15** i18n
