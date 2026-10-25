# Peaje ZBE en Stellar — contexto del proyecto (HackMeridian 2026, track Genesis)

Responde siempre en español. Este archivo resume las decisiones tomadas antes de empezar a programar.

## Qué construimos

Peaje automático y voluntario para Zonas de Bajas Emisiones (ZBE):
- Cada coche tiene su etiqueta ambiental (Cero, Eco, C, B, SinEtiqueta) como token NO transferible, emitido por la DGT.
- El conductor puede depositar un "bono ZBE" (USDC/EURC de prueba) en el contrato Peaje.
- Una cámara (oráculo autorizado) reporta entradas. Si la etiqueta no está permitida y hay bono con saldo,
  el contrato BLOQUEA el cargo (no lo cobra), abre una ventana de alegación y, si nadie alega, lo cobra.
- Sin bono o sin saldo: no se cobra nada, solo se emite el evento `no_bono` (procedimiento ordinario fuera de la cadena).
- NO es una multa automática: el bono implica consentimiento previo y siempre se puede alegar.

## Flujo de una entrada

1. Cámara llama `report_entry(camera, plate_hash, zone_id)`.
2. ¿Etiqueta permitida en la zona? Sí → nada. No → paso 3.
3. ¿Bono con saldo ≥ tarifa? No → evento `no_bono`. Sí → cargo `Pending`, importe pasa de saldo libre a bloqueado.
4. ¿Alega en plazo (`appeal`)? No → tras el plazo, `settle` transfiere a la tesorería.
   Sí → `Disputed`; solo el ÁRBITRO independiente puede `resolve`: confirma (cobra) o anula (vuelve a saldo libre).
5. Un solo cargo por vehículo + zona + día.

## Contratos (Rust, soroban-sdk)

### `contracts/etiqueta` (admin = DGT)
| Función | Firma | Qué hace |
|---|---|---|
| `__constructor(admin)` | despliegue | DGT como única emisora |
| `issue(plate_hash, owner, category)` | admin | Emite etiqueta |
| `reassign(plate_hash, new_owner)` | admin | Cambio de titular |
| `revoke(plate_hash)` | admin | Retira etiqueta |
| `get(plate_hash) -> Option<Label>` | lectura | Categoría + titular |
Sin función de transferencia para el titular.

### `contracts/peaje` (admin = ayuntamiento)
| Función | Firma | Qué hace |
|---|---|---|
| `__constructor(admin, token, treasury, arbiter)` | despliegue | Guarda direcciones |
| `set_etiqueta(etiqueta)` | admin | Dirección del contrato Etiqueta (scaffold.yml no admite `${contract.…}` en args) |
| `set_zone(zone_id, min_category, fee, appeal_secs)` | admin | Reglas de la zona |
| `add_camera(camera)` | admin | Autoriza una cámara |
| `deposit(owner, amount)` / `withdraw(owner, amount)` | owner | Recargar / retirar saldo LIBRE |
| `report_entry(camera, plate_hash, zone_id)` | camera | Consulta etiqueta y bloquea cargo si procede |
| `appeal(owner, charge_id)` | owner | Alegar dentro de plazo → `Disputed` |
| `resolve(charge_id, uphold)` | arbiter | Confirma o anula un cargo en disputa |
| `settle(charge_id)` | cualquiera | Plazo vencido sin alegación → tesorería |
| `get_charges(owner)` / `balance(owner)` | lectura | Panel del conductor (libre y bloqueado) |
| `list_charges(from, limit)`, `charge_count`, `collected`, `get_zone`, `get_config`, `is_camera` | lectura | Panel del ayuntamiento |

`Category` es un enum numérico ordenado (SinEtiqueta=0, B=1, C=2, Eco=3, Cero=4): entra gratis si `category >= min_category`.
Peaje define su propia copia de `Category`/`Label` en `contracts/peaje/src/dgt.rs`; debe coincidir con `contracts/etiqueta`.

