import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { buildInfo } from '../../utils/buildInfo'

const VersionInfo = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const location = useLocation()

  // Detectar modo presentación usando el hook useLocation
  const isPresentationMode = () => {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('presentation') === 'true' || 
           location.pathname.includes('/presentation') ||
           location.pathname.includes('/room/')
  }

  // No mostrar en modo presentación (el responsive se maneja con CSS: hidden md:block)
  if (isPresentationMode()) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50 hidden md:block">
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="bg-gray-900 text-white px-2 py-1 rounded-md text-xs font-mono cursor-default shadow-lg hover:bg-gray-800 transition-colors">
          {buildInfo.version}
        </div>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap shadow-xl z-60 animate-fade-in border border-gray-600">
            <div className="space-y-1">
              <div><span className="text-gray-300">Versión:</span> <span className="text-green-400">{buildInfo.version}</span></div>
              <div><span className="text-gray-300">Deploy:</span> <span className="text-blue-400">{buildInfo.buildTime}</span></div>
              <div><span className="text-gray-300">Build ID:</span> <span className="text-yellow-400">{buildInfo.buildTimestamp}</span></div>
              <div><span className="text-gray-300">Entorno:</span> <span className="text-purple-400">{buildInfo.environment}</span></div>
              {buildInfo.gitCommit !== 'unknown' && (
                <div><span className="text-gray-300">Commit:</span> <span className="text-orange-400">{buildInfo.gitCommit?.substring(0, 7)}</span></div>
              )}
            </div>
            {/* Flecha del tooltip */}
            <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 border-l border-t border-gray-600 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VersionInfo
