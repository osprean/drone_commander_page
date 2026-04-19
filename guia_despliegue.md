Playbook: desplegar SPA nueva en subdominio con backend comacon_web_backend
Arquitectura destino: SPA estática servida por nginx del backend en <sub>.staging.osprean.net, assets en volumen host, deploy vía GitHub Actions self-hosted runner.

Variables a sustituir
<sub> — subdominio (ej. foo)
<repo> — nombre repo GitHub (ej. foo-panel)
<volume> — nombre dir volumen (ej. foo)
<framework> — Vite/Next/CRA (asume Vite aquí)
1. DNS
Registro A: <sub>.staging.osprean.net → IP de staging.osprean.net (68.221.160.100 hoy). TTL 300 inicio.
Cert SSL ya cubierto por wildcard *.staging.osprean.net en comacon_web_backend/nginx/cer3.cer. Sin coste.

2. Repo SPA
Configura Vite (o framework) para servir desde raíz:


// vite.config.ts
export default defineConfig({
  base: '/',
  plugins: [react()],
})
Router sin basename:


<BrowserRouter>
Sin Dockerfile, sin docker-compose, sin nginx local. Todo eso lo pone el backend.

Workflow .github/workflows/deploy.yml:


name: Build <repo> Static Files
on:
  push:
    branches: [main]
  workflow_dispatch:
jobs:
  build:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_BASE_URL: https://staging.osprean.net/
      - run: |
          mkdir -p /home/osprean/.volumes/<volume>
          rm -rf /home/osprean/.volumes/<volume>/*
          cp -r dist/* /home/osprean/.volumes/<volume>/
      - run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.BACKEND_DISPATCH_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/osprean/comacon_web_backend/dispatches \
            -d '{"event_type": "frontend-updated"}'
Secret BACKEND_DISPATCH_TOKEN en settings del repo (mismo PAT que otros frontends).

3. Servidor (una vez)

mkdir -p /home/osprean/.volumes/<volume>
sudo chown -R osprean:osprean /home/osprean/.volumes/<volume>
sudo chmod -R u+rwX /home/osprean/.volumes/<volume>
4. Repo comacon_web_backend (branch staging)
4.1 nginx/nginx.conf.template
Añadir <sub> al redirect 80→443 y nuevo server block 443:


# redirect block
server {
  listen 80;
  server_name ${NGINX_HOST} admin.${NGINX_HOST} <sub>.${NGINX_HOST};
  return 301 https://$host$request_uri;
}

# nuevo vhost estático
server {
  listen 443 ssl;
  ssl_certificate     /etc/nginx/ssl/certificate.cer;
  ssl_certificate_key /etc/nginx/ssl/certificate.key;
  server_name <sub>.${NGINX_HOST};

  root /var/www/<volume>;
  index index.html;

  add_header X-Frame-Options           "DENY"                                     always;
  add_header X-Content-Type-Options    "nosniff"                                  always;
  add_header Referrer-Policy           "strict-origin-when-cross-origin"          always;
  add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
  server_tokens off;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
  gzip_vary on;
  gzip_min_length 256;

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~ /\. {
    deny all;
    return 404;
  }
}
4.2 docker-compose.yaml
Mount read-only en servicio nginx:


nginx:
  volumes:
    - ./nginx/nginx.conf.template:/etc/nginx/nginx.conf.template:ro
    - ./nginx/cer3.cer:/etc/nginx/ssl/certificate.cer:ro
    - ./nginx/certificate.key:/etc/nginx/ssl/certificate.key:ro
    - /home/osprean/.volumes/admin:/var/www/admin:ro
    - /home/osprean/.volumes/<volume>:/var/www/<volume>:ro
4.3 CORS y cookies (si SPA llama a API)
Editar flask/config/staging.py:


CORS_ALLOWED_ORIGINS = [
    PUBLIC_BASE_URL,
    "https://admin.staging.osprean.net",
    "https://<sub>.staging.osprean.net",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
JWT_COOKIE_DOMAIN=".osprean.net" ya cubre todos los subdominios — no tocar.

flask/web/__init__.py ya tiene SameSite=None, Secure=True, supports_credentials=True. No tocar.

SPA cliente HTTP debe:

credentials: 'include'
Leer cookie csrf_access_token, mandar como header X-CSRF-TOKEN
Ejemplo funcional: admin-panel/src/api/client.ts
El workflow backend deploy.yml (trigger repository_dispatch: frontend-updated) reinicia nginx → coge el nuevo mount y vhost.

5. Orden de ejecución
Crear DNS, esperar propagación (dig +short <sub>.staging.osprean.net @8.8.8.8).
mkdir volumen en servidor con permisos correctos.
Secret BACKEND_DISPATCH_TOKEN en repo nuevo.
Push repo SPA a main → workflow builds + copia a volumen.
Verificar ls /home/osprean/.volumes/<volume>/ muestra assets/ index.html.
Commit backend (nginx template + compose + CORS) a branch staging → deploy automático reinicia nginx.
Verificar: curl -sk https://<sub>.staging.osprean.net/ | head -5 devuelve HTML con <div id="root">.
Browser: abrir, login, ver que fetch + cookies cross-subdomain funcionan.
6. Anti-patrones prohibidos
NO crear container Docker para la SPA. Migración de admin-panel se hizo por coupling Docker network. Repetir rompe esto.
NO compartir comacon_web_backend_default network con otro compose project.
NO proxy /sub/ desde nginx principal. Usar subdominio.
NO cookies sin punto en dominio (osprean.net ≠ .osprean.net).
NO hardcodear origen CORS sin añadir supports_credentials y SameSite=None.
7. Ficheros referencia
admin-panel/.github/workflows/deploy.yml
admin-panel/vite.config.ts (base /)
admin-panel/src/api/client.ts (CSRF handling)
comacon_web_backend/nginx/nginx.conf.template (server blocks)
comacon_web_backend/docker-compose.yaml (mount)
comacon_web_backend/flask/config/staging.py (CORS)
comacon_web_backend/flask/web/__init__.py (JWT cookie config)