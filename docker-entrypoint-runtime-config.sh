#!/bin/sh
# =============================================================================
# Runtime config injection — drone-commander (Path B, post-2026-05-09 incident)
# =============================================================================
# Replaces placeholder string baked into the JS bundle at build time with
# the API_URL env var at startup. Lets ONE image serve both staging and prod.
#
#   Build-time:  --build-arg VITE_API_BASE_URL=__COMACON_RUNTIME_API_URL__
#                (set in .github/workflows/cd-staging-k8s.yml)
#
#   Runtime env: API_URL  (set via Helm values configuration:)
#
# Idempotent.
# =============================================================================
set -e

API_URL_VAL="${API_URL:-}"

if [ -d /usr/share/nginx/html/assets ]; then
  find /usr/share/nginx/html/assets -type f \( -name "*.js" -o -name "*.css" \) -exec \
    sed -i -e "s|__COMACON_RUNTIME_API_URL__|${API_URL_VAL}|g" {} +
fi
