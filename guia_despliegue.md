Playbook: desplegar SPA en subdominio <sub>.staging.osprean.net
Ejemplo ejecución: <sub>=drones, <volume>=drones, <repo>=drones-panel, email gomez@usal.es.

Arquitectura
SPA estática servida por nginx de comacon_web_backend. Assets en volumen host. Deploy vía GitHub Actions self-hosted runner (o manual build + scp en su defecto).

Variables a sustituir
<sub> — subdominio (drones)
<repo> — nombre repo GitHub
<volume> — dir en /home/osprean/.volumes/<volume>
1. DNS
Registro A: <sub>.staging.osprean.net → 68.221.160.100 (misma IP que staging). TTL 300.

Verifica propagación antes de seguir:


dig +short <sub>.staging.osprean.net @8.8.8.8
2. Certificado TLS
IMPORTANTE: cert existente cer3.cer es wildcard *.osprean.net — NO cubre subdominios de segundo nivel. Hay que sacar cert Let's Encrypt por cada subdominio bajo staging.osprean.net.

En server:


cd /home/osprean/comacon_web_backend && \
docker-compose stop nginx && \
sudo docker run --rm -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d <sub>.staging.osprean.net \
  --email gomez@usal.es --agree-tos --no-eff-email --non-interactive && \
docker-compose start nginx
Quedan en:


/etc/letsencrypt/live/<sub>.staging.osprean.net/fullchain.pem
/etc/letsencrypt/live/<sub>.staging.osprean.net/privkey.pem
Dura 90 días. Renovación automática pendiente de configurar (tarea separada).

3. Volumen server

mkdir -p /home/osprean/.volumes/<volume>
sudo chown -R osprean:osprean /home/osprean/.volumes/<volume>
sudo chmod -R u+rwX /home/osprean/.volumes/<volume>
4. Repo SPA
4.1 Vite (o framework) raíz

// vite.config.ts
export default defineConfig({
  base: '/',
  plugins: [react()],
})
Router sin basename:


<BrowserRouter>
NO Dockerfile, NO docker-compose, NO nginx dentro del repo. Eso lo pone el backend.

4.2 API client CSRF (si hay auth)
Copiar patrón de admin-panel/src/api/client.ts:

credentials: 'include' en fetch
Lee cookie csrf_access_token, manda header X-CSRF-TOKEN
4.3 Workflow .github/workflows/deploy.yml

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
Secret BACKEND_DISPATCH_TOKEN en settings del repo (PAT con scope repo, mismo token que otros frontends).

Sin workflow / manual: build local, scp al server, rsync a volumen. El workflow backend se triggea igual si dispatch manual.

5. Repo comacon_web_backend (branch staging)
5.1 nginx/nginx.conf.template
Añadir subdominio al redirect 80→443 y nuevo server block 443:


server {
  listen 80;
  server_name ${NGINX_HOST} admin.${NGINX_HOST} <sub>.${NGINX_HOST};
  return 301 https://$host$request_uri;
}

# ... resto sin tocar ...

server {
  listen 443 ssl;
  ssl_certificate     /etc/letsencrypt/live/<sub>.staging.osprean.net/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/<sub>.staging.osprean.net/privkey.pem;
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
5.2 docker-compose.yaml
Servicio nginx, añadir mount volumen (mount /etc/letsencrypt ya existe desde admin):


nginx:
  volumes:
    - ./nginx/nginx.conf.template:/etc/nginx/nginx.conf.template:ro
    - ./nginx/cer3.cer:/etc/nginx/ssl/certificate.cer:ro
    - ./nginx/certificate.key:/etc/nginx/ssl/certificate.key:ro
    - /home/osprean/.volumes/admin:/var/www/admin:ro
    - /home/osprean/.volumes/<volume>:/var/www/<volume>:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro
5.3 CORS (si SPA llama API)
flask/config/staging.py:


CORS_ALLOWED_ORIGINS = [
    PUBLIC_BASE_URL,
    "https://admin.staging.osprean.net",
    "https://<sub>.staging.osprean.net",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
Cookies JWT ya OK: JWT_COOKIE_DOMAIN=".osprean.net" cubre todo. SameSite=None+Secure set en flask/web/__init__.py. No tocar.

6. Orden de ejecución
DNS creado, propagado (dig +short <sub>.staging.osprean.net @8.8.8.8 devuelve IP).
Cert LE en server (comando sección 2). Nginx se para 20s durante challenge.
mkdir volumen server con permisos.
Secret BACKEND_DISPATCH_TOKEN en repo SPA nuevo.
Push SPA a main → workflow builds + copia a volumen. Verifica:

ls /home/osprean/.volumes/<volume>/
# assets/ index.html
Commit backend (nginx + compose + CORS) branch staging → deploy automático reinicia nginx.
Verifica:

curl -sk https://<sub>.staging.osprean.net/ | head -5
# <!doctype html>... <div id="root">
Navegador: login + fetch funciona cross-subdomain.
7. Anti-patrones
NO wildcard server_name *.${NGINX_HOST} en bloque main — nuevo server específico lo reemplaza.
NO Dockerfile en repo SPA. Cero containers para frontend.
NO compartir network Docker entre compose projects.
NO cookies sin punto: .osprean.net ≠ osprean.net.
NO HSTS includeSubDomains; preload antes de tener cert válido (cert malo + HSTS = browser bloquea permanente hasta chrome://net-internals/#hsts delete).
NO asumir cert existente cubre subdominios de 2º nivel: *.osprean.net NO cubre <sub>.staging.osprean.net.
8. Ficheros referencia
admin-panel/.github/workflows/deploy.yml
admin-panel/vite.config.ts
admin-panel/src/api/client.ts
comacon_web_backend/nginx/nginx.conf.template
comacon_web_backend/docker-compose.yaml
comacon_web_backend/flask/config/staging.py
comacon_web_backend/flask/web/__init__.py