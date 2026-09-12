#!/usr/bin/env bash
# Deploy one build on the box. Copied to /opt/makitii/deploy.sh by deploy.yml and run as
#   SHA=<sha> OWNER=<ghcr owner> ACTOR=<gh user> GH_TOKEN=<token> bash /opt/makitii/deploy.sh
# A file, not a stdin script: `docker compose exec|run` read stdin and would swallow the rest.
set -euo pipefail
: "${SHA:?SHA}" "${OWNER:?OWNER}" "${ACTOR:?ACTOR}" "${GH_TOKEN:?GH_TOKEN}"
cd /opt/makitii

echo "$GH_TOKEN" | docker login ghcr.io -u "$ACTOR" --password-stdin

sed -i -E "s|^VERSION=.*|VERSION=${SHA}|" .env
grep -q "^GHCR_OWNER=" .env || echo "GHCR_OWNER=${OWNER}" >> .env

docker compose pull app </dev/null
docker compose up -d </dev/null
docker image prune -af </dev/null

image=$(docker compose ps --format '{{.Image}}' app </dev/null)
case "$image" in
  *"${SHA}"*) echo "app runs $image" ;;
  *) echo "ERROR: app still runs $image, expected ${SHA}"; exit 1 ;;
esac
