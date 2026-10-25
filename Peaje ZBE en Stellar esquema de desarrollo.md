# Peaje ZBE en Stellar: esquema de desarrollo

Oct 25, 2026 · @Marco

## Idea y alcance del MVP

Un peaje automático y voluntario para zonas de bajas emisiones: cada coche tiene
su etiqueta ambiental como token, y si entra en la ZBE sin permiso y su dueño
tiene un «bono ZBE», el contrato bloquea el cargo, abre una ventana para alegar
y, si nadie alega, lo cobra.

**Por qué así y no como multa automática:** quitar dinero sin consentimiento ni
derecho a defensa no es legal. Con el bono, el conductor acepta las reglas al
depositar, puede alegar siempre, y quien no tiene bono sigue el procedimiento de
multa normal fuera de la cadena.

| Prioridad        | Funcionalidad                                              | Por qué                          |
| ---------------- | ---------------------------------------------------------- | -------------------------------- |
| Imprescindible   | Etiqueta ambiental como token no transferible por vehículo | Es la «tokenización» de la idea  |
| Imprescindible   | Bono ZBE: depositar y retirar saldo libre                  | Da el consentimiento previo      |
| Imprescindible   | Cámara simulada que registra una entrada                   | Dispara todo el flujo en la demo |
| Imprescindible   | Cargo bloqueado + ventana de alegación + cobro             | El corazón del contrato          |
| Si sobra tiempo  | Resolver alegaciones desde el panel del ayuntamiento       | Cierra el ciclo de defensa       |
| Si sobra tiempo  | Lectura real de matrícula con webcam                       | Efecto «wow» en el escenario     |
| Si sobra tiempo  | Varias zonas con reglas y precios distintos                | Escalabilidad para el pitch      |
| Fuera de alcance | Integración real con DGT o cámaras municipales             | Se explica como siguiente paso   |

## Flujo de una entrada en la ZBE

Cada entrada pasa por tres preguntas: ¿la etiqueta permite entrar?, ¿tiene
bono?, ¿alega a tiempo? Solo se cobra si la respuesta es no, sí y no.

&#91;embedded content: flujo de una entrada · 3 decisiones, 4 finales\]

El cargo es uno por vehículo, zona y día: si la misma cámara lo ve tres veces,
solo se bloquea una vez.

## Arquitectura

No hace falta backend propio: los cuatro actores son vistas del frontend de
Scaffold que firman con su wallet, y toda la lógica vive en dos contratos.

&#91;embedded content: arquitectura · 4 actores, 3 piezas en Stellar\]

El Peaje consulta al Etiqueta en cada `report_entry` y mueve los fondos con el
token. La cámara es una cuenta autorizada con `add_camera`; en la demo, una
pantalla con un botón «Coche entra» o un script en `scripts/`. La tesorería es
una dirección del ayuntamiento.

## Contratos Soroban

Dos contratos en Rust: **Etiqueta** (lo emite la DGT, dice qué categoría tiene
cada coche) y **Peaje** (lo gestiona el ayuntamiento: zonas, bonos y cargos). El
dinero se mueve con el token USDC o EURC de prueba.

### Contrato Etiqueta (admin: DGT)

| Función                              | Quién firma     | Qué hace                                                   |
| ------------------------------------ | --------------- | ---------------------------------------------------------- |
| `__constructor(admin)`               | despliegue      | Fija la DGT como única emisora                             |
| `issue(plate_hash, owner, category)` | admin           | Emite la etiqueta: `Cero`, `Eco`, `C`, `B` o `SinEtiqueta` |
| `reassign(plate_hash, new_owner)`    | admin           | Cambio de titular al vender el coche                       |
| `revoke(plate_hash)`                 | admin           | Retira la etiqueta                                         |
| `get(plate_hash) → Option<Label>`    | nadie (lectura) | Devuelve categoría y titular                               |

No tiene función de transferencia: el titular no puede pasarla a otro, solo la
DGT. Eso la convierte en un token «ligado» al vehículo.

### Contrato Peaje (admin: ayuntamiento)

