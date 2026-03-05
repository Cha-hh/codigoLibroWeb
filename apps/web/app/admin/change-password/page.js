'use client'

import { useState } from 'react'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Verificar contraseña actual (hardcoded)
    if (currentPassword !== 'admin') {
      setError('Contraseña actual incorrecta')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    // En un sistema real, aquí se enviaría a una API para cambiar la contraseña
    // Por ahora, solo mostramos éxito
    setSuccess('Contraseña cambiada exitosamente')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-[65vh] w-full flex items-center justify-center px-2 sm:px-4 py-8 text-gray-100">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 uppercase tracking-[0.2em] text-center">Cambiar Contraseña</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-200 text-xs tracking-[0.18em] uppercase mb-2">Contraseña Actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-200 text-xs tracking-[0.18em] uppercase mb-2">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-200 text-xs tracking-[0.18em] uppercase mb-2">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
              required
            />
          </div>
          {error && <p className="text-red-300 mb-4">{error}</p>}
          {success && <p className="text-gray-200 mb-4">{success}</p>}
          <button type="submit" className="w-full bg-gray-800 text-white px-6 py-3 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase">Cambiar Contraseña</button>
        </form>
      </div>
    </div>
  )
}