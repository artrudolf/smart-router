# DESIGN.md — Smart Cashier

## Personality
Serious, technical, expensive, calm, precise, infrastructure-grade. Not casino, crypto,
cyberpunk, or generic SaaS. DESIGN_VARIANCE 5/10 · MOTION_INTENSITY 4/10 · VISUAL_DENSITY 5/10.

## Tokens (assets/css/main.css)
Background #0b100e (deep green-black), raised #0f1613, sunken #080d0b.
Text: #f2f0e8 (warm off-white), secondary #97a29a, faint #5d6963.
Accents: mint #62d9a6 (success/active route, primary CTA), aqua #6cc3d5 (active info),
amber #d9a441 (degraded, "Illustrative scenario"/"Demo data" tags only),
red #d97066 (failed routes only). Borders: rgba(242,240,232,.09).
Radius 10/16px. No purple gradients, no neon glow, no particles.

## Type
Manrope 400-800 for headings and body; IBM Plex Mono 400/500 for labels, routing values,
technical annotations, eyebrows. H1 clamp(34-58px), tight leading, -0.02em tracking.

## Layout
1120px container. Full-width sections with thin dividers; asymmetric two-column blocks
(hero, interface); features as ledger-style rows, not identical cards; cards only for
containment (calculator, plans, scenarios, modals). Generous negative space.

## Motion
Purposeful only: hero routing loop (deposit enters, signals light, Provider B degrades,
traffic shifts to A, approved, caption explains), soft section reveals, modal fade,
controlled hovers. No bounce, elastic, parallax, or background motion.
prefers-reduced-motion: loop stops and shows the final state; reveals render instantly.

## Diagrams
Routing visual, flow diagram, and interface mock are inline SVGs with mono labels,
box fills #080d0b, health dots (mint/amber/red), and mint route strokes.

## Demo (/demo/)
Product-UI theme (navy #080c14, blue #3b82f6, Space Grotesk/Inter) is intentionally distinct
from the marketing site: the site sells the infrastructure, the demo shows the player-facing
cashier. Every screen carries a Demo data label and an amber demo-environment banner.


## v2 additions
- Qualification strip (mono, thin borders) under the hero.
- Data-input chips, 5-stage pilot timeline, operator-view SVG panel with routing log.
- Build-vs-license 3-column grid, architecture flow nodes, team card, dashed secondary Cloud block.
- Hero animation captions explain the decision: context -> degradation -> route by 60-minute approval -> approved.
- Demo emphasizes "success rate, last 60 min" on the analyzing, methods, and receipt screens.
