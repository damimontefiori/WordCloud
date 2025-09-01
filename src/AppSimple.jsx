import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

function SimpleHome() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">WordCloud App</h1>
        <p className="text-gray-600 mb-6">¡La aplicación está funcionando!</p>
        <div className="space-y-2">
          <a href="/dashboard" className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center">
            Ir al Dashboard
          </a>
          <a href="/join" className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center">
            Unirse a Sala
          </a>
        </div>
      </div>
    </div>
  )
}

function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">Dashboard simplificado sin contextos de Firebase</p>
        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Crear Sala (Simulado)
        </button>
      </div>
    </div>
  )
}

function AppSimple() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/dashboard" element={<SimpleDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default AppSimple
