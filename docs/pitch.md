# Pitch y demo · Peaje ZBE en Stellar

Equipo IMPEDANCIA UNO · 3 minutos · demo en vivo de 90 s

## Guion (3:00)

| Tiempo | Qué se dice | Pantalla |
|---|---|---|
| 0:00–0:30 | **El problema.** Toda Europa tiene ZBE. Hoy, si entras sin etiqueta válida, te llega una multa semanas después y el ayuntamiento paga un procedimiento caro para cobrar poco. | Portada |
| 0:30–2:00 | **Demo en vivo** (ver abajo). | Vistas |
| 2:00–2:30 | **Por qué Stellar.** La etiqueta es un token que solo emite la DGT y no se puede transferir. Las reglas de la zona son públicas y verificables. El dinero del bono queda bloqueado en el contrato: ni el conductor lo retira ni el ayuntamiento lo cobra antes de tiempo. Y lo resuelve un árbitro, no quien cobra. | Ayuntamiento o Árbitro |
| 2:30–3:00 | **Siguiente paso.** Piloto con un ayuntamiento, integración con las cámaras reales y con la DGT, varias zonas con tarifas distintas. Publicado en testnet con Stellar Registry. | Portada |

Frase de cierre: *«No es una multa automática: es un peaje que eliges, que puedes recurrir y que nadie puede cobrar antes de tiempo.»*

## Demo (90 s) — clics

Antes de empezar: zona `centro` (Cero y Eco, 5 USDC, 60 s). Pestañas abiertas
en Conductor, Cámara y Ayuntamiento.

1. **Conductor** → «Ver como: Lucía» → importe 20 → **Recargar**.
   *«Lucía tiene un coche B y recarga 20 USDC en su bono ZBE.»*
2. **Cámara** → matrícula **2222BCD** → **Coche entra**.
   *«Su coche entra en la ZBE centro, que solo admite Cero y Eco: cargo bloqueado de 5 USDC. Todavía no se cobra.»*
3. **Conductor** (Lucía) → enseñar el cargo **Bloqueado** y la cuenta atrás.
   *«Tiene 60 segundos para alegar; en la vida real serían días.»*
4. **Cámara** → **1111BCD** (Eco): *«Entra gratis, no pasa nada.»*
   → **3333BCD** (B sin bono): *«Sin bono no cobramos nada: solo un aviso para el procedimiento ordinario.»*
5. **Ayuntamiento** → cuando el plazo vence → **Cobrar** → la recaudación sube.
   *«Pasado el plazo sin alegación, cualquiera puede ejecutar el cobro: va directo a la tesorería.»*

Si sobra tiempo o lo pregunta el jurado: otra entrada → **Alegar** en
Conductor → **Árbitro** → **Anular**: el dinero vuelve al saldo libre.

## Preguntas probables

| Pregunta | Respuesta |
|---|---|
| ¿Y si la cámara lee mal la matrícula? | Nada se cobra en el momento: hay plazo de alegación y un árbitro independiente. Lo enseñamos en la demo. |
| ¿Quién garantiza que la cámara dice la verdad? | Solo pueden reportar cámaras que el ayuntamiento ha autorizado en el contrato, y cada una firma sus entradas con su propia clave. Y el conductor siempre puede alegar. |
| ¿No es una multa automática? | No. El bono es voluntario y es consentimiento previo. Sin bono, procedimiento ordinario de siempre. |
| ¿Privacidad? | En la cadena solo va el HMAC de la matrícula, no la matrícula. Y solo se registran las entradas no permitidas de quien tiene bono, no todos los trayectos. |
| ¿Por qué blockchain y no la web del ayuntamiento? | Reglas públicas y verificables, fondos que el ayuntamiento no puede tocar antes de tiempo, y separación entre quien cobra y quien resuelve. |
| ¿Quién es el cliente? | Ayuntamientos obligados a tener ZBE y conductores que entran de vez en cuando y prefieren pagar a recibir multas. |
| ¿Qué pasa si se vende el coche? | La DGT reasigna la etiqueta al nuevo titular (`reassign`); el titular no puede transferirla por su cuenta. |
| ¿Comisiones? | Las comisiones de una transacción en Stellar son de fracciones de céntimo. El coste a vigilar es el alquiler del almacenamiento de cada cargo: en testnet es alto, hay que medirlo en mainnet y optimizarlo antes de un piloto. |
| ¿En la demo quién firma? | La cámara, el ayuntamiento y el árbitro usan cuentas de prueba para poder llevar la demo una sola persona. El conductor puede firmar con su propia wallet (Freighter). |

## Checklist del día

- [ ] Elegir red: **local** (más rápida) o **testnet** (más creíble). Plan B: la otra, y si todo falla, `docs/demo-respaldo.mp4`.
- [ ] **Local:** `npm run dev`, esperar a que despliegue, luego `scripts/zbe-setup.sh`. Si ya hubo cargos ese día, reiniciar antes con `stellar scaffold clean`.
- [ ] **Testnet:** `scripts/zbe-build-testnet.sh` y `cd app && npx vite preview`. Las matrículas de demo solo dan un cargo por día: no ensayar con 2222BCD el mismo día de la presentación (usar otra emitida desde la vista DGT).
- [ ] Freighter en la red correcta (Local o Testnet) si se usa «Mi wallet».
- [ ] Ventana de alegación de 60 s: empezar la demo por la recarga para que el plazo venza justo al llegar al Ayuntamiento.
- [ ] Vídeo de respaldo abierto en otra pestaña.
- [ ] Ensayar el pitch cronometrado al menos dos veces.
