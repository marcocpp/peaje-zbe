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

### Pendiente

- Revisión final de diseño y DESIGN.md.
- Testnet sigue en v1.0.1 (ver PLAN.md).
