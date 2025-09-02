import React, { useState, useEffect } from 'react'

const WordCloudVisualization = ({ words, presentationMode = false }) => {
  const [animatedWords, setAnimatedWords] = useState([])

  // Paleta de colores vibrantes y atractivos
  const colorPalette = [
    '#FF6B6B', // Coral rojo
    '#4ECDC4', // Turquesa
    '#45B7D1', // Azul cielo
    '#96CEB4', // Verde menta
    '#FECA57', // Amarillo dorado
    '#FF9FF3', // Rosa
    '#54A0FF', // Azul brillante
    '#5F27CD', // Morado
    '#00D2D3', // Cian
    '#FF9F43', // Naranja
    '#10AC84', // Verde esmeralda
    '#EE5A24', // Naranja rojizo
    '#0ABDE3', // Azul agua
    '#C44569', // Rosa oscuro
    '#F8B500', // Amarillo mostaza
  ]

  // Función para asignar color basado en el texto de la palabra
  const getWordColor = (text) => {
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colorPalette[Math.abs(hash) % colorPalette.length]
  }

  // Función para calcular el tamaño de la fuente dinámicamente
  const getWordSize = (count, maxCount) => {
    // En modo presentación, usar tamaños más grandes
    const minSize = presentationMode ? 24 : 16
    const maxSize = presentationMode ? 120 : 64
    const ratio = count / Math.max(maxCount, 1)
    return Math.max(minSize, Math.min(maxSize, minSize + (ratio * (maxSize - minSize))))
  }

  // Actualizar palabras con animación cuando cambie el array
  useEffect(() => {
    if (words.length === 0) {
      setAnimatedWords([])
      return
    }

    const maxCount = Math.max(...words.map(w => w.count), 1)
    
    const processedWords = words.map((wordData, index) => ({
      ...wordData,
      id: `${wordData.text}-${wordData.count}`,
      color: getWordColor(wordData.text),
      size: getWordSize(wordData.count, maxCount),
      animationDelay: index * 100, // Stagger animation
      isNew: !animatedWords.find(w => w.text === wordData.text)
    }))

    setAnimatedWords(processedWords)
  }, [words])

  if (animatedWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-full mb-6">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Esperando las primeras palabras...
        </h3>
        <p className="text-gray-500 max-w-md">
          ¡Las palabras aparecerán aquí con colores vibrantes y animaciones cuando los participantes empiecen a enviarlas!
        </p>
      </div>
    )
  }

  return (
    <div className={`word-cloud-container relative overflow-hidden rounded-2xl min-h-[400px] ${
      presentationMode 
        ? 'bg-transparent p-12 min-h-[600px]' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50 p-8'
    }`}>
      {/* Efecto de fondo sutil - solo en modo normal */}
      {!presentationMode && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 animate-pulse opacity-50"></div>
      )}
      
      <div className={`relative flex flex-wrap items-center justify-center gap-6 py-8 ${
        presentationMode ? 'gap-12 py-16' : ''
      }`}>
        {animatedWords.map((wordData) => (
          <WordItem
            key={wordData.id}
            text={wordData.text}
            count={wordData.count}
            color={wordData.color}
            size={wordData.size}
            isNew={wordData.isNew}
            animationDelay={wordData.animationDelay}
            presentationMode={presentationMode}
          />
        ))}
      </div>
      
      {/* Partículas decorativas - solo en modo normal */}
      {!presentationMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-particle bg-blue-300 opacity-20"></div>
          <div className="floating-particle bg-purple-300 opacity-20" style={{ animationDelay: '2s' }}></div>
          <div className="floating-particle bg-pink-300 opacity-20" style={{ animationDelay: '4s' }}></div>
        </div>
      )}
    </div>
  )
}

const WordItem = ({ text, count, color, size, isNew, animationDelay, presentationMode = false }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), animationDelay)
    return () => clearTimeout(timer)
  }, [animationDelay])

  return (
    <span
      className={`
        word-item font-bold select-none cursor-default
        transition-all duration-500 ease-out
        hover:scale-110 hover:rotate-1 hover:z-10
        ${isVisible ? 'animate-word-appear' : 'opacity-0 scale-0'}
        ${isNew ? 'animate-word-bounce' : ''}
        ${presentationMode ? 'text-white' : ''}
      `}
      style={{
        color: presentationMode ? 'white' : color,
        fontSize: `${size}px`,
        textShadow: presentationMode 
          ? `3px 3px 6px rgba(0,0,0,0.8), 0 0 20px ${color}` 
          : `2px 2px 4px rgba(0,0,0,0.1)`,
        filter: presentationMode 
          ? `drop-shadow(0 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 15px ${color})`
          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        animationDelay: `${animationDelay}ms`,
      }}
      title={`"${text}" - ${count} ${count === 1 ? 'voto' : 'votos'}`}
    >
      {text}
      {count > 1 && (
        <sup className={`text-xs opacity-75 ml-1 font-normal ${
          presentationMode ? 'text-blue-200' : ''
        }`}>
          {count}
        </sup>
      )}
    </span>
  )
}

export default WordCloudVisualization
