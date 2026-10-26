# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences weighed equally (confirmed):

- **Hackathon jury (HackMeridian 2026, track Genesis):** watches the app
  projected during a live pitch. Must understand the mechanism and each role in
  seconds.
- **Real users of a city deployment:** drivers checking their car's label, their
  ZBE pass balance and appeal deadlines; city hall staff configuring the zone
  and collecting due charges; an independent arbiter resolving appeals; the DGT
  issuing labels. In the demo one person plays every role from the same browser.

## Product Purpose

An automatic, opt-in toll for Spanish Low Emission Zones (ZBE) on Stellar. A car
whose environmental label is not allowed in a zone, and whose owner pre-funded a
ZBE pass, has the daily fee locked (not taken); the owner can appeal within a
window, and only an independent arbiter decides appeals. Without a pass nothing
is charged: a `no_bono` event hands the case to the ordinary off-chain
procedure. Success: the jury sees a fair, non-punitive alternative to automatic
fines, and a driver always knows what is locked, why and until when.

## Positioning

Not an automatic fine: consent first (only drivers who top up a pass can be
charged), funds locked but untouchable during the appeal window, the city is
never judge and party, and only an HMAC of the plate goes on-chain.

## Operating Context

- Roles and routes: Driver (`/conductor`), Camera (`/camara`), City Hall
  (`/ayuntamiento`), Arbiter (`/arbitro`), DGT (`/dgt`), Home (`/`), Contract
  Explorer (`/debug`).
- Demo data: zone `centro` admits Eco and Zero for free, 5 USDC per day, 60 s
  appeal window; plates 1111BCD (Ana, Eco), 2222BCD (Lucía, B with pass),
  3333BCD (Pablo, B without pass).
- Charge states: Locked (Pending) → Collected (Settled), or Locked → Under
  appeal (Disputed) → Collected / Cancelled. At most one charge per vehicle,
  zone and day.
- Runs on a local Stellar network (Docker) or testnet; reads poll every 3 s;
  writes are signed with demo keys or Freighter.

## Capabilities and Constraints

- React + Vite on Stellar Scaffold; generated contract clients in
  `app-lib/clients` (do not edit).
- Environmental label categories, Spanish DGT scheme: No label, B (yellow), C
  (green), Eco (green/blue), Zero (blue).
- Amounts are a test USDC token (7 decimals); no real value.

## Brand Commitments

- Product name: **ZBE Toll** (confirmed).
- Interface language: **English** (confirmed). Code, comments and internal docs
  in Spanish.
- Team: IMPEDANCIA UNO, HackMeridian 2026.

## Evidence on Hand

- Demo video: https://www.youtube.com/watch?v=ys-ihhcaj7s; pitch script:
  `docs/pitch.md`.
- No real customers, cities, testimonials or metrics exist: do not fabricate
  them.

## Product Principles

1. Consent before charge: the interface must make clear that no pass means no
   charge.
2. Every locked euro shows its reason and its deadline.
3. Roles stay separate: the city cannot resolve appeals; the arbiter cannot
   configure zones.
4. Privacy by design: plates are shown only where this browser already knows
   them.

## Accessibility & Inclusion

WCAG AA contrast and keyboard access (user's global requirement); responsive
down to phone width.
