#!/usr/bin/env bash
# Reinicia la demo de testnet: despliega instancias NUEVAS de Etiqueta y Peaje
# con los Wasm ya publicados en Registry (no se vuelve a publicar, que es lo
# caro), apunta los nombres de Registry a ellas, cambia los IDs en scaffold.yml
# y la documentación, y vuelve a cargar los datos de demo con zbe-setup.sh.
#
# Los contratos viejos (cargos, bonos) se quedan en la red, pero ya nadie los usa.
# Después hay que volver a publicar la web: scripts/zbe-deploy-vercel.sh
#
#   scripts/zbe-reset-testnet.sh
STELLAR_NETWORK=testnet
source "$(dirname "$0")/zbe-common.sh"

OLD_ETIQUETA=$(contract_id etiqueta)
OLD_PEAJE=$(contract_id peaje)
USDC=$(stellar contract id asset --asset "$(usdc_asset)" --network "$NETWORK")

wasm_hash() {
  stellar registry fetch-hash "unverified/zbe-$1-$ZBE_TEAM" \
    --source-account me --network "$NETWORK" | tail -1
}

echo "→ New Etiqueta instance"
ETIQUETA=$(stellar contract deploy --wasm-hash "$(wasm_hash etiqueta)" \
  --source me --network "$NETWORK" -- --admin me | tail -1)
echo "  $ETIQUETA"

echo "→ New Peaje instance"
PEAJE=$(stellar contract deploy --wasm-hash "$(wasm_hash peaje)" \
  --source me --network "$NETWORK" -- --admin me --token "$USDC" \
  --treasury tesoreria --arbiter arbitro | tail -1)
echo "  $PEAJE"

echo "→ Registry names point to the new instances"
stellar registry update-contract-address --contract-name "unverified/zbe-etiqueta-$ZBE_TEAM" \
  --new-address "$ETIQUETA" --source-account me --network "$NETWORK" >/dev/null
stellar registry update-contract-address --contract-name "unverified/zbe-peaje-$ZBE_TEAM" \
  --new-address "$PEAJE" --source-account me --network "$NETWORK" >/dev/null

echo "→ New IDs in scaffold.yml, README.md and CLAUDE.md"
for f in scaffold.yml README.md CLAUDE.md; do
  sed -i "s/$OLD_ETIQUETA/$ETIQUETA/g; s/$OLD_PEAJE/$PEAJE/g" "$ROOT/$f"
done

echo "→ Demo data"
STELLAR_NETWORK=testnet "$(dirname "$0")/zbe-setup.sh"

echo "✅ Testnet reset. Etiqueta=$ETIQUETA Peaje=$PEAJE"
echo "   Next: scripts/zbe-deploy-vercel.sh, then commit the new IDs"
