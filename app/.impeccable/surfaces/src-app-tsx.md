---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages"]
---

# Surface brief: ZBE Toll web app (all routes)

Scope: Home (`/`, Persuade) and the role screens Driver, Camera, City Hall, Arbiter, DGT (Operate). Audience: hackathon jury watching it projected, and real drivers / city staff. Constraints: English UI, name "ZBE Toll", AA contrast, readable when projected, no gradients or generic shadowed cards, no neon dark mode.

User steer: chose the Road Sign System but "too much, not intuitive": keep the signage identity, restrained; intuitive first.

## Direction contract

THESIS: The app speaks the language a driver already reads at the zone boundary (Spanish road-sign blue, the red-ringed ZBE sign, the DGT label stickers) but only where it carries meaning; it refuses the gradient hero over a row of shadowed emoji cards.

OWN-WORLD: Cool light-grey ground (#F3F5F8), white flat panels with 1px rules, signage blue #0B4EA2 for primary actions, active nav and the zone-rules sign; red #C8102E reserved for the ZBE ring and destructive actions. DGT labels drawn as round stickers in their real colours. Overpass (Highway-Gothic lineage) for everything, tabular figures; EU number plates for vehicles.

STORY: The visitor learns the rule in one sign (who enters free, who pays, who pays nothing), then follows three numbered steps through the roles and sees money locked, appealed, collected or returned.

FIRST VIEWPORT: Left: kicker, headline (two short lines), one-sentence explanation, primary "Start: send a car through the camera" button. Right: a medium blue road-sign panel for zone centro with the ZBE ring and three rule lines read live from the contract. Below the fold: the 3-step demo path.

FORM: Road Sign System, restrained; position 1 on own list (IMPECCABLE'S PICK, user choice). seed:c964c17a4e0866fd. Signature interaction: a camera reading drops a new result row whose status sign states the outcome; status changes and countdowns update in place.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
