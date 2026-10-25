# Plan

Plan de trabajo del Peaje ZBE (HackMeridian 2026). Las decisiones de producto
están en `CLAUDE.md` y `app/PRODUCT.md`; el avance, en `PROGRESS.md`.

## Hecho antes de esta fase

0. Scaffold local con Docker y wallet.
1. Contratos Etiqueta y Peaje con tests; flujo completo por CLI.
2. Frontend con las cinco vistas sobre los clientes generados.
3. Demo local completa; despliegue en testnet con Registry (v1.0.1).
4. README, pitch y vídeo de respaldo.

## Fase actual: revisión y rediseño

1. Buscar fallos y optimizaciones sin romper nada:
   - Contratos: TTL de entradas que solo se leen (zona, cámara, instancias).
   - Web: validación de importes, lecturas acotadas, cachés, acciones anidadas.
   - Entorno: `npm run dev` saltando de puerto tras `zbe-setup.sh`.
2. Rediseño visual "señalización vial sobria" (elegido por el usuario): azul de
   panel de carretera, señal ZBE como logo, pegatinas DGT, Overpass, sin
   degradados ni emojis; móvil con tablas en fichas.
3. Verificación: tests de contratos, typecheck, lint, e2e, build, capturas en
   escritorio y móvil, flujo completo en la web.
4. Revisión final de diseño (Impeccable) y DESIGN.md.
5. Subir a `main`.

## Pendiente / decisiones abiertas

- Testnet sigue en v1.0.1: publicar la corrección de TTL cuesta XLM (unos 4.600
  XLM el Peaje). Solo si se va a usar testnet en la demo final.
- El bundle principal pesa ~1,8 MB (SDK de Stellar + kit de wallets); dividirlo
  no aporta casi nada porque la portada ya lee el contrato.
