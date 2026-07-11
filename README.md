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

## Backend completo con Supabase + Netlify

Sin configurar nada, la app funciona en **modo demo** (localStorage, sin login). Configurando Supabase se activa el backend completo:

- 🔐 **Autenticación** (Supabase Auth): registro e inicio de sesión con email y contraseña, rutas de `/app` protegidas y cierre de sesión.
- 🏢 **Multi-tenant**: cada usuario/organización tiene su *workspace* propio (`workspaces` + `workspace_members` + `workspace_state`) protegido con Row Level Security — nadie puede ver datos de otro workspace.
- 🔄 **Sincronización**: todos los cambios se guardan automáticamente en la base (debounce ~1s) y se restauran al iniciar sesión desde cualquier dispositivo.
- 📁 **Storage**: subida real de archivos (PDFs, imágenes) al bucket `archivos` desde los formularios de cursos y seminarios.
- ✉️ **Emails**: la Netlify Function `send-assessment` envía las evaluaciones por correo vía [Resend](https://resend.com); sin configurar, se usa el cliente de correo del navegador.

### Pasos (10 minutos)

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: pegá y ejecutá [`supabase/schema.sql`](supabase/schema.sql) (crea tablas, trigger de membresía, políticas RLS y el bucket de Storage).
3. **Project Settings → API**: copiá la *Project URL* y la *anon public key*.
4. En Netlify: **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon key
   - `RESEND_API_KEY` = API key de Resend *(opcional, para emails reales)*
   - `EMAIL_FROM` = remitente verificado *(opcional)*
5. **Deploys → Trigger deploy**. Listo: la landing lleva a `/login`, al registrarte se crea tu workspace automáticamente, y **Configuración → Backend** muestra "Conectado a Supabase" con tu sesión.

Para desarrollo local: copiá `.env.example` a `.env` y completá las variables (`npm run dev`).

> Nota: en Supabase → **Authentication → Providers → Email** podés desactivar "Confirm email" para que el registro entre directo sin verificación (útil en pruebas).
