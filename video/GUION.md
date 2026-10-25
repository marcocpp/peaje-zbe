# Guion del vídeo de demo (HackMeridian 2026 · Genesis)

Vídeo de 2:00, 1920x1080, 30 fps, sin voz (subtítulos con tiempos fijos). Los
textos están en `src/contenido.ts`; los tiempos de cada bloque, en
`src/contenido.ts` → `BLOQUES`.

Todo lo que se enseña sale de la app real en Stellar testnet (capturas en
`public/capturas/`, clip en `public/clips/`) o de componentes SVG/CSS.

| Tiempo    | Bloque            | Qué se ve                                                                                                                                                                                                                                                                                               | Criterio de los jueces                  |
| --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 0:00-0:15 | Problema          | Señal ZBE y etiquetas DGT. "Cities across Europe are rolling out Low Emission Zones." → "Enter without a valid label, and a fine arrives weeks later." → "A slow, expensive procedure for the city to collect a small amount."                                                                          | Valor para el usuario, mercado          |
| 0:15-0:35 | Solución          | Nombre "ZBE Toll on Stellar", qué es (peaje voluntario y recurrible), para quién (conductores y ayuntamientos), pegatinas con los 4 principios, "HackMeridian 2026 · Genesis track".                                                                                                                    | Alineación con la categoría, innovación |
| 0:35-1:25 | Demo real         | Ventana de app con capturas: DGT emite etiquetas → Lucía recarga 20 USDC → la cámara bloquea 5 USDC → Eco gratis / sin bono no se cobra → cuenta atrás → alega → el árbitro anula → el ayuntamiento cobra el otro cargo → clip en vivo → transacción `settle` confirmada en stellar.expert con el hash. | Ejecución técnica, diseño, valor        |
| 1:25-1:45 | Cómo está hecho   | Diagrama: actores → web React (Stellar Scaffold) → contratos Soroban Etiqueta y Peaje → USDC (Stellar Asset Contract). Sin base de datos: el estado vive en los contratos. Herramientas y uso de IA (Claude Code).                                                                                      | Ejecución técnica                       |
| 1:45-2:00 | Progreso y futuro | Lo construido en el hackatón (2 contratos, 19 tests, 5 vistas, testnet + Registry) y lo siguiente (piloto con una ciudad, cámaras reales, integración DGT, varias zonas). Equipo IMPEDANCIA UNO y enlace al repo.                                                                                       | Progreso, mercado                       |

## Orden de la demo

El recorrido se grabó con `scripts/capturar.mjs`. El cobro del cargo #0 se hizo
después de la alegación del cargo #1, así que la demo enseña primero la
alegación y después el cobro: así cada captura coincide con el estado real.

1. `02` DGT: tres etiquetas emitidas (tokens no transferibles).
2. `03` → `04` Conductor (Lucía, etiqueta B): recarga 20 USDC = consentimiento.
3. `05` Cámara: 2222BCD entra → cargo #0, 5 USDC bloqueados.
4. `06` Cámara: 1111BCD (Eco) gratis, 3333BCD (sin bono) no se cobra.
5. `07` Conductor: 15 libres / 5 bloqueados, cuenta atrás para alegar.
6. `12` → `13` Segundo coche de Lucía (4444BCD): alega → "Under appeal".
7. `14` → `15` Árbitro independiente: "Cancel and refund".
8. `10` Ayuntamiento: plazo vencido sin alegación → cobra el cargo #0.
9. Clip en vivo: la cámara registra 5555BCD y el cargo se bloquea en segundos.
10. `20` stellar.expert: transacción `settle` confirmada, con hash, evento
    `settled` y transferencia de 5 USDC a la tesorería.

## Notas

- Etiqueta discreta "Prototype · Stellar testnet" en todo el vídeo.
- Sin voz: pista reservada `public/audio/voz.wav` (silencio). Sustitúyela por la
  grabación y vuelve a renderizar.
- No hay base de datos: el estado (etiquetas, bonos, cargos) está en el
  almacenamiento persistente de los contratos Soroban.
