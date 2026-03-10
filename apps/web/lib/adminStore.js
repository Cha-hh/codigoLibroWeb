import { kv } from '@vercel/kv'

const ADMIN_PASSWORD_KEY = 'admin:password_hash'

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

export { ADMIN_PASSWORD_KEY }
