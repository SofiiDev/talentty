// Convierte URLs de YouTube/Vimeo en URLs embebibles para iframe.
// Devuelve null si no es embebible (se muestra como enlace externo).
export function toEmbedUrl(url = '') {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}
