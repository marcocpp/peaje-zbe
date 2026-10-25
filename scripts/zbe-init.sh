#!/usr/bin/env bash
# Se ejecuta antes de `npm run dev` (prestart). Crea las identidades de demo
# que falten y escribe en .env (raíz, el que lee `stellar scaffold`) la
# dirección del token USDC:me de la red local, que depende de la cuenta `me`
# de cada máquina. scaffold.yml la lee como ${env.ZBE_USDC_LOCAL} para el
# constructor del Peaje.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env"

for who in me tesoreria arbitro camara lucia pablo ana; do
  if ! stellar keys address "$who" >/dev/null 2>&1; then
    stellar keys generate "$who" >/dev/null 2>&1
    echo "zbe-init: identity '$who' created"
  fi
done

USDC=$(stellar contract id asset --asset "USDC:$(stellar keys address me)" --network local)

touch "$ENV_FILE"
if grep -q '^ZBE_USDC_LOCAL=' "$ENV_FILE"; then
  sed -i.bak "s|^ZBE_USDC_LOCAL=.*|ZBE_USDC_LOCAL=$USDC|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
else
  printf '\n# Local USDC:me token (scripts/zbe-init.sh)\nZBE_USDC_LOCAL=%s\n' "$USDC" >>"$ENV_FILE"
fi