| Función                                                    | Quién firma     | Qué hace                                                                           |
| ---------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `__constructor(admin, etiqueta, token, treasury, arbiter)` | despliegue      | Guarda direcciones del contrato Etiqueta, del token, de la tesorería y del árbitro |
| `set_zone(zone_id, min_category, fee, appeal_secs)`        | admin           | Define qué etiquetas entran gratis, la tarifa y la ventana de alegación            |
| `add_camera(camera)`                                       | admin           | Autoriza una cámara (oráculo)                                                      |
| `deposit(owner, amount)` / `withdraw(owner, amount)`       | owner           | Recargar el bono o retirar el saldo libre                                          |
| `report_entry(camera, plate_hash, zone_id)`                | camera          | Consulta la etiqueta; si no está permitida y hay bono, bloquea el cargo            |
| `appeal(owner, charge_id)`                                 | owner           | Alegar dentro de plazo: el cargo queda en disputa                                  |
| `resolve(charge_id, uphold)`                               | árbitro         | Confirma (cobra) o anula (desbloquea) un cargo en disputa                          |
| `settle(charge_id)`                                        | cualquiera      | Pasado el plazo sin alegación, transfiere a la tesorería                           |
| `get_charges(owner)` / `balance(owner)`                    | nadie (lectura) | Para el panel del conductor                                                        |

**Estados de un cargo:** `Pending` → `Settled` (cobrado), o `Pending` →
`Disputed` → `Settled` / `Cancelled`.

**Depósito y alegación:** el bono no es un pago. El saldo tiene una parte libre
(retirable con `withdraw`) y una bloqueada por cargos pendientes, que ni el
conductor puede retirar ni el ayuntamiento cobrar. Un cargo en disputa no se
puede cobrar con `settle`: solo `resolve` lo cierra, y solo puede llamarla el
**árbitro independiente** (por ejemplo, un defensor del ciudadano), nunca el
ayuntamiento, para que no sea juez y parte.

**Reglas que no hay que olvidar:**

- Un solo cargo por vehículo, zona y día (clave `plate_hash + zone_id + día`),
  como el cargo diario de la ULEZ de Londres.
- Sin bono o con saldo insuficiente: no se cobra nada, solo se emite un evento
  `no_bono` para el procedimiento ordinario.
- `require_auth()` en toda función que firme alguien, y persistent storage con
  `extend_ttl` para etiquetas, bonos y cargos.
- El Peaje llama al Etiqueta por su dirección guardada en el constructor; en
  testnet podéis hacerlo por nombre con `import_contract!` de Stellar Registry
  (ver montaje).

## Montaje con Stellar Scaffold y Stellar Registry

Stellar Scaffold os da en un comando contratos en Rust, frontend React, red
local y clientes TypeScript que se regeneran solos; Stellar Registry sirve para
subir los contratos a testnet con nombre. Todo sale del PDF del evento.

### 1. Instalar y crear el proyecto

Necesitáis Rust + Cargo, Node.js + npm, Stellar CLI y Docker (para la red
local).

```bash
cargo install --locked stellar-scaffold-cli stellar-registry-cli
stellar scaffold doctor            # revisa que no falte nada
stellar scaffold init zbe-app --template react
cd zbe-app && npm install
npm run dev                        # red local + app en http://localhost:5173
```

Con `npm run dev`, cada vez que guardáis un contrato se recompila, se
redespliega en local y se regenera su cliente TypeScript.

### 2. Añadir los contratos

```bash
stellar scaffold generate contract --ls                 # ver ejemplos disponibles
stellar scaffold generate contract --from-wizard        # plantillas de OpenZeppelin
```

`generate` crea la carpeta en `contracts/` pero no la añade a `scaffold.yml`:
hacedlo a mano.

```yaml
# scaffold.yml
contracts:
  etiqueta:
    type: workspace
    source: etiqueta # nombre del paquete en su Cargo.toml
    args:
      admin: ${account.me}
    networks:
      local:
  peaje:
    type: workspace
    source: peaje
    args:
      admin: ${account.me}
    networks:
      local:
```

