#!/usr/bin/env bash
# Publica la web de testnet en Vercel (https://zbe-toll.vercel.app). No se
# compila en Vercel: los clientes necesitan el CLI de stellar y las claves de
# demo están en app/.env.local, así que se sube app/dist ya compilado.
#
# Necesita haber iniciado sesión una vez: npx vercel@65.2.0 login
#
#   scripts/zbe-deploy-vercel.sh
source "$(dirname "$0")/zbe-common.sh"

# Proyecto zbe-toll en Vercel (identificadores, no secretos)
VERCEL_ORG_ID="${VERCEL_ORG_ID:-team_N8wPZiCWrknPY9eIAF7Dg8pO}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-prj_D0X4VKjAEAQjNLh3vwDxstSg4UGZ}"

"$(dirname "$0")/zbe-build-testnet.sh"

OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT
cp -r "$ROOT/app/dist/." "$OUT/"
mkdir -p "$OUT/.vercel"
printf '{"orgId":"%s","projectId":"%s"}\n' "$VERCEL_ORG_ID" "$VERCEL_PROJECT_ID" \
  >"$OUT/.vercel/project.json"
# Sitio estático ya compilado; todas las rutas sirven index.html (React Router)
cat >"$OUT/vercel.json" <<'EOF'
{
  "framework": null,
  "installCommand": "",
  "buildCommand": "",
  "outputDirectory": ".",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
EOF

echo "→ Deploying to Vercel"
(cd "$OUT" && npx --yes vercel@65.2.0 deploy --prod --yes)
echo "✅ https://zbe-toll.vercel.app updated"
