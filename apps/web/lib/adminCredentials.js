import {
  getAdminRoleByUsername,
  getAdminPasswordHashByUsername,
  getStoredAdminUsernames
} from './adminStore'

const normalizeUsername = (username) =>
  typeof username === 'string' ? username.trim() : ''

const normalizeCredential = (entry) => {
  if (!entry || typeof entry !== 'object') return null

  const username = normalizeUsername(entry.username)
  const passwordHash =
    typeof entry.passwordHash === 'string' ? entry.passwordHash.trim() : ''
  const role =
    typeof entry.role === 'string' && entry.role.trim().length > 0
      ? entry.role.trim()
      : 'admin'

  if (!username || !passwordHash) return null

  return { username, passwordHash, role }
}

const parseAdminUsersJson = () => {
  const raw = process.env.ADMIN_USERS_JSON
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeCredential).filter(Boolean)
  } catch {
    return []
  }
}

const getEnvAdminCredentials = () => {
  const credentials = new Map()

  const legacyUsername = normalizeUsername(process.env.ADMIN_USER)
  const legacyPasswordHash =
    typeof process.env.ADMIN_PASSWORD_HASH === 'string'
      ? process.env.ADMIN_PASSWORD_HASH.trim()
      : ''

  if (legacyUsername && legacyPasswordHash) {
    credentials.set(legacyUsername, {
      username: legacyUsername,
      passwordHash: legacyPasswordHash,
      role: 'admin',
      source: 'env'
    })
  }

  for (const entry of parseAdminUsersJson()) {
    credentials.set(entry.username, {
      ...entry,
      source: 'env'
    })
  }

  return credentials
}

export const getConfiguredAdminCredentials = async () => {
  const credentials = getEnvAdminCredentials()
  const storedUsernames = await getStoredAdminUsernames()

  for (const username of storedUsernames) {
    const storedHash = await getAdminPasswordHashByUsername(username)
    if (!storedHash) continue
    const storedRole = (await getAdminRoleByUsername(username)) || 'admin'

    const existing = credentials.get(username)
    credentials.set(username, {
      username,
      passwordHash: storedHash,
      role: existing?.role || storedRole,
      source: existing ? 'env+kv' : 'kv'
    })
  }

  return Array.from(credentials.values())
}

export const getConfiguredAdminUsernames = async () =>
  (await getConfiguredAdminCredentials()).map(({ username }) => username)

export const getConfiguredAdminCredential = async (username) => {
  const normalizedUsername = normalizeUsername(username)
  if (!normalizedUsername) return null

  return (
    (await getConfiguredAdminCredentials()).find(
      (entry) => entry.username === normalizedUsername
    ) || null
  )
}

export const getAdminAccounts = async () =>
  (await getConfiguredAdminCredentials()).map(({ username, source, role }) => ({
    username,
    role,
    source,
    isManaged: source === 'kv' || source === 'env+kv'
  }))

export const isSuperAdmin = (role) => role === 'superadmin'

export { normalizeUsername }
