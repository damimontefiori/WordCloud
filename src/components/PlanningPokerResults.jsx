import React from 'react'

// Componente de resultados para Planning Poker
// Muestra votos individuales, promedio, valor redondeado a escala y consenso tras revelar
const PlanningPokerResults = ({ votes, participants, revealed, scale }) => {
  if (!votes || votes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay votos aún en esta ronda</p>
      </div>
    )
  }

  // Mapear participantes por ID para buscar nombres
  const participantMap = {}
  participants.forEach(p => {
    participantMap[p.id] = p.name
  })

  // Calcular estadísticas numéricas (excluyendo "?")
  const numericVotes = votes
    .map(v => parseFloat(v.originalText || v.text))
    .filter(n => !isNaN(n))

  const average = numericVotes.length > 0
    ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length)
    : null

  // Redondear hacia arriba al valor numérico más cercano de la escala
  const roundedToScale = (() => {
    if (average === null || !scale?.values) return null
    const scaleNumbers = scale.values
      .map(v => parseFloat(v))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b)
    if (scaleNumbers.length === 0) return null
    // Buscar el primer valor de la escala >= promedio (redondeo hacia arriba)
    const upper = scaleNumbers.find(v => v >= average)
    return upper !== undefined ? upper : scaleNumbers[scaleNumbers.length - 1]
  })()

  const allSame = numericVotes.length > 0 && numericVotes.every(v => v === numericVotes[0])
  const hasConsensus = votes.length >= 2 && allSame

  // Vista previa (sin revelar): cartas boca abajo con conteo
  if (!revealed) {
    return (
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-4xl font-bold text-gray-800">{votes.length}</span>
          <span className="text-gray-500 text-lg">
            {votes.length === 1 ? 'voto recibido' : 'votos recibidos'}
          </span>
        </div>
        <div className="flex justify-center flex-wrap gap-2">
          {votes.map((_, i) => (
            <div
              key={i}
              className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-md flex items-center justify-center"
            >
              <span className="text-white text-xl font-bold">?</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Esperando a que el admin revele los votos...
        </p>
      </div>
    )
  }

  // Vista revelada: votos individuales + estadísticas
  return (
    <div className="space-y-6">
      {/* Promedio y consenso */}
      <div className="text-center">
        {average !== null && (
          <div className="mb-3 flex items-center justify-center gap-6">
            <div>
              <span className="text-4xl font-bold text-gray-500">{average.toFixed(1)}</span>
              <p className="text-sm text-gray-500 mt-1">Promedio</p>
            </div>
            {roundedToScale !== null && (
              <div>
                <span className="text-5xl font-bold text-primary-600">{roundedToScale}</span>
                <p className="text-sm text-gray-500 mt-1">Estimación</p>
              </div>
            )}
          </div>
        )}
        {hasConsensus && (
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✓ ¡Consenso alcanzado!
          </div>
        )}
        {!hasConsensus && votes.length >= 2 && (
          <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            ⚡ No hay consenso — considerar discusión
          </div>
        )}
      </div>

      {/* Votos individuales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {votes.map((vote, i) => {
          const participantName = participantMap[vote.participantId] || 'Participante'
          const displayValue = vote.originalText || vote.text
          return (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm animate-[fadeIn_0.3s_ease-in-out]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-2xl font-bold text-primary-600 mb-1">{displayValue}</div>
              <div className="text-xs text-gray-500 truncate">{participantName}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlanningPokerResults
