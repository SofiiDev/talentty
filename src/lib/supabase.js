// Backend en Supabase: autenticación, workspace multi-tenant, sincronización
// del estado y almacenamiento de archivos. Si las variables de entorno no
// están configuradas, la app funciona 100% en modo demo con localStorage.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const isRemoteEnabled = !!supabase

// ---------- Workspace ----------

// Devuelve el workspace del usuario autenticado; si no tiene, lo crea.
export async function resolveWorkspace() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberships, error: mErr } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
  if (mErr) throw mErr
  if (memberships?.length) return memberships[0].workspace_id

  const { data: ws, error } = await supabase
    .from('workspaces')
    .insert({ name: 'Mi organización', created_by: user.id })
    .select('id')
    .single()
  if (error) throw error
  return ws.id
}

export async function loadRemote(workspaceId) {
  if (!supabase || !workspaceId) return null
  const { data, error } = await supabase
    .from('workspace_state')
    .select('data')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
  if (error) {
    console.warn('Supabase: no se pudo leer el estado remoto', error.message)
    throw error
  }
  return data?.data || null
}

let timer = null
export function saveRemoteDebounced(workspaceId, state, onError) {
  if (!supabase || !workspaceId) return
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const { error } = await supabase
      .from('workspace_state')
      .upsert({ workspace_id: workspaceId, data: state, updated_at: new Date().toISOString() })
    if (error) {
      console.warn('Supabase: no se pudo guardar el estado remoto', error.message)
      onError?.(error)
    }
  }, 800)
}

// ---------- Storage ----------

// Sube un archivo al bucket público `archivos` y devuelve su URL pública.
export async function uploadPublicFile(file, folder = 'materiales') {
  if (!supabase) return null
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${folder}/${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('archivos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('archivos').getPublicUrl(path)
  return data.publicUrl
}
