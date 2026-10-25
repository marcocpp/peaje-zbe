---
name: ZBE Toll
description:
  An opt-in, appealable Low Emission Zone toll on Stellar, spoken in the
  language of Spanish road signage.
colors:
  ground: "#f2f4f7"
  panel: "#ffffff"
  ink: "#10151c"
  ink-2: "#4a5563"
  rule: "#d5dbe3"
  rule-soft: "#e7ebf0"
  sign: "#0b4ea2"
  sign-dark: "#083a7a"
  sign-soft: "#e6eef8"
  ring: "#c8102e"
  ok: "#1e6b34"
  ok-soft: "#e3f2e7"
  lock: "#7a4f00"
  lock-soft: "#fff0c7"
  danger: "#b3261e"
  danger-soft: "#fdecea"
  label-b: "#f5c400"
  label-c: "#1a7d3e"
  label-zero: "#1d5fae"
  plate-eu: "#1f4bb4"
  plate-star: "#ffd400"
typography:
  display:
    fontFamily:
      "Overpass Variable, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.6vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Overpass Variable, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.2vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  section:
    fontFamily: "Overpass Variable, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 1.2rem + 0.8vw, 1.8rem)"
    fontWeight: 800
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Overpass Variable, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 750
    letterSpacing: "-0.01em"
  figure:
    fontFamily: "Overpass Variable, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  body:
    fontFamily: "Overpass Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Overpass Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 650
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.85em"
rounded:
  code: "4px"
  plate: "5px"
  status: "6px"
  control: "8px"
  panel: "12px"
  road-sign: "18px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "3rem"
  gutter: "2rem"
  container: "1240px"
components:
  button:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.1rem"
    height: "2.75rem"
  button-hover:
    backgroundColor: "{colors.ground}"
  button-primary:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.panel}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.sign-dark}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.sign}"
    rounded: "{rounded.control}"
  button-secondary-hover:
    backgroundColor: "{colors.sign-soft}"
    textColor: "{colors.sign-dark}"
  button-danger:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
  button-danger-hover:
    backgroundColor: "{colors.danger-soft}"
  button-small:
    padding: "0.35rem 0.8rem"
    height: "2.25rem"
  button-big:
    padding: "0.75rem 1.75rem"
    height: "3.5rem"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.8rem"
    height: "2.75rem"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
    padding: "1.5rem"
  chip-signer:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.85rem"
  status-locked:
    backgroundColor: "{colors.lock-soft}"
    textColor: "{colors.lock}"
    rounded: "{rounded.status}"
    padding: "0.25rem 0.65rem"
  status-appeal:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.sign}"
    rounded: "{rounded.status}"
    padding: "0.25rem 0.65rem"
  status-collected:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    rounded: "{rounded.status}"
    padding: "0.25rem 0.65rem"
  status-cancelled:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.status}"
    padding: "0.25rem 0.65rem"
  balance-free:
    backgroundColor: "{colors.sign-soft}"
    textColor: "{colors.sign-dark}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1rem"
  balance-locked:
    backgroundColor: "{colors.lock-soft}"
    textColor: "{colors.lock}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1rem"
  road-sign:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.panel}"
    rounded: "{rounded.road-sign}"
    padding: "6px"
  plate:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
  sticker:
    size: "2.1rem"
    rounded: "{rounded.pill}"
---

# Design System: ZBE Toll

## Overview

**Creative North Star: "The Zone Boundary Sign"**

The interface speaks the visual language a Spanish driver already reads at the
edge of a Low Emission Zone: the blue information panel, the red-ringed ZBE
disc, the round DGT environmental stickers and the EU number plate. Those
artefacts appear only where they carry meaning (a rule, a label, a vehicle, an
outcome); everything else is a quiet operating surface of flat white panels on a
cool grey ground, separated by 1px rules.

Density is calm and projector-friendly: generous 1.5rem gutters, large type for
figures, one accent colour doing most of the work. The system is restrained by
design, chosen after a louder signage treatment proved "too much, not
intuitive". It rejects the gradient hero over a row of shadowed emoji cards, and
it rejects neon dark mode.