El Peaje necesita la dirección del Etiqueta y del token en su constructor: en
local, dejad un script que lo inicialice o pasadlas como argumentos cuando las
tengáis.

### 3. Llamar a los contratos desde el frontend

No editéis `app-lib/clients` (se regenera en cada build); envolved los clientes
en vuestros propios módulos dentro de `app/`.

```ts
import { peaje } from "@stellar-scaffold/app-lib/clients"

// Lectura: simulada, sin firma
const { result } = await peaje.balance({ owner: address })

// Escritura: firma con la wallet conectada y envía
const { address, signTransaction } = useWallet()
const tx = await peaje.deposit(
	{ owner: address, amount: 50_0000000n },
	{ publicKey: address },
)
await tx.signAndSend({ signTransaction })
```

### 4. Subir a testnet con Stellar Registry

Scaffold solo despliega en local. Para testnet: `STELLAR_NETWORK=testnet` en
`.env`, y luego publicar y desplegar cada contrato con nombre bajo `unverified/`
(los nombres sin prefijo necesitan aprobación). Usad un nombre único por equipo
para evitar el error «#5 contract name taken».

```bash
stellar scaffold build --compile-only
stellar keys fund me --network testnet

stellar registry publish \
  --wasm target/stellar/testnet/etiqueta.wasm \
  --wasm-name unverified/zbe-etiqueta-<equipo> --binver 1.0.0

stellar registry deploy \
  --contract-name unverified/zbe-etiqueta-<equipo> \
  --wasm-name unverified/zbe-etiqueta-<equipo> --version 1.0.0 \
  -- --admin me
```

Repetid con el Peaje. Después, en `scaffold.yml`, añadid la red `testnet` a cada
contrato con `type: contract` y `source: C…` (el ID que devuelve el deploy), y:

```bash
stellar scaffold config check --network testnet
stellar scaffold build --network testnet
npm run build                      # web estática en dist/
```

Comprobad la ruta exacta del `.wasm` que genera el build; el PDF usa
`target/stellar/local/` en su ejemplo.

### 5. Opcional: llamar al Etiqueta por nombre desde Rust

Con `stellar-registry = "0.1"` en `[dependencies]`,
`stellar_registry::import_contract!(env, <nombre>)` convierte un nombre del
registro en un cliente tipado, y `import_asset!("USDC:G…")` hace lo mismo con un
token. Compilad con `STELLAR_NETWORK=testnet stellar scaffold build`: las
direcciones se fijan al compilar, así que tras un redespliegue hay que hacer
`cargo clean`. Es un buen detalle para el jurado porque usa las herramientas del
evento.

### Atajos y errores típicos del PDF

- `stellar contract invoke --id <alias> -- --help` lista las funciones y
  argumentos de un contrato.
- Cambiasteis argumentos del constructor y no pasa nada:
  `stellar scaffold clean` y otra vez `npm run dev`.
- La app falla en testnet pero no en local: recompilad con `--network testnet` y
  corregid tipos.
- App y CLI en redes distintas: `STELLAR_NETWORK` y las variables
  `PUBLIC_STELLAR_*` del `.env` deben coincidir.
- Para vuestro agente de IA: skill de Scaffold en skills.stellar.org y skill de
  Registry en github.com/stellar-registry/cli.

### Estructura del repositorio

```
zbe-app/
├── contracts/
│   ├── etiqueta/       # Contrato Etiqueta (Rust)
│   └── peaje/          # Contrato Peaje (Rust)
├── app/                # Frontend React: vistas conductor, ayuntamiento, cámara
├── app-lib/clients/    # Generado, no tocar
├── scripts/            # Emitir etiquetas de demo, simular cámara, inicializar zona
├── scaffold.yml
└── .env
```

## Plan por fases y roles

Cinco fases con una puerta entre cada una. La regla clave: todo en la red local
de Scaffold hasta que la demo funcione entera, y solo entonces subir a testnet.

&#91;embedded content: plan de desarrollo · 5 fases, 4 puertas\]

