import React from 'react'
import { buildInfo } from '../utils/buildInfo'

const VersionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  // Obtener descripción de cambios basada en la versión
  const getChangeDescription = () => {
    return "✅ Autocompletado móvil, 🎨 Header simplificado, 📱 Menú hamburguesa mejorado, 🔧 UX optimizada para móvil"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Información de Versión</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Version Info */}
          <div className="space-y-4">
            {/* Versión */}
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Versión</span>
              <span className="text-sm font-mono text-green-600 font-bold">{buildInfo.version}</span>
            </div>

            {/* Deploy */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Deploy</span>
              <span className="text-xs font-mono text-blue-600">{buildInfo.buildTime}</span>
            </div>

            {/* Autor */}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Desarrollador</span>
              <div className="text-right">
                <div className="text-sm font-medium text-purple-600">Damián Montefiori</div>
                <a 
                  href="https://www.linkedin.com/in/damian-montefiori" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-purple-500 hover:text-purple-700 underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Descripción de cambios */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 block mb-2">Últimos cambios:</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                {getChangeDescription()}
              </p>
            </div>

            {/* Info técnica adicional */}
            <div className="p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 block mb-2">Info técnica:</span>
              <div className="space-y-1 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Build ID:</span> 
                  <span className="font-mono ml-2">{buildInfo.buildTimestamp}</span>
                </div>
                <div>
                  <span className="font-medium">Entorno:</span> 
                  <span className="ml-2 capitalize">{buildInfo.environment}</span>
                </div>
                {buildInfo.gitCommit !== 'unknown' && (
                  <div>
                    <span className="font-medium">Commit:</span> 
                    <span className="font-mono ml-2">{buildInfo.gitCommit?.substring(0, 7)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full btn btn-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionModal
