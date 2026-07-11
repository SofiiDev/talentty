// Netlify Function: envío real de evaluaciones/notificaciones por email vía Resend.
// Configurar en Netlify → Environment variables:
//   RESEND_API_KEY  (obligatoria — https://resend.com, plan gratis disponible)
//   EMAIL_FROM      (opcional — remitente verificado, ej: "Talentty <capacitacion@tuempresa.com>")
// Sin RESEND_API_KEY responde 501 y la app usa el fallback mailto: del navegador.

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY no configurada' }), { status: 501 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 })
  }

  const { to, subject, text } = body
  if (!to || !subject || !text) {
    return new Response(JSON.stringify({ error: 'Faltan campos: to, subject, text' }), { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Talentty <onboarding@resend.dev>',
      to: [to],
      subject,
      text,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    return new Response(JSON.stringify({ error: 'El proveedor de email rechazó el envío', detail }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
