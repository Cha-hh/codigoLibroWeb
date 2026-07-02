'use client'

import { useEffect, useState } from 'react'

const sourceLabel = (source) => {
  if (source === 'env') return 'Base'
  if (source === 'env+kv') return 'Base + personalizada'
  return 'Creado en panel'
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([])
  const [currentUser, setCurrentUser] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('admin')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetPassword, setResetPassword] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingUser, setDeletingUser] = useState('')
  const [resettingUser, setResettingUser] = useState('')

  const loadAdmins = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudieron cargar los admins')
      }

      setAdmins(data.admins || [])
      setCurrentUser(data.currentUser || '')
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los admins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo crear el admin')
      }

      setAdmins(data.admins || [])
      setCurrentUser(data.currentUser || currentUser)
      setUsername('')
      setRole('admin')
      setPassword('')
      setConfirmPassword('')
      setSuccess('Admin creado correctamente')
    } catch (err) {
      setError(err.message || 'No se pudo crear el admin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (targetUsername) => {
    const newPassword = resetPassword[targetUsername] || ''

    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    setResettingUser(targetUsername)

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(targetUsername)}/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword })
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo restablecer la contraseña')
      }

      setResetPassword((current) => ({ ...current, [targetUsername]: '' }))
      setSuccess(`Contraseña restablecida para ${targetUsername}`)
    } catch (err) {
      setError(err.message || 'No se pudo restablecer la contraseña')
    } finally {
      setResettingUser('')
    }
  }

  const handleDelete = async (targetUsername) => {
    setError('')
    setSuccess('')

    if (!window.confirm(`Eliminar al admin ${targetUsername}?`)) {
      return
    }

    setDeletingUser(targetUsername)

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(targetUsername)}`,
        { method: 'DELETE' }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo eliminar el admin')
      }

      setAdmins(data.admins || [])
      setSuccess('Admin eliminado correctamente')
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el admin')
    } finally {
      setDeletingUser('')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-gray-100">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.2em]">
          Admins
        </h1>
        <p className="mt-3 text-sm text-gray-300">
          Admin actual: <span className="font-semibold text-gray-100">{currentUser || 'No disponible'}</span>
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Los usuarios base vienen de variables de entorno. Los creados aqui se guardan
          en KV y se pueden eliminar desde el panel.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Las contraseñas no se pueden ver porque se guardan cifradas como hash. Si hace
          falta, aqui solo se pueden restablecer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-lg">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold uppercase tracking-[0.18em]">
              Usuarios configurados
            </h2>
            <button
              onClick={loadAdmins}
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-gray-200 transition hover:bg-white/10"
            >
              Recargar
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-gray-400">Cargando admins...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.username}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-100">
                        {admin.username}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                        {admin.role === 'superadmin' ? 'Superadmin' : 'Admin'} ·{' '}
                        {sourceLabel(admin.source)}
                        {admin.username === currentUser ? ' · Sesion actual' : ''}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:min-w-[260px]">
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={resetPassword[admin.username] || ''}
                          onChange={(e) =>
                            setResetPassword((current) => ({
                              ...current,
                              [admin.username]: e.target.value
                            }))
                          }
                          className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                          placeholder="Nueva contraseña"
                        />
                        <button
                          onClick={() => handleResetPassword(admin.username)}
                          disabled={resettingUser === admin.username}
                          className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {resettingUser === admin.username ? 'Guardando...' : 'Reset'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDelete(admin.username)}
                        disabled={!admin.isManaged || deletingUser === admin.username || admin.username === currentUser}
                        className="rounded-full border border-red-300/30 px-4 py-2 text-xs uppercase tracking-[0.22em] text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deletingUser === admin.username ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <p className="text-sm text-gray-400">No hay admins configurados.</p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-lg">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em]">
            Crear admin
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-200">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                placeholder="superAdmin"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-200">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-200">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                placeholder="Minimo 8 caracteres"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-200">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/20 px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                required
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {success && <p className="text-sm text-gray-200">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gray-800 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Crear admin'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
