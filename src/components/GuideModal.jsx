import React from 'react'

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">📖 Guía Rápida de WordCloud</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Introducción */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Bienvenido a WordCloud!</h3>
            <p className="text-gray-600">
              Crea sesiones interactivas de lluvia de ideas en menos de 2 minutos
            </p>
          </div>

          {/* Pasos */}
          <div className="space-y-6">
            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Crear tu sala</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Haz clic en "Crear Nueva Sala" y configura tu sesión:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• <strong>Título:</strong> Ej: "Elijamos un nombre para nuestro nuevo producto"</li>
                  <li>• <strong>Descripción:</strong> Opcional, ayuda a los participantes</li>
                  <li>• <strong>Iniciar automáticamente:</strong> Activa si quieres empezar de inmediato</li>
                </ul>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Compartir el código</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Tu sala generará un código único de 6 caracteres. Puedes compartir el código o el link directo a la sala:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📋</span>
                    <span className="font-mono text-lg">ABC123</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Botón "Copiar Link" para compartir por WhatsApp, email o proyectar en pantalla
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Los participantes se unen</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Tus participantes pueden unirse fácilmente:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• Van a <strong>wordcloud.com.ar/join</strong></li>
                  <li>• Escriben el código de 6 caracteres</li>
                  <li>• Ponen su nombre (opcional)</li>
                  <li>• ¡Listo para participar!</li>
                </ul>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Iniciar la sesión</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Cuando tengas participantes conectados (si eres presentador):
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• Haz clic en "Iniciar" si la sala está en espera</li>
                  <li>• Los participantes pueden empezar a enviar palabras</li>
                  <li>• El Word Cloud se actualiza en tiempo real</li>
                </ul>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ver resultados</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Observa cómo se forma el Word Cloud:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• Las palabras más frecuentes aparecen más grandes</li>
                  <li>• Todo se actualiza instantáneamente</li>
                  <li>• Usa el modo presentación para pantalla completa</li>
                  <li>• Finaliza la sala cuando termines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Consejos */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Consejos para el éxito
            </h4>
            <ul className="text-yellow-800 text-sm space-y-2">
              <li>• <strong>Proyecta el código:</strong> Muestra el código en una pantalla grande</li>
              <li>• <strong>Explica la dinámica:</strong> "Envíen una palabra relacionada con..."</li>
              <li>• <strong>Da ejemplos:</strong> "Innovación", "Creatividad", etc.</li>
              <li>• <strong>Tiempo límite:</strong> "Tienen 5 minutos para enviar su palabra"</li>
              <li>• <strong>Una palabra por persona:</strong> Cada participante puede enviar solo una palabra</li>
            </ul>
          </div>

          {/* Ejemplos de uso */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Ejemplos de uso
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-800 mb-1">📚 Educación</h5>
                <ul className="text-green-700 space-y-1">
                  <li>• "¿Qué sabes sobre el tema?"</li>
                  <li>• "Palabras clave de la clase"</li>
                  <li>• "Conceptos importantes"</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-800 mb-1">💼 Empresa</h5>
                <ul className="text-green-700 space-y-1">
                  <li>• "Lluvia de ideas para producto"</li>
                  <li>• "Valores de la empresa"</li>
                  <li>• "Objetivos del trimestre"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              ¡Entendido, crear mi primera sala!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuideModal
