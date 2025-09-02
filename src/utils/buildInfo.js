// Este archivo es generado automáticamente durante el build
export const buildInfo = {
  version: "v2.1.0",
  buildDate: new Date().toISOString(),
  buildTime: new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }),
  buildTimestamp: Date.now(),
  gitCommit: process.env.VITE_GIT_COMMIT || 'unknown',
  environment: process.env.NODE_ENV || 'development'
}
