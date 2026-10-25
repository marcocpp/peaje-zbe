#!/usr/bin/env bash
# Genera app/dist apuntando a testnet y deja los clientes locales como estaban,
# para que `npm run dev` siga usando la red local.
#
# OJO: app/dist incluye las claves de demo de app/.env.local (cámara, árbitro,
# ayuntamiento...). Son cuentas de testnet sin valor, pero quien abra la web
# puede firmar como ellas. No publicar dist como si fuera un sistema real.
source "$(dirname "$0")/zbe-common.sh"

BACKUP=$(mktemp -d)
cp -r "$ROOT/app-lib/clients/." "$BACKUP/"
restore() {
  rm -rf "$ROOT/app-lib/clients"
  mkdir -p "$ROOT/app-lib/clients"
  cp -r "$BACKUP/." "$ROOT/app-lib/clients/"
  rm -rf "$BACKUP"
  git -C "$ROOT" checkout -- package-lock.json 2>/dev/null || true
}
trap restore EXIT

echo "→ Contract clients for testnet"
(cd "$ROOT" && STELLAR_NETWORK=testnet stellar scaffold build --quiet)
echo "→ Building the web app"
(cd "$ROOT/app" && npm run build --silent)
echo "✅ app/dist ready for testnet (serve it with: cd app && npx vite preview)"
