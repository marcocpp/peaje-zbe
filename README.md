# Peaje ZBE en Stellar

**HackMeridian 2026 · track Genesis · equipo IMPEDANCIA UNO**

Peaje automático y **voluntario** para Zonas de Bajas Emisiones (ZBE). La
etiqueta ambiental de cada coche es un token no transferible emitido por la
DGT. Si un coche entra en una zona que su etiqueta no permite y su titular
tiene un **bono ZBE**, el contrato **bloquea** la tarifa, abre un plazo para
**alegar** y solo la cobra si nadie alega. No es una multa automática: el bono
es consentimiento previo, siempre se puede alegar, y quien no tiene bono sigue
el procedimiento ordinario fuera de la cadena.

🎬 Vídeo de la demo: [`docs/demo-respaldo.mp4`](docs/demo-respaldo.mp4)

## Cómo funciona una entrada

1. Una cámara autorizada (oráculo) llama a `report_entry` con el
   **HMAC-SHA256 de la matrícula**, nunca la matrícula en claro.
2. ¿La etiqueta está permitida en la zona? → no pasa nada.
3. No permitida y sin bono o sin saldo → evento `no_bono` (procedimiento
   ordinario). No se cobra nada.
4. No permitida y con bono → la tarifa pasa de saldo **libre** a
   **bloqueado** y empieza el plazo de alegación.
5. Sin alegación, al vencer el plazo cualquiera puede llamar a `settle` y el
   importe va a la tesorería. Con alegación, el cargo queda en disputa y
   **solo un árbitro independiente** puede confirmarlo o anularlo.
6. Un solo cargo por vehículo, zona y día.

## Piezas

| Pieza | Qué es |
|---|---|
| `contracts/etiqueta` | Etiquetas ambientales (Cero, Eco, C, B, Sin etiqueta). Solo la DGT emite, reasigna o retira; el titular no puede transferir. |
| `contracts/peaje` | Zonas, cámaras, bonos (libre/bloqueado), cargos, alegaciones, árbitro y cobro. Consulta a Etiqueta en cada entrada. |
| `app/` | React + Stellar Scaffold. Vistas: Conductor, Cámara, Ayuntamiento, Árbitro y DGT. |
| `scripts/` | Preparar la demo (`zbe-setup.sh`), recorrerla por CLI (`zbe-flow.sh`) y generar la web de testnet (`zbe-build-testnet.sh`). |

Estados de un cargo: `Pending` → `Settled`, o `Pending` → `Disputed` →
`Settled` / `Cancelled`. Eventos: `charge_created`, `appealed`, `settled`,
`cancelled`, `no_bono`.

## Testnet

Publicados con **Stellar Registry**:

| Contrato | Nombre | ID |
|---|---|---|
| Etiqueta | `unverified/zbe-etiqueta-impedancia-uno` | `CB2C4XY6HLRDE7BOZ7QH5DFST34SGDY5LVI6WA7T4X3EGXK65SO3AYSD` |
| Peaje | `unverified/zbe-peaje-impedancia-uno` | `CCM6PGBSXY33ISEAWJPH2RQV2PUOLVNWKAJ37EOGJRKTIE6JF7GP3LVI` |
| USDC de prueba (SAC) | — | `CDB4ZZLUZQGVU6QIPVOFAUNXQFHRTMQ4NKZSIHAPT6Z3PTMM2UXB6XI2` |

Zona de la demo: `centro`, admite Cero y Eco, 5 USDC/día, 60 s para alegar.

## Ejecutar en local

Requisitos: Rust (target `wasm32v1-none`), Stellar CLI con los plugins
`scaffold` y `registry`, Node.js y Docker.

```bash
npm install
npm run dev                 # red local + contratos + web en http://localhost:5173
scripts/zbe-setup.sh        # en otra terminal: datos de demo y claves del frontend
```

Conecta Freighter a la red local (RPC `http://localhost:8000/rpc`, passphrase
`Standalone Network ; February 2017`) si quieres actuar con tu propia wallet.

Tests de los contratos:

```bash
cargo test -p etiqueta -p peaje
```

## Ejecutar contra testnet

```bash
STELLAR_NETWORK=testnet scripts/zbe-setup.sh   # si hace falta rehacer los datos
scripts/zbe-build-testnet.sh                   # genera app/dist para testnet
cd app && npx vite preview                     # http://localhost:4173
```

## Datos de la demo

| Matrícula | Titular | Etiqueta | Papel |
|---|---|---|---|
| 1111BCD | Ana | Eco | Entra gratis |
| 2222BCD | Lucía | B | Tiene bono: cargo bloqueado |
| 3333BCD | Pablo | B | Sin bono: solo aviso `no_bono` |

> **Solo demo:** para que una persona pueda llevar toda la demo, la cámara, el
> ayuntamiento, el árbitro y la DGT firman con claves de cuentas de prueba que
> `scripts/zbe-env.sh` escribe en `app/.env.local` (fuera de git). En un
> sistema real cada actor firma con su propia wallet o backend y ninguna clave
> llega al navegador. El conductor puede usar su propia wallet (Freighter).
