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
  - **Seguimiento**: inscripciones a cursos con porcentaje de avance y estado.
  - **Configuración**: exportación de datos y restauración de demo.

Los datos se persisten en `localStorage` del navegador (demo sin backend).

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
