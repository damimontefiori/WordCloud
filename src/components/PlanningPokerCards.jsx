import React, { useState } from 'react'

// Componente de tarjetas de votación para Planning Poker
// Muestra las cartas según la escala seleccionada y permite al participante votar
const PlanningPokerCards = ({ scale, onVote, disabled, selectedValue, onChangeVote }) => {
  const [hoveredCard, setHoveredCard] = useState(null)

  if (!scale || !scale.values) return null

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
        {selectedValue ? 'Tu estimación' : 'Selecciona tu estimación'}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {scale.values.map((value) => {
          const isSelected = selectedValue === value
          const isHovered = hoveredCard === value
          const isOtherSelected = selectedValue && !isSelected
          return (
            <button
              key={value}
              onClick={() => !disabled && onVote(value)}
              onMouseEnter={() => setHoveredCard(value)}
              onMouseLeave={() => setHoveredCard(null)}
              disabled={disabled}
              className={`
                relative aspect-[3/4] rounded-xl border-2 flex items-center justify-center
                text-2xl sm:text-3xl font-bold transition-all duration-200
                ${isSelected
                  ? 'border-primary-500 bg-primary-500 text-white shadow-lg scale-105'
                  : disabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : isOtherSelected
                      ? 'border-gray-200 bg-gray-50 text-gray-400 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 cursor-pointer'
                      : isHovered
                        ? 'border-primary-300 bg-primary-50 text-primary-700 shadow-md scale-105'
                        : 'border-gray-300 bg-white text-gray-700 hover:shadow-md cursor-pointer'
                }
              `}
            >
              {value}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
      {selectedValue && !disabled && (
        <div className="text-center mt-3">
          <p className="text-sm text-green-600 font-medium mb-1">
            ✓ Votaste: {selectedValue}
          </p>
          {onChangeVote && (
            <button
              onClick={onChangeVote}
              className="text-xs text-primary-600 hover:text-primary-800 underline transition-colors"
            >
              Cambiar voto
            </button>
          )}
        </div>
      )}
      {disabled && selectedValue && (
        <p className="text-center text-sm text-gray-500 mt-3 font-medium">
          ✓ Votaste: {selectedValue}. Los votos fueron revelados.
        </p>
      )}
    </div>
  )
}

export default PlanningPokerCards
