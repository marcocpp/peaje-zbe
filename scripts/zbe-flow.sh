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
  echo "  Lucía pass:  $(invoke "$PEAJE" me balance --owner "$LUCIA")"
  echo "  treasury:    $(invoke "$USDC" me balance --id "$(addr tesoreria)")"
  echo "  collected:   $(invoke "$PEAJE" me collected)"
}

entry() {
  echo "→ Car $1 enters" >&2
  invoke "$PEAJE" camara report_entry --camera "$(addr camara)" \
    --plate_hash "$(plate_hash "$1")" --zone_id centro
}

echo "→ Lucía tops up 20 USDC"
invoke "$PEAJE" lucia deposit --owner "$LUCIA" --amount $((20 * USDC_UNIT)) >/dev/null
show

echo "  result: $(entry 1111BCD)"   # Eco: null
ID=$(entry 2222BCD)                    # B con bono: id del cargo
echo "  result: charge $ID"
echo "  result: $(entry 3333BCD)"   # B sin bono: null + evento no_bono
show

CHARGE=$(invoke "$PEAJE" me get_charge --charge_id "$ID")
STATUS=$(jq -r .status <<<"$CHARGE")
if [ "$STATUS" != "Pending" ]; then
  echo "ℹ️  Today's charge $ID is already $STATUS (one per vehicle, zone and day). Reset the local network to run the demo again."
  exit 0
fi

WAIT=$(( $(jq -r .deadline <<<"$CHARGE") - $(date +%s) + 2 ))
if [ "$WAIT" -gt 0 ]; then
  echo "→ settle before the deadline (must fail with Error(Contract, #10) AppealWindowOpen)"
  if invoke "$PEAJE" me settle --charge_id "$ID" >/dev/null; then
    echo "❌ charge was collected too early" >&2; exit 1
  fi
  echo "  rejected ✅"
  echo "→ Waiting ${WAIT}s for the appeal window..."
  sleep "$WAIT"
fi
invoke "$PEAJE" me settle --charge_id "$ID" >/dev/null
echo "  $(invoke "$PEAJE" me get_charge --charge_id "$ID" | jq -c '{id,status,amount}')"
show

echo "✅ Full flow completed"
