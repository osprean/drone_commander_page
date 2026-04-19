# drone_commander_page

SPA Chakra + Vite para operar drones `dron_vigilancia` contra `comacon_web_backend`.

## Dev

```bash
npm install
npm run dev         # vite dev server con proxy a VITE_API_TARGET (default http://localhost:5000)
```

Variables `.env`:

- `VITE_API_BASE_URL` — URL absoluta del backend en build (prod). Default prod: `https://staging.osprean.net/`
- `VITE_API_TARGET` — destino del proxy en dev. Default `http://localhost:5000`

## Build

```bash
npm run build
```

Genera `dist/` estático. No Dockerfile.

## Deploy

`.github/workflows/deploy.yml` en branch `main` → runner self-hosted copia `dist/` a
`/home/osprean/.volumes/drones/` y dispara `repository_dispatch` al backend para
recargar nginx. Backend expone `drones.staging.osprean.net` vía vhost en
`comacon_web_backend/nginx/nginx.conf.template` con mount de ese volumen.

Ver `guia_despliegue.md` para el playbook completo (DNS, nginx, CORS).

## Arquitectura

- **Auth**: cookies JWT (`access_token_cookie`) + CSRF (`csrf_access_token` → `X-CSRF-TOKEN`) cross-subdomain `.osprean.net`.
- **Flota**: `GET /api/resources/org` filtrado a `kind === 'dron_vigilancia'` y matching user_id/organization_id.
- **C&C**: socket.io (`drone:subscribe`) para telemetría en tiempo real; REST `/api/drones/:id/...` para comandos. Sin MQTT en cliente.
