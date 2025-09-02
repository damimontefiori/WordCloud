import fs from 'fs'
import { execSync } from 'child_process'

// Función para obtener información de Git
function getGitInfo() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    return { commit, branch }
  } catch {
    return { commit: 'unknown', branch: 'unknown' }
  }
}

// Función para generar la información del build
function generateBuildInfo() {
  const now = new Date()
  const gitInfo = getGitInfo()
  
  const buildInfo = {
    version: "v2.1.0",
    buildDate: now.toISOString(),
    buildTime: now.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }),
    buildTimestamp: now.getTime(),
    gitCommit: gitInfo.commit,
    gitBranch: gitInfo.branch,
    environment: process.env.NODE_ENV || 'production'
  }

  const content = `// Este archivo es generado automáticamente durante el build
export const buildInfo = ${JSON.stringify(buildInfo, null, 2)}`

  fs.writeFileSync('./src/utils/buildInfo.js', content)
  console.log('✅ Build info generada:', buildInfo.version, '-', buildInfo.buildTime)
}

generateBuildInfo()
