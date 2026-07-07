# Talentty

Plataforma edtech para el **upskilling y la gestión de talento**: landing page pública + SaaS con panel lateral.

## Qué incluye

- **Landing** (`/`): hero, features, cómo funciona, integraciones Zoom/Meet, testimonios, precios y CTA.
- **SaaS** (`/app`) con panel lateral y CRUD completo:
  - **Dashboard**: métricas de talento, cursos, inscripciones y planes.
  - **Talento**: alta/edición/baja de profesionales con skills, seniority y estado.
  - **Cursos**: creación de cursos con módulos, categoría, nivel, modalidad y estado de publicación.
  - **Seminarios**: programación de sesiones en vivo vinculadas con **Zoom** o **Google Meet** (validación de enlace, gestión de asistentes, botón "Unirse").
  - **Planes de carrera**: rutas de crecimiento con hitos, cursos asociados y progreso.
  - **Capacitación anual**: planes anuales de capacitación alineados a marcos normativos configurables (ANMAT, INAME, BPF/GMP, ISO 9001…), asignación de funciones con capacitaciones requeridas por puesto, listado de procedimientos/POEs y cursos con frecuencia, mes y estado, y evaluaciones de eficacia con envío por correo y registro de resultados.
  - **Entrenador**: alta de cursos y seminarios por formador con catálogo y métricas propias.
  - **Desempeño**: evaluaciones de desempeño/potencial con matriz 9-box.
  - **Calendario**: agenda mensual con exportación a Google Calendar y descarga .ics.
  - **Seguimiento**: inscripciones a cursos con porcentaje de avance y estado.
  - **Configuración**: exportación de datos y restauración de demo.

Los datos se guardan en `localStorage` y, si está configurado, se sincronizan automáticamente con **Supabase** (ver más abajo).

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve el build
```

## Deploy en Netlify (conectado a GitHub)

El repo ya incluye `netlify.toml` con el build command, el directorio de publicación y la regla de redirect para la SPA.

1. Entrá a [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Elegí **GitHub** y autorizá el acceso al repositorio `talentty`.
3. Netlify detecta la configuración automáticamente desde `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Hacé clic en **Deploy site**. Cada push a la rama conectada redeploya automáticamente.

> La regla de redirect `/* → /index.html` es necesaria para que las rutas del SaaS (`/app/...`) funcionen al recargar la página.

## Backend con Supabase (opcional)

Sin configurar nada, la app funciona en **modo local** (localStorage). Para persistencia real multi-dispositivo:

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. En el dashboard del proyecto: **SQL Editor → New query**, pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo (crea la tabla `workspace_state` con sus políticas).
3. En **Project Settings → API** copiá la *Project URL* y la *anon public key*.
4. En Netlify: **Site configuration → Environment variables**, agregá:
   - `VITE_SUPABASE_URL` = la Project URL
   - `VITE_SUPABASE_ANON_KEY` = la anon key
   - `VITE_TALENTTY_WORKSPACE` = un identificador (opcional, default `default`)
5. Redeployá el sitio (**Deploys → Trigger deploy**). En la app, **Configuración → Backend** muestra "Conectado a Supabase".

Para desarrollo local, copiá `.env.example` a `.env` y completá las variables.

> ⚠️ Las políticas RLS incluidas son de demo (lectura/escritura con la anon key). Para producción multi-cliente, migrar a Supabase Auth con políticas por usuario/tenant.
