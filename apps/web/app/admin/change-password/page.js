'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

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
    <div>
      <h1 className="text-3xl font-bold mb-6">Cambiar Contraseña</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Contraseña Actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Cambiar Contraseña</button>
        </form>
      </div>
    </div>
  )
}