import fs from 'fs'
import path from 'path'

let cache = null

const CANDIDATE_PATHS = [
  path.join(process.cwd(), 'data', 'codigos-postales.json'),
  path.join(process.cwd(), 'apps/web/data', 'codigos-postales.json')
]

const loadDataset = () => {
  if (cache) return cache

  for (const filePath of CANDIDATE_PATHS) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      cache = JSON.parse(raw)
      return cache
    } catch {
      // intenta la siguiente ruta candidata
    }
  }

  throw new Error('No se pudo cargar el catálogo de códigos postales')
}

export const lookupPostalCode = (postalCode) => {
  const normalized = String(postalCode || '').replace(/\D/g, '').slice(0, 5)
  if (normalized.length !== 5) return null

  const dataset = loadDataset()
  const entry = dataset[normalized]
  if (!entry) return null

  return {
    municipio: entry.municipio || '',
    ciudad: entry.ciudad || '',
    estado: entry.estado || '',
    colonias: Array.isArray(entry.colonias) ? entry.colonias : []
  }
}
