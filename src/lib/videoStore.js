// Almacenamiento de videos propios en IndexedDB (demo sin backend de archivos).
// Los videos subidos se referencian como "local:<id>". Con Supabase Storage
// configurado, este módulo puede migrarse a subida real.
const DB_NAME = 'talentty-media'
const STORE = 'videos'

const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

export const isLocalVideo = (ref) => typeof ref === 'string' && ref.startsWith('local:')

export async function saveVideo(file) {
  const db = await openDb()
  const id = Math.random().toString(36).slice(2, 12)
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(file, id)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
  return `local:${id}`
}

const urlCache = new Map()

export async function resolveVideoUrl(ref) {
  if (!isLocalVideo(ref)) return ref
  if (urlCache.has(ref)) return urlCache.get(ref)
  const db = await openDb()
  const blob = await new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(ref.slice(6))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(ref, url)
  return url
}
