#!/usr/bin/env bash
# Deja la red lista para la demo: token USDC, Peaje enlazado con Etiqueta, zona
# "centro", cámara autorizada, etiquetas de las tres matrículas y USDC para los
# conductores. Se puede repetir sin romper nada.
#
#   scripts/zbe-setup.sh            # cuentas de demo (lucia, pablo, ana)
#   DRIVER=G... scripts/zbe-setup.sh  # además da 50 USDC a tu wallet de Freighter
source "$(dirname "$0")/zbe-common.sh"

ETIQUETA=$(contract_id etiqueta)
PEAJE=$(contract_id peaje)
ASSET=$(usdc_asset)

echo "→ Token $ASSET"
USDC=$(stellar contract id asset --asset "$ASSET" --network "$NETWORK")
stellar contract asset deploy --asset "$ASSET" --source me --network "$NETWORK" >/dev/null 2>&1 \
  || echo "  (already deployed)"
TOKEN=$(invoke "$PEAJE" me get_config | jq -r .token)
if [ "$TOKEN" != "$USDC" ]; then
  echo "❌ Peaje was deployed with token $TOKEN but your USDC is $USDC. Restart npm run dev (it runs scripts/zbe-init.sh) and, if it persists, run stellar scaffold clean first" >&2
  exit 1
fi

echo "→ Toll: link label contract, zone centro (Zero and Eco, 5 USDC, 60 s), camera"
invoke "$PEAJE" me set_etiqueta --etiqueta "$ETIQUETA" >/dev/null
invoke "$PEAJE" me set_zone --zone_id centro --min_category 3 \
  --fee $((5 * USDC_UNIT)) --appeal_secs 60 >/dev/null
invoke "$PEAJE" me add_camera --camera "$(addr camara)" >/dev/null

# Las cuentas G necesitan trustline para tener USDC; el contrato Peaje no
trust_and_mint() {
  local who="$1" amount="$2"
  stellar tx new change-trust --quiet --source "$who" --line "$ASSET" --network "$NETWORK" >/dev/null
  if [ "$amount" -gt 0 ]; then
    invoke "$USDC" me mint --to "$(addr "$who")" --amount $((amount * USDC_UNIT)) >/dev/null
  fi
}

echo "→ Trustlines and test USDC"
trust_and_mint tesoreria 0
for who in lucia pablo ana; do
  balance=$(invoke "$USDC" me balance --id "$(addr "$who")" 2>/dev/null | tr -d '"' || echo 0)
  if [ "${balance:-0}" -lt $((20 * USDC_UNIT)) ]; then trust_and_mint "$who" 20; else trust_and_mint "$who" 0; fi
done

echo "→ DGT labels"
for entry in "${DEMO_PLATES[@]}"; do
  read -r plate owner category <<<"$entry"
  if invoke "$ETIQUETA" me issue --plate_hash "$(plate_hash "$plate")" \
    --owner "$(addr "$owner")" --category "$category" >/dev/null 2>&1; then
    echo "  $plate → $owner (category $category)"
  else
    echo "  $plate already issued"
  fi
done

if [ -n "${DRIVER:-}" ]; then
  echo "→ 50 USDC for $DRIVER (needs a trustline to $ASSET in Freighter)"
  invoke "$USDC" me mint --to "$DRIVER" --amount $((50 * USDC_UNIT)) >/dev/null
fi

echo "✅ Done. Etiqueta=$ETIQUETA Peaje=$PEAJE USDC=$USDC"

echo "→ Demo keys for the frontend"
"$(dirname "$0")/zbe-env.sh"