State is carried by colour families with fixed meaning: signage blue for action
and the right to appeal, amber for money that is locked, green for money
collected, grey for nothing happening, red only for the ZBE ring and for
genuinely destructive acts.

**Key Characteristics:**

- Flat white panels with 1px rules on a cool grey ground; no resting shadows.
- Signage blue as the single action colour.
- Real-world artefacts (road sign, ZBE disc, DGT stickers, EU plates) drawn in
  their true colours.
- Overpass for everything, tabular figures for every amount and countdown.
- Light scheme only.

## Colors

A cool, near-neutral light palette with one signage blue and a small set of
semantic state pairs (strong ink plus soft fill).

### Primary

- **Road Sign Blue** (`sign`): primary buttons, active navigation underline,
  links, focus rings, the step numerals, the zone-rules road sign and the "free
  entry" outcome disc. Hover deepens to **Night Sign Blue** (`sign-dark`).
  **Blue Wash** (`sign-soft`) fills the available-balance tile and the secondary
  button hover.

### Secondary

- **ZBE Ring Red** (`ring`): only the ring of the ZBE sign and the "charge
  locked" outcome disc. It is never a fill, never a button, never text.

### Neutral

- **Asphalt Ink** (`ink`): body text, headings, the plate border and characters.
- **Kerb Grey** (`ink-2`): secondary text, table headers, field hints, the
  signer chip.
- **Cool Ground** (`ground`): page background, table header band, cancelled
  status fill, button hover.
- **Panel White** (`panel`): every panel, input, button and the header and
  footer bars.
- **Rule** (`rule`) and **Soft Rule** (`rule-soft`): 1px dividers; Rule for
  panel edges and section breaks, Soft Rule for rows inside a panel.

### State pairs

- **Locked Amber** (`lock` on `lock-soft`): money held in a pass: Locked status,
  locked balance tile, countdowns, "not allowed" marks, notices.
- **Collected Green** (`ok` on `ok-soft`): Collected status, "allowed" marks,
  success toasts.
- **Danger Red** (`danger` on `danger-soft`): destructive buttons (revoke a
  label) and error text and toasts. Distinct from ZBE Ring Red.

### Real-world artefact colours

- **DGT sticker colours** (`label-b` yellow, `label-c` green, `label-zero` blue;
  Eco is a hard half-and-half split of `label-c` and `label-zero`; "no label" is
  a white disc with a dashed grey edge).
- **EU plate band** (`plate-eu` with `plate-star` letter).

### Named Rules

**The One Blue Rule.** Every actionable thing is Road Sign Blue or a neutral
outline. No second accent is introduced for actions.

**The Appeal Is Not Danger Rule.** Appealing is a right, so the Appeal button
and the Under-appeal status use blue (outline), never red.

**The Ring Is Reserved Rule.** ZBE Ring Red marks the zone sign and a
locked-charge outcome only. Destructive actions use the separate Danger Red.

**The True Colours Rule.** DGT stickers, the ZBE disc and EU plates are drawn in
their real-world colours and shapes, including the Eco sticker's hard green/blue
split. They are depictions, not decoration.

## Typography

**Display Font:** Overpass Variable (with system-ui, -apple-system, Segoe UI,
Roboto, sans-serif) **Body Font:** Overpass Variable **Label/Mono Font:**
ui-monospace stack, for hashes and code only

**Character:** One Highway-Gothic-lineage family at every level, so headings
read like signage and figures read like a meter. Weight does the hierarchy work
(400 to 800), with slight negative tracking on headings.

### Hierarchy

- **Display** (800, fluid 2.25 to 3.6rem, 1.04): the Home hero headline only.
- **Headline** (800, fluid 1.75 to 2.25rem, 1.1): page title in each role's page
  head.
