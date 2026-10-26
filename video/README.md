# Vídeo de demo (Remotion)

Vídeo de 2:00 (1920x1080, 30 fps) para HackMeridian 2026. Guion en
[`GUION.md`](GUION.md); todos los textos y tiempos en
[`src/contenido.ts`](src/contenido.ts); colores, tipografía y muelles en
[`src/tema.ts`](src/tema.ts).

```bash
cd video
npm install
npm run dev        # Remotion Studio (vista previa) → http://localhost:3000
npm run render     # → out/demo.mp4
npm run typecheck
```

## Material

- `public/capturas/`: capturas reales de la web en Stellar testnet y de
  stellar.expert (`20-explorer-cobro.png`, `21-explorer-cargo.png`).
- `public/clips/entrada-camara.mp4`: grabación real de la cámara registrando
  5555BCD.
- `public/audio/voz.mp3`: locución en inglés sintetizada con edge-tts a partir
  de los subtítulos (cada frase empieza con su subtítulo). Para regenerarla tras
  cambiar textos, o para usar tu propia grabación con el mismo nombre:

  ```bash
  python3 -m venv video/.voz-venv && video/.voz-venv/bin/pip install edge-tts
  node --experimental-strip-types video/scripts/generar-voz.mjs   # VOZ=en-GB-RyanNeural para otra voz
  ```

El render final `out/demo.mp4` está versionado en git (el resto de `out/` no).

## Volver a capturar

Con la web de testnet servida en `:4173` (`scripts/zbe-build-testnet.sh` y
`cd app && npx vite preview`):

```bash
node video/scripts/capturar.mjs                    # recorrido completo (FROM=10 reanuda en el cobro)
node video/scripts/cobrar.mjs                      # solo City Hall → Collect
node video/scripts/grabar-clip.mjs                 # clip de la cámara (emitir antes 5555BCD)
node video/scripts/explorador.mjs nombre=<hash>    # transacción en stellar.expert
```

Los scripts usan `playwright-core` de la raíz del repo; con otro Chromium,
pásalo en `CHROME=/ruta/al/chrome`. Para grabar vídeo, Playwright necesita su
ffmpeg (`npx playwright install ffmpeg`).
