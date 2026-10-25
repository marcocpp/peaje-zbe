# Funciones compartidas por los scripts de la demo ZBE. Se carga con `source`.
set -euo pipefail

NETWORK="${STELLAR_NETWORK:-local}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE="$ROOT/.scaffold/state.json"
# Clave HMAC de la demo. En producción la custodian las cámaras, nunca el frontend
ZBE_HMAC_KEY="${ZBE_HMAC_KEY:-zbe-demo-key}"
USDC_UNIT=10000000 # 7 decimales

# Matrículas fijas de la demo: matrícula, titular, categoría (0 SinEtiqueta, 1 B, 2 C, 3 Eco, 4 Cero)
DEMO_PLATES=(
  "1111BCD ana 3"   # Eco: entra gratis
  "2222BCD lucia 1" # B con bono
  "3333BCD pablo 1" # B sin bono
)

contract_id() {
  jq -er --arg n "$NETWORK" --arg c "$1" '.networks[$n].contracts[$c]["contract-id"]' "$STATE" \
    || { echo "❌ '$1' no está desplegado en $NETWORK; ¿está corriendo npm run dev?" >&2; exit 1; }
}

addr() { stellar keys address "$1"; }

plate_hash() {
  printf %s "$1" | openssl dgst -sha256 -hmac "$ZBE_HMAC_KEY" | awk '{print $NF}'
}

usdc_asset() { echo "USDC:$(addr me)"; }

# Llama a un contrato. Solo muestra los logs de la CLI si la llamada falla
invoke() {
  local id="$1" source="$2" log
  shift 2
  log=$(mktemp)
  if ! stellar contract invoke --network "$NETWORK" --source "$source" --id "$id" -- "$@" 2>"$log"; then
    grep -m1 -E "error" "$log" >&2 || cat "$log" >&2
    rm -f "$log"
    return 1
  fi
  rm -f "$log"
}