- **Section** (800, fluid 1.4 to 1.8rem): Home section titles.
- **Title** (750, 1.15rem): panel titles; step and principle terms use 800 at
  the same size.
- **Figure** (800, 1.75rem, -0.02em, tabular): stat values; balance tiles use
  1.6rem.
- **Body** (400, 1rem, 1.55): running text; lead paragraphs 1.05 to 1.15rem in
  Kerb Grey, capped at 54 to 62ch; result text at 70ch.
- **Label** (650, 0.875rem): field labels, stat labels, chip text; table headers
  0.8rem at 750.

### Named Rules

**The Tabular Figures Rule.** Every amount, countdown, charge number, plate and
stat uses tabular numerals.

**The Weight Ladder Rule.** Hierarchy comes from weight steps (650 labels and
buttons, 750 titles and statuses, 800 headings and figures), not from colour or
case. No uppercase labels.

## Layout

A single centred column with a 1240px max width and 2rem side gutters (1rem
below 1020px). Main content has 2.5rem top and 4rem bottom padding.

Role pages open with a page head (title, one-line purpose, signer chip pushed
right) closed by a 1px rule and 2rem gap, then panels in an auto-fit grid (min
320px) with 1.5rem gaps. Stats sit in a single bordered strip divided by
internal rules, auto-fit at 11rem. Forms are a wrapping row with fields of 10 to
18rem and the button aligned to the field baseline.

Home is a two-column hero (1.1fr : 1fr, 3rem gap) then sections separated by a
full-width rule with 3rem vertical padding: three numbered steps joined by a 2px
line, a ruled definition list of principles (16rem term column), and a bordered
list of roles.

Responsive: at 1020px the role navigation drops to its own row of five equal
columns with the icon above the label. At 900px the hero and steps stack (steps
become a vertical line). At 640px panels tighten to 1.25rem padding, form fields
go full width, and tables turn into per-row records with each cell labelled.

## Elevation & Depth

Flat. Depth comes from tonal layering (white panels on Cool Ground) and 1px
rules, never from shadows at rest. The only shadow in the system is the
transient toast. Inset rings stand in for borders where a border would shift
layout (Under-appeal status, sticker edge).

### Shadow Vocabulary

- **Toast lift** (`box-shadow: 0 6px 20px rgba(16, 21, 28, 0.14)`):
  notifications only, because they float over content.
- **Sticker edge** (`box-shadow: 0 0 0 1px` Rule): a hairline around
  white-bordered stickers on light ground; dropped on the blue road sign.
- **Appeal ring** (`box-shadow: inset 0 0 0 1.5px` Road Sign Blue): the
  Under-appeal status outline.

### Named Rules

**The Flat Panel Rule.** Panels, cards, tables and buttons carry no shadow. If
something needs separation, use a 1px rule or a ground-to-panel step.

## Shapes

Gently rounded rectangles for interface (8px controls, 12px panels, 6px
statuses), and true circles where the real world uses circles: stickers, the ZBE
disc, outcome signs and step numerals. The road sign keeps its real
construction: 18px outer radius, 6px blue margin, then a 3px white inner border
at 13px radius. Plates are near-square (5px) with a 2px ink border and a blue EU
band on the left. Pills (999px) are reserved for the signer chip and the network
pill.

## Components

### Buttons

- **Shape:** gently rounded (8px), 44px minimum height, 1px border, label weight
  650 at 0.95rem, icon gap 0.5rem.
- **Default:** Panel White with Rule border; hover moves to Cool Ground with a
  Kerb Grey border.
- **Primary:** Road Sign Blue fill and border, white text; hover Night Sign
  Blue.
- **Secondary (appeal):** white with blue text and blue border; hover Blue Wash.
- **Danger:** white with Danger Red text and a pale red border; hover Danger
  Wash with a red border.
- **Sizes:** small (36px, 0.875rem) for table actions; big (56px, 1.1rem) for
  the camera's single "Car enters" action.
- **Disabled:** 50% opacity, not-allowed cursor. Transitions are 0.15s ease-out
  on colour only.
