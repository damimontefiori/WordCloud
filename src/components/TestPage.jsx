import React from 'react'

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">WordCloud App</h1>
        <p className="text-xl text-gray-600 mb-8">Aplicación funcionando correctamente</p>
        <div className="space-y-4">
          <div className="text-green-600">✅ React renderizando</div>
          <div className="text-green-600">✅ Tailwind CSS funcionando</div>
          <div className="text-green-600">✅ Rutas configuradas</div>
        </div>
      </div>
    </div>
  )
}

export default TestPage