Contratos y frontend avanzan en paralelo desde la fase 1: el frontend arranca
con datos simulados y conecta los clientes generados en cuanto los contratos
compilan.

| Rol                      | Responsable de                                      | Entregable clave                                   |
| ------------------------ | --------------------------------------------------- | -------------------------------------------------- |
| Contratos (Rust)         | Etiqueta, Peaje, tests                              | Contratos en `scaffold.yml` con clientes generados |
| Frontend                 | Vistas conductor, cámara y ayuntamiento             | Demo completa en local                             |
| Integración y despliegue | Scripts de datos de demo, Stellar Registry, testnet | IDs en testnet y `scaffold.yml` apuntando a ellos  |
| Producto y pitch         | Guion, diseño, vídeo, respuestas al jurado          | Pitch de 3 minutos ensayado                        |

### Reglas de trabajo

- Una rama por pieza y fusión a `main` al cruzar cada puerta.
- Usad el skill de Scaffold de skills.stellar.org en vuestro asistente de
  código, pero revisad a mano autorización, storage y TTL.
- Datos de demo siempre iguales (tres matrículas: una Eco, una B con bono, una B
  sin bono) para que el ensayo y la demo coincidan.

## Riesgos, preguntas del jurado, demo y pitch

La pregunta más dura será «¿quién garantiza que la cámara dice la verdad?», así
que la respuesta tiene que estar preparada: en la vida real el ayuntamiento
firma los eventos con su clave y el conductor siempre puede alegar.

| Pregunta probable del jurado                      | Respuesta                                                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ¿Y si la cámara lee mal la matrícula?             | Ventana de alegación; el cargo no se cobra hasta que vence o se resuelve                                                       |
| ¿No es una multa automática?                      | No: es un peaje voluntario. Sin bono, procedimiento ordinario fuera de la cadena                                               |
| ¿Privacidad de los trayectos?                     | Solo hash HMAC de la matrícula, y solo se registran entradas no permitidas de quien tiene bono, no todas las entradas          |
| ¿Por qué blockchain y no la web del ayuntamiento? | Reglas públicas y verificables, fondos que el ayuntamiento no puede tocar antes de tiempo, y cobros pequeños casi sin comisión |
| ¿Quién es el cliente?                             | Ayuntamientos obligados a tener ZBE y conductores que entran ocasionalmente y prefieren pagar a recibir multas                 |

| Riesgo técnico                                 | Plan B                                                 |
| ---------------------------------------------- | ------------------------------------------------------ |
| El despliegue en testnet da guerra             | Hacer la demo en la red local de Scaffold y explicarlo |
| Llamada entre contratos falla                  | Guardar la categoría en el propio Peaje para la demo   |
| La ventana de alegación es larga para una demo | Configurar la zona con `appeal_secs` de 60 segundos    |
| La webcam no lee la matrícula                  | Botón «Coche entra» con matrícula elegida de una lista |

### Guion de la demo (90 segundos, tres pantallas)

1. **Conductora:** Lucía tiene un coche con etiqueta B y recarga 20 USDC en su
   bono ZBE.
2. **Cámara:** su coche entra en la ZBE centro, que solo admite Cero y Eco.
   Aparece «Cargo bloqueado: 5 USDC».
3. **Conductora:** ve el cargo y el contador de la ventana de alegación.
4. **Ayuntamiento:** pasado el plazo, `settle` y la recaudación sube en el
   panel.
5. Cierre: entra un coche Eco y no pasa nada; entra un coche B sin bono y solo
   se genera el aviso para el procedimiento ordinario.

### Pitch (3 minutos)

| Tiempo    | Contenido                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------- |
| 0:00–0:30 | El problema: ZBE en toda Europa, multas que llegan semanas después y gestión cara para los ayuntamientos |
| 0:30–2:00 | Demo en vivo                                                                                             |
| 2:00–2:30 | Por qué Stellar: etiquetas como tokens controlados por la DGT, reglas públicas, cobros casi sin comisión |
| 2:30–3:00 | Siguiente paso: piloto con un ayuntamiento, integración con cámaras reales y con la DGT, más zonas       |
