# Progreso

## 2026-10-25 — Revisión y rediseño

### Fallos corregidos

- **Contratos:** una zona por la que solo pasan coches permitidos no se escribía
  nunca y caducaba a los 7 días; cada entrada pagaba entonces la restauración
  automática. `report_entry` renueva zona, cámara e instancia, y `Etiqueta.get`
  renueva su instancia. Test nuevo `daily_entries_keep_zone_and_camera_alive`
  (falla sin la corrección). El plazo usa `saturating_add`.
- **Web:** `parseUsdc` aceptaba `-5.5` (daba -4.5) y fallaba con `1e3`; ahora
  valida y da un mensaje claro. "Collect all due" anidaba acciones. La ventana
  de alegación valida enteros. Revocar etiqueta pide confirmación. La caché de
  la dirección del token ya no guarda un error.
- **Optimización:** el panel lee solo los 100 cargos más recientes; los hashes
  HMAC de matrículas se calculan una vez en lugar de cada 3 s.
- **Entorno:** `zbe-env.sh` escribía `.env.local` en varias pasadas, Vite se
  reiniciaba varias veces y dejaba servidores huérfanos saltando de puerto (5173
  → 5174 → …) con la página en blanco. Ahora escribe de una vez y solo si
  cambia.

### Rediseño

- Sistema "señalización vial sobria": ver `app/PRODUCT.md` y
  `app/.impeccable/surfaces/src-app-tsx.md`.
- Portada nueva con guía de 3 pasos en el orden real de la demo.
- Móvil: navegación en fila desplazable y tablas en fichas; sin scroll
  horizontal en ninguna vista (medido a 390 px).
- Tipografía Overpass alojada en el proyecto; fuera Google Fonts.

### Verificado

- `cargo test`: 6 + 13 tests en verde.
- `tsc`, `eslint`, `prettier --check`: limpios.
- e2e (`smoke.spec.ts`): 4/4.
- `npm run build`: correcto.
- Flujo en la web (móvil): recargar bono → coche entra → 5 USDC bloqueados →
  alegar → el árbitro anula → saldo devuelto. Emitir etiqueta nueva desde DGT →
  cargo pendiente con cuenta atrás.

- Revisión de diseño independiente (Impeccable): 7 correcciones aplicadas,
  veredicto final "ship". Sistema documentado en `app/DESIGN.md`.

### Pendiente

- Testnet sigue en v1.0.1 (ver PLAN.md).

## 2026-10-26 — Vídeo de demo (Remotion)

- Proyecto Remotion en `video/` (guion en `video/GUION.md`, textos en
  `video/src/contenido.ts`). Render en `video/out/demo.mp4` (versionado), con
  locución sintética de los subtítulos (`video/scripts/generar-voz.mjs`).
- Capturas reales en testnet con `video/scripts/capturar.mjs`. Los contratos de
  testnet v1.0.1 los administra otra cuenta `me` del equipo (admin `GBT7…`), así
  que para grabar se desplegó una copia propia con las claves de esta máquina,
  sin Registry: Etiqueta
  `CD5JL5TEAH2D2UV6RGT4MQL4R43B3ESQ7KX4VKZEKY2JCIRGIWVBI5QQ`, Peaje
  `CBVQ4A2P662QNLTL6SZMZUIXK6WALFHL5S7AJXYAG7HY4WIBRJWW5BX7`, USDC
  `CBW6MJUKV5QIR36FQRIDENIWJASM7FZKSQBZDAYHBYCEIPOUOPMPFC6C`.
- Transacciones del vídeo en stellar.expert: `settle`
  `0ae839f2b8e0fc7d0367af5bc4592a39d179cc97989c49eec948e0ef21d18369`,
  `report_entry`
  `23acc223bd3d287ef62287ff48a931edf1290cd5601b444871ff852e16bd1ae7`.
