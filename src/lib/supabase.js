// Backend en Supabase: si las variables de entorno están configuradas (en Netlify
// o en un .env local), el estado completo del workspace se sincroniza contra la
// tabla `workspace_state`. Sin configurar, la app funciona 100% con localStorage.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const isRemoteEnabled = !!supabase

// Permite separar los datos de varias empresas/demos en la misma base
const WORKSPACE_ID = import.meta.env.VITE_TALENTTY_WORKSPACE || 'default'

export async function loadRemote() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('workspace_state')
    .select('data')
    .eq('id', WORKSPACE_ID)
    .maybeSingle()
  if (error) {
    console.warn('Supabase: no se pudo leer el estado remoto', error.message)
    return null
  }
  return data?.data || null
}

let timer = null
export function saveRemoteDebounced(state, onError) {
  if (!supabase) return
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const { error } = await supabase
      .from('workspace_state')
      .upsert({ id: WORKSPACE_ID, data: state, updated_at: new Date().toISOString() })
    if (error) {
      console.warn('Supabase: no se pudo guardar el estado remoto', error.message)
      onError?.(error)
    }
  }, 800)
}