- **Link buttons** on Home mirror default and primary at 52px.

### Chips

- **Signer chip:** white pill, Rule border, Kerb Grey text with the signer's
  name in ink and a signature icon. It sits at the right of every role page
  head.

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** Panel White on Cool Ground.
- **Shadow Strategy:** none (see The Flat Panel Rule).
- **Border:** 1px Rule.
- **Internal Padding:** 1.5rem (1.25rem on phones). Tables bleed to the panel
  edges with a Cool Ground header band.

### Inputs / Fields

- **Style:** white, 1px Kerb Grey border, 8px radius, 44px height, 1rem text;
  label above at 0.875rem/650.
- **Focus:** 3px Road Sign Blue outline and blue border. Global focus-visible is
  a 3px blue outline with 2px offset.

### Navigation

- **Header:** sticky white bar with a bottom rule; ZBE disc plus "ZBE Toll"
  wordmark at 800, then role links with icons in Kerb Grey at 650. Hover goes to
  ink; the active role gets blue text and a 3px blue underline that sits on the
  bar's rule. On narrow screens the links become a five-column icon-over-label
  row.

### Status signs

- Small 6px-radius badges with a bold icon and a plain-English word: Locked
  (amber pair), Under appeal (white with blue inset ring), Collected (green
  pair), Cancelled (ground and grey). Countdown text sits beside a Locked status
  in amber with a timer icon.

### DGT sticker (signature)

- 2.1rem circle with a 2px white border and a hairline edge, label text at 800:
  "B" on yellow with ink text, "C" on green, "ECO" on the green/blue split at a
  smaller size, "0" on blue, and a dashed grey empty disc for no label. Always
  exposed to assistive tech as "Environmental label: …".

### EU number plate (signature)

- Inline plate: 2px ink border, 5px radius, blue band with a yellow "E",
  characters at 800 with 0.08em tracking and tabular figures. When only the HMAC
  is known the hash is shown as code, never dressed as a plate.

### Road sign panel (signature)

- Blue information panel with a white inner border that holds the ZBE disc, the
  zone name and rule rows separated by translucent white rules. Rules are read
  live from the contract.

### Outcome sign and result row (signature)

- Each camera reading enters at the top of the Readings panel as a row: a 44px
  outcome sign (blue disc with check for free entry, red ring with padlock for a
  locked charge, grey ring with a bar for no pass), the plate, a one-line
  headline and a timestamped explanation. Rows enter with a 0.35s fade-and-drop
  (`cubic-bezier(0.16, 1, 0.3, 1)`), suppressed under reduced motion.

### Balance tiles

- Two side-by-side tiles in the Driver's pass panel: Available (Blue Wash, blue
  label) and Locked (Locked Amber pair, padlock), each with a 1.6rem tabular
  figure.

## Do's and Don'ts

### Do:

- **Do** keep panels flat: white, 1px Rule border, 12px radius, 1.5rem padding.
- **Do** use Road Sign Blue for the one primary action on a screen, and for
  appeal actions as an outline.
- **Do** show money state with the fixed pairs: amber for locked, green for
  collected, grey for cancelled or nothing charged.
- **Do** draw labels as DGT stickers and vehicles as EU plates wherever a label
  or vehicle appears.
- **Do** set every amount, plate, countdown and stat in tabular figures.
- **Do** pair every status colour with an icon and a word.
- **Do** keep a 44px minimum target for buttons and inputs.

### Don't:

- **Don't** add drop shadows to panels, cards or buttons; only toasts float.
- **Don't** use ZBE Ring Red for buttons, text or fills; destructive actions use
  Danger Red.
- **Don't** colour the Appeal action or Under-appeal status red.
- **Don't** use decorative gradients; the Eco sticker's hard split is a
  depiction of the real sticker, not a gradient style.
- **Don't** introduce a dark theme or neon accents; the scheme is light only.
- **Don't** show a plate in clear text where this browser does not know it; show
  the hash.
