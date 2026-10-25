#!/usr/bin/env bash
# Recorre la demo completa por CLI (ejecutar antes scripts/zbe-setup.sh):
# Lucía recarga 20 USDC, entran los tres coches, se espera el plazo de
# alegación y se cobra.
#
# Ojo: es un cargo por vehículo, zona y día. Si ya hay un cargo de hoy para
# 2222BCD, el script lo reutiliza; para una demo desde cero, reinicia la red
# local (stellar scaffold clean + npm run dev + scripts/zbe-setup.sh).
source "$(dirname "$0")/zbe-common.sh"

PEAJE=$(contract_id peaje)
USDC=$(stellar contract id asset --asset "$(usdc_asset)" --network "$NETWORK")
LUCIA=$(addr lucia)

show() {
  echo "  bono Lucía:  $(invoke "$PEAJE" me balance --owner "$LUCIA")"
  echo "  tesorería:   $(invoke "$USDC" me balance --id "$(addr tesoreria)")"
  echo "  recaudado:   $(invoke "$PEAJE" me collected)"
}

entry() {
  echo "→ Entra $1" >&2
  invoke "$PEAJE" camara report_entry --camera "$(addr camara)" \
    --plate_hash "$(plate_hash "$1")" --zone_id centro
}

echo "→ Lucía recarga 20 USDC"
invoke "$PEAJE" lucia deposit --owner "$LUCIA" --amount $((20 * USDC_UNIT)) >/dev/null
show

echo "  resultado: $(entry 1111BCD)"   # Eco: null
ID=$(entry 2222BCD)                    # B con bono: id del cargo
echo "  resultado: cargo $ID"
echo "  resultado: $(entry 3333BCD)"   # B sin bono: null + evento no_bono
show

CHARGE=$(invoke "$PEAJE" me get_charge --charge_id "$ID")
STATUS=$(jq -r .status <<<"$CHARGE")
if [ "$STATUS" != "Pending" ]; then
  echo "ℹ️  El cargo $ID de hoy ya está $STATUS; reinicia la red local para repetir la demo."
  exit 0
fi

WAIT=$(( $(jq -r .deadline <<<"$CHARGE") - $(date +%s) + 2 ))
if [ "$WAIT" -gt 0 ]; then
  echo "→ settle antes de plazo (debe fallar con Error(Contract, #10) AppealWindowOpen)"
  if invoke "$PEAJE" me settle --charge_id "$ID" >/dev/null; then
    echo "❌ se cobró antes de tiempo" >&2; exit 1
  fi
  echo "  rechazado ✅"
  echo "→ Esperando ${WAIT} s de ventana de alegación..."
  sleep "$WAIT"
fi
invoke "$PEAJE" me settle --charge_id "$ID" >/dev/null
echo "  $(invoke "$PEAJE" me get_charge --charge_id "$ID" | jq -c '{id,status,amount}')"
show

echo "✅ Flujo completo"
