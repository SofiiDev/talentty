// Exportación del plan anual de capacitación a PDF (vía diálogo de impresión del
// navegador) con formato de documento para presentar ante la autoridad sanitaria,
// incluyendo bloque de firmas: Preparó / Revisó / Autorizó.

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function exportPlanPdf({ plan, frameworks, participants, functionNameById, courseTitleById }) {
  const issued = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const done = plan.items.filter((i) => i.status === 'Completado').length
  const pct = plan.items.length ? Math.round((done / plan.items.length) * 100) : 0

  const itemRows = plan.items
    .map((item, i) => {
      const fns = item.functionIds.length
        ? item.functionIds.map((id) => functionNameById(id)).filter(Boolean).join(', ')
        : 'Todo el personal del plan'
      const course = item.courseId ? courseTitleById(item.courseId) : ''
      return `<tr>
        <td>${i + 1}</td>
        <td class="mono">${esc(item.code || '—')}</td>
        <td>${esc(item.title)}${course ? `<br><span class="muted">Curso: ${esc(course)}</span>` : ''}</td>
        <td>${esc(item.type)}</td>
        <td>${esc(item.frequency)}</td>
        <td>${esc(item.month)}</td>
        <td>${esc(fns)}</td>
        <td>${esc(item.status)}</td>
      </tr>`
    })
    .join('')

  const participantRows = participants
    .map((t, i) => `<tr>
      <td>${i + 1}</td>
      <td>${esc(t.name)}</td>
      <td>${esc(t.role || '—')}</td>
      <td>${esc(t.department || '—')}</td>
      <td class="sign-cell"></td>
    </tr>`)
    .join('')

  const fwList = frameworks
    .map((fw) => `<li><strong>${esc(fw.code)}</strong> — ${esc(fw.name)}</li>`)
    .join('')

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(plan.title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; padding: 32px; }
  @page { size: A4; margin: 14mm; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { font-size: 20px; font-weight: 800; color: #0f766e; }
  .doc-meta { text-align: right; font-size: 10px; color: #444; }
  h1 { font-size: 16px; margin: 12px 0 4px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #0f766e; margin: 18px 0 6px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px; margin-top: 6px; }
  .grid p { font-size: 11px; }
  .grid strong { display: block; font-size: 9px; text-transform: uppercase; color: #666; letter-spacing: .04em; }
  ul { padding-left: 16px; margin-top: 4px; }
  li { margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #bbb; padding: 5px 6px; text-align: left; vertical-align: top; }
  th { background: #f0fdfa; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; }
  .mono { font-family: 'Courier New', monospace; font-size: 10px; }
  .muted { color: #666; font-size: 9px; }
  .sign-cell { width: 110px; }
  .notes { margin-top: 6px; font-size: 10px; color: #333; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; }
  .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; page-break-inside: avoid; }
  .sig { border: 1px solid #999; border-radius: 4px; padding: 10px 12px 14px; }
  .sig h3 { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #0f766e; margin-bottom: 34px; text-align: center; }
  .sig .line { border-top: 1px solid #333; margin-top: 28px; padding-top: 3px; font-size: 9px; color: #555; }
  footer { margin-top: 28px; font-size: 9px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <header>
    <div>
      <div class="brand">talentty</div>
      <div style="font-size:10px;color:#666">Plataforma de gestión de capacitación</div>
    </div>
    <div class="doc-meta">
      <p><strong>Documento:</strong> Plan Anual de Capacitación</p>
      <p><strong>Fecha de emisión:</strong> ${issued}</p>
      <p><strong>Página:</strong> generada para presentación ante autoridad</p>
    </div>
  </header>

  <h1>${esc(plan.title)}</h1>

  <div class="grid">
    <p><strong>Año</strong> ${esc(plan.year)}</p>
    <p><strong>Área alcanzada</strong> ${esc(plan.area || '—')}</p>
    <p><strong>Responsable</strong> ${esc(plan.responsible || '—')}</p>
    <p><strong>Estado</strong> ${esc(plan.status)}</p>
    <p><strong>Capacitaciones</strong> ${plan.items.length}</p>
    <p><strong>Cumplimiento</strong> ${pct}% (${done}/${plan.items.length} completadas)</p>
  </div>

  ${frameworks.length ? `<h2>Marcos normativos aplicables</h2><ul>${fwList}</ul>` : ''}

  <h2>Cronograma de capacitaciones</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Código</th><th>Capacitación</th><th>Tipo</th><th>Frecuencia</th><th>Mes</th><th>Funciones alcanzadas</th><th>Estado</th></tr>
    </thead>
    <tbody>${itemRows || '<tr><td colspan="8">Sin capacitaciones cargadas</td></tr>'}</tbody>
  </table>

  <h2>Personal incluido en el plan</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Nombre y apellido</th><th>Puesto</th><th>Área</th><th>Firma</th></tr>
    </thead>
    <tbody>${participantRows || '<tr><td colspan="5">Sin personal asignado</td></tr>'}</tbody>
  </table>

  ${plan.notes ? `<h2>Observaciones</h2><div class="notes">${esc(plan.notes)}</div>` : ''}

  <div class="signatures">
    <div class="sig">
      <h3>Preparó</h3>
      <div class="line">Firma</div>
      <div class="line">Aclaración y cargo</div>
      <div class="line">Fecha</div>
    </div>
    <div class="sig">
      <h3>Revisó</h3>
      <div class="line">Firma</div>
      <div class="line">Aclaración y cargo</div>
      <div class="line">Fecha</div>
    </div>
    <div class="sig">
      <h3>Autorizó</h3>
      <div class="line">Firma</div>
      <div class="line">Aclaración y cargo</div>
      <div class="line">Fecha</div>
    </div>
  </div>

  <footer>Documento generado con Talentty · ${esc(plan.title)} · Emitido el ${issued}</footer>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 300))</script>
</body>
</html>`

  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  return true
}
