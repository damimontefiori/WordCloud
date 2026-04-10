import React, { useState, useEffect, useRef, useCallback } from 'react'

const WordCloudVisualization = ({ words, presentationMode = false }) => {
  const [animatedWords, setAnimatedWords] = useState([])
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 })

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

  // Rastrear dimensiones reales del contenedor con ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        setContainerSize({ width, height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Calcular tamaños óptimos basados en el área disponible del contenedor
  // Similar a Mentimeter: las palabras llenan el espacio, escalando según el área
  const calculateOptimalSizes = useCallback((wordsData) => {
    const maxCount = Math.max(...wordsData.map(w => w.count), 1)
    const { width, height } = containerSize
    // Área usable (descontar padding y márgenes)
    const availableArea = width * height * 0.80

    // Tamaños base generosos - se escalarán según el espacio
    const baseMin = presentationMode ? 24 : 16
    const baseMax = presentationMode ? 130 : 64

    // Calcular tamaño inicial de cada palabra según su proporción de votos
    const initialSizes = wordsData.map(w => {
      const ratio = w.count / maxCount
      // Curva cuadrática para mayor diferencia entre populares y no populares
      return baseMin + (Math.pow(ratio, 0.7) * (baseMax - baseMin))
    })

    // Estimar área total que ocupan las palabras con los tamaños iniciales
    const estimateArea = (sizes) => {
      return wordsData.reduce((total, word, i) => {
        const fontSize = sizes[i]
        const wordWidth = word.text.length * fontSize * 0.55 + fontSize * 0.5
        const wordHeight = fontSize * 1.3 + 8
        return total + wordWidth * wordHeight
      }, 0)
    }

    const totalEstArea = estimateArea(initialSizes)

    // Factor de escala para llenar el espacio disponible
    let scaleFactor = 1
    if (totalEstArea > 0) {
      scaleFactor = Math.sqrt(availableArea / totalEstArea)
      // En modo normal, limitar inflado para que pocas palabras no se desborden
      const maxScale = presentationMode ? 3.0 : 1.5
      scaleFactor = Math.min(scaleFactor, maxScale)
      scaleFactor = Math.max(scaleFactor, 0.25)
    }

    // Redondear el factor a pasos de 0.05 para evitar resize en cada palabra
    scaleFactor = Math.round(scaleFactor * 20) / 20

    const minFontSize = presentationMode ? 14 : 10
    const maxFontSize = presentationMode ? 200 : 72
    return initialSizes.map(size => {
      const scaled = Math.max(minFontSize, Math.round(size * scaleFactor))
      return Math.min(scaled, maxFontSize)
    })
  }, [containerSize, presentationMode])

  // Actualizar palabras con animación cuando cambien las palabras o el tamaño del contenedor
  useEffect(() => {
    if (words.length === 0) {
      setAnimatedWords([])
      return
    }

    // Calcular tamaños óptimos basados en el contenedor
    const optimalSizes = calculateOptimalSizes(words)
    
    const processedWords = words.map((wordData, index) => {
      // Generar desplazamiento vertical pseudo-aleatorio basado en el texto
      const hash = wordData.text.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
      const offsetY = (Math.abs(hash) % 50) - 25  // -25px a +25px vertical

      return {
        ...wordData,
        id: `${wordData.text}-${wordData.count}`,
        color: getWordColor(wordData.text),
        size: optimalSizes[index],
        animationDelay: index * 100,
        isNew: !animatedWords.find(w => w.text === wordData.text),
        offsetY
      }
    })

    setAnimatedWords(processedWords)
  }, [words, calculateOptimalSizes])

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

  // Calcular gaps dinámicos según el tamaño promedio de las palabras
  const avgSize = animatedWords.length > 0 
    ? animatedWords.reduce((sum, w) => sum + w.size, 0) / animatedWords.length 
    : 40
  const dynamicGap = presentationMode 
    ? Math.max(8, Math.round(avgSize * 0.3))
    : undefined

  return (
    <div 
      ref={containerRef}
      className={`word-cloud-container relative rounded-2xl ${
        presentationMode 
          ? 'bg-transparent p-2 sm:p-4 h-full max-h-full overflow-hidden' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50 p-8 min-h-[400px] overflow-hidden'
      }`}
    >
      {/* Efecto de fondo sutil - solo en modo normal */}
      {!presentationMode && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 animate-pulse opacity-50"></div>
      )}
      
      <div 
        className={`relative flex flex-wrap items-center justify-center h-full ${
          presentationMode ? 'content-center' : 'gap-6 py-8'
        }`}
        style={presentationMode ? { 
          gap: `${dynamicGap}px ${dynamicGap * 2}px`,
          padding: `${dynamicGap}px` 
        } : undefined}
      >
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
            offsetY={wordData.offsetY}
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

const WordItem = ({ text, count, color, size, isNew, animationDelay, presentationMode = false, offsetY = 0 }) => {
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
        // En modo presentación, desplazar verticalmente proporcional al tamaño
        marginTop: presentationMode ? `${Math.round(offsetY * size * 0.012)}px` : undefined,
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
