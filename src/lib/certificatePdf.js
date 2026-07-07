// Certificado de finalización de curso, exportable a PDF vía el diálogo
// de impresión del navegador.

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function exportCertificate({ talent, course, completedAt }) {
  const date = completedAt || new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Certificado — ${esc(talent.name)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4 landscape; margin: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; }
  .sheet {
    width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f8fafc; padding: 24px;
  }
  .cert {
    width: 100%; max-width: 960px; background: #fff; border: 3px double #0f766e;
    padding: 56px 64px; text-align: center; position: relative;
  }
  .brand { font-family: Arial, sans-serif; font-weight: 800; font-size: 22px; color: #0f766e; letter-spacing: -0.5px; }
  .sub { font-family: Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #64748b; margin-top: 4px; }
  h1 { font-size: 34px; margin: 36px 0 8px; font-weight: 400; }
  .name { font-size: 40px; font-weight: 700; color: #0f766e; margin: 18px 0 6px; }
  .role { font-family: Arial, sans-serif; font-size: 13px; color: #64748b; }
  .body { font-size: 15px; margin-top: 22px; line-height: 1.6; color: #334155; }
  .course { font-weight: 700; color: #0f172a; }
  .meta { font-family: Arial, sans-serif; font-size: 12px; color: #64748b; margin-top: 10px; }
  .sigs { display: flex; justify-content: space-around; margin-top: 56px; }
  .sig { width: 260px; }
  .sig .line { border-top: 1.5px solid #334155; padding-top: 6px; font-family: Arial, sans-serif; font-size: 11px; color: #475569; }
  .date { font-family: Arial, sans-serif; font-size: 12px; color: #64748b; margin-top: 32px; }
  .seal {
    position: absolute; top: 40px; right: 48px; width: 88px; height: 88px; border-radius: 50%;
    border: 2px solid #0f766e; color: #0f766e; display: flex; align-items: center; justify-content: center;
    font-family: Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; text-align: center; line-height: 1.5;
  }
  @media print { .sheet { background: #fff; padding: 0; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="cert">
      <div class="seal">Curso<br>completado<br>100%</div>
      <div class="brand">talentty</div>
      <div class="sub">Certificado de finalización</div>
      <h1>Se otorga el presente certificado a</h1>
      <div class="name">${esc(talent.name)}</div>
      <div class="role">${esc(talent.role || '')}</div>
      <p class="body">
        por haber completado satisfactoriamente el curso<br>
        <span class="course">“${esc(course.title)}”</span>
      </p>
      <p class="meta">
        Duración: ${esc(course.durationHours)} horas · Modalidad: ${esc(course.modality)} · Nivel: ${esc(course.level)}
      </p>
      <div class="sigs">
        <div class="sig"><div style="height:36px"></div><div class="line">${esc(course.instructor || 'Instructor/a')} — Instructor/a</div></div>
        <div class="sig"><div style="height:36px"></div><div class="line">Responsable de Capacitación</div></div>
      </div>
      <p class="date">Emitido el ${esc(date)} · Documento generado con Talentty</p>
    </div>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 300))</script>
</body>
</html>`

  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  return true
}