Demo local: `scripts/zbe-setup.sh` (token USDC, set_etiqueta, zona, cámara, etiquetas, fondos, claves del frontend) y `scripts/zbe-flow.sh` (flujo completo por CLI).
Cuentas: `me` (DGT y ayuntamiento), `tesoreria`, `arbitro`, `camara`, `lucia` (B con bono), `pablo` (B sin bono), `ana` (Eco).

Estados: `Pending` → `Settled`, o `Pending` → `Disputed` → `Settled` / `Cancelled`.
Eventos: `charge_created`, `appealed`, `settled`, `cancelled`, `no_bono`.

### Reglas obligatorias
- `require_auth()` en toda función que firme alguien (admin, owner, camera, arbiter).
- Persistent storage + `extend_ttl` para etiquetas, bonos y cargos (no temporary).
- `settle` debe fallar si el cargo está `Disputed` o el plazo no ha vencido.
- Tests con `mock_all_auths()` y un token de prueba (Stellar Asset Contract) antes de desplegar.
- Privacidad: `plate_hash` = HMAC-SHA256 de la matrícula (nunca la matrícula en claro).

## Stack y herramientas (según el PDF del evento)

- Stellar Scaffold con plantilla React: `stellar scaffold init zbe-app --template react`, `npm run dev` (red local, necesita Docker).
- Contratos en `contracts/`, declarados a mano en `scaffold.yml` (`generate contract` no los añade).
- Clientes TS generados en `app-lib/clients` (NO editar; envolverlos en módulos dentro de `app/`).
  Uso: `import { peaje } from "@stellar-scaffold/app-lib/clients"`, lecturas simuladas, escrituras con `tx.signAndSend({ signTransaction })`.
- Testnet con Stellar Registry, nombres bajo `unverified/` y únicos por equipo
  (`stellar registry publish ... --wasm-name unverified/zbe-etiqueta-<equipo> --binver 1.0.0`, luego `stellar registry deploy`).
- Opcional: `stellar_registry::import_contract!(env, <nombre>)` para que Peaje llame a Etiqueta por nombre.
- Skill de Scaffold: skills.stellar.org. Skill de Registry: github.com/stellar-registry/cli.

## Frontend

Tres vistas (más una de DGT o un script para emitir etiquetas):
- Conductor: etiqueta de su coche, bono (libre/bloqueado), cargos con cuenta atrás, botón alegar.
- Cámara simulada: elegir matrícula de una lista → "Coche entra".
- Ayuntamiento: configurar zona, ver cargos, `settle`, recaudación. (Árbitro: resolver disputas.)

Implementado en `app/src/pages/` (Conductor, Camara, Ayuntamiento, Arbitro, Dgt, Home) sobre `app/src/zbe/`:
- `config.ts`: zona, categorías, formato USDC y firmantes de demo (`demoSigner`) con claves de `app/.env.local`
  (generado por `scripts/zbe-env.sh`, lo llama `zbe-setup.sh`; SOLO demo, gitignored).
- `contracts.ts`: `send(tx, signer)` (falla con mensaje en español si la simulación da error de contrato), tipos.
- `token.ts`: el USDC es un SAC sin cliente generado; lectura/mint/trustline a mano con la SDK.
- `plates.ts`: HMAC en el navegador (misma clave que los scripts); `hooks.ts`: lecturas react-query con refresco de 3 s.
- Conductor firma con Freighter ("Mi wallet") o como Lucía/Pablo/Ana; cámara, ayuntamiento, árbitro y DGT firman con claves de demo.

## Plan

0. Preparación: Scaffold funcionando en local y wallet conectada.
1. Contratos: Etiqueta primero, luego Peaje; tests en verde; flujo completo vía `stellar contract invoke`.
2. Frontend: las vistas, primero con datos simulados, luego con los clientes generados.
3. Demo completa en LOCAL antes de tocar testnet. Después: Registry + testnet, pulido.
4. Congelar código, vídeo de respaldo, ensayar pitch.

Datos de demo fijos: tres matrículas (una Eco, una B con bono, una B sin bono); zona "centro" que solo admite Cero y Eco,
tarifa 5 USDC/día, `appeal_secs` = 60 para la demo.
