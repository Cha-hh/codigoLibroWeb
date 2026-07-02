import { kv } from '@vercel/kv'

const ADMIN_PASSWORD_KEY = 'admin:password_hash'
const ADMIN_PASSWORDS_KEY = 'admin:password_hash:'
const ADMIN_USERS_KEY = 'admin:users'
const ADMIN_ROLES_KEY = 'admin:role:'

const buildAdminPasswordKey = (username) => `${ADMIN_PASSWORDS_KEY}${username}`
const buildAdminRoleKey = (username) => `${ADMIN_ROLES_KEY}${username}`

export const getAdminPasswordHash = async () => {
  const hash = await kv.get(ADMIN_PASSWORD_KEY)
  return typeof hash === 'string' && hash.length > 0 ? hash : null
}

export const setAdminPasswordHash = async (hash) => {
  if (!hash) {
    throw new Error('Hash requerido')
  }
  await kv.set(ADMIN_PASSWORD_KEY, hash)
}

export const getAdminPasswordHashByUsername = async (username) => {
  if (!username) return null

  const hash = await kv.get(buildAdminPasswordKey(username))
  return typeof hash === 'string' && hash.length > 0 ? hash : null
}

export const setAdminPasswordHashByUsername = async (username, hash) => {
  if (!username) {
    throw new Error('Usuario requerido')
  }
  if (!hash) {
    throw new Error('Hash requerido')
  }

  await kv.set(buildAdminPasswordKey(username), hash)
}

export const getStoredAdminUsernames = async () => {
  const usernames = await kv.get(ADMIN_USERS_KEY)
  if (!Array.isArray(usernames)) return []

  return usernames.filter(
    (username) => typeof username === 'string' && username.trim().length > 0
  )
}

export const setStoredAdminUsernames = async (usernames) => {
  await kv.set(ADMIN_USERS_KEY, usernames)
}

export const addStoredAdminUsername = async (username) => {
  const usernames = await getStoredAdminUsernames()
  if (usernames.includes(username)) return

  usernames.push(username)
  await setStoredAdminUsernames(usernames)
}

export const removeStoredAdminUsername = async (username) => {
  const usernames = await getStoredAdminUsernames()
  const nextUsernames = usernames.filter((item) => item !== username)
  await setStoredAdminUsernames(nextUsernames)
}

export const deleteAdminPasswordHashByUsername = async (username) => {
  if (!username) return
  await kv.del(buildAdminPasswordKey(username))
}

export const getAdminRoleByUsername = async (username) => {
  if (!username) return null

  const role = await kv.get(buildAdminRoleKey(username))
  return typeof role === 'string' && role.trim().length > 0 ? role.trim() : null
}

export const setAdminRoleByUsername = async (username, role) => {
  if (!username) {
    throw new Error('Usuario requerido')
  }
  if (!role) {
    throw new Error('Rol requerido')
  }

  await kv.set(buildAdminRoleKey(username), role)
}

export const deleteAdminRoleByUsername = async (username) => {
  if (!username) return
  await kv.del(buildAdminRoleKey(username))
}

export {
  ADMIN_PASSWORD_KEY,
  ADMIN_USERS_KEY,
  buildAdminPasswordKey,
  buildAdminRoleKey
}
