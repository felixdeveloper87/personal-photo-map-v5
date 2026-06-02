---
name: refined-blue-style
description: Use when redesigning or building landing pages / marketing UI that should look professional and NOT "AI-made" — when the user asks to "repaginar", "deixar mais profissional/leve", "sem parecer AI", apply a senior product-designer look, or reuse "esse estilo". Applies the Refined Blue design system: one brand accent on neutral surfaces, calm motion, editorial type, bento showcase. Targets React + Chakra UI + framer-motion.
---

# Refined Blue — professional landing/UI style

A restrained, editorial design system that reads as a senior product designer's work
(Material 3 / Apple-bento sensibility), not as generated UI. The whole idea is
**restraint with intent**: one brand colour used purposefully, neutral surfaces,
calm motion, and generous whitespace.

## The 7 "AI-made" tells to eliminate first

Before adding anything, hunt and remove these — they are what makes UI look generated:

1. **Rainbow of gradients** — every card/icon/badge with its own multi-colour gradient
   (blue→cyan, purple→pink, green→teal…). → Collapse to **one** brand colour; cards stay neutral.
2. **Coloured glows & heavy shadows** — radial glows, coloured `box-shadow` everywhere.
   → Single soft **neutral** shadow.
3. **Animation overload** — `scale + rotate` on hover, springs, shimmer/sweep `_before`,
   spinning icons. → One calm motion: fade + 8–16px rise, ~0.5s, staggered.
4. **Giant gradient badges** (`fontSize="lg" px={8} py={4}`) and **gradient text headings**.
   → Small uppercase **eyebrow** with a short rule; solid-ink headings with at most one accent word.
5. **Inconsistent rhythm** — sections jumping between `py={10}` and `py={24}`.
   → One vertical rhythm (`py={{ base: 16, md: 24 }}`), 8px spacing grid.
6. **Emoji avatars / flag emojis** (👩‍🏫 🇯🇵) and fake-looking testimonials.
   → Monogram initials in a neutral circle; real flags via `react-world-flags`
   (emoji flags don't even render on Windows).
7. **Repetition** — three near-identical feature sections stacked.
   → Consolidate into one **bento** showcase that *shows the product*.

## Process

1. **Diagnose** the existing components; name which of the 7 tells are present.
2. **Ask two taste forks** (they change the build) before coding, with previews:
   - Brand personality / single accent colour (e.g. Refined Blue, Editorial Indigo, Scholar Emerald).
   - Structure: consolidate & lighten vs. restyle every section.
3. **Build a shared token + primitives module** (below) so the page is consistent and DRY.
4. **Rewrite sections** to use the primitives.
5. **Verify**: run the build AND lint for `no-undef` (see Gotchas). Keep dark mode working.

## Design tokens (Refined Blue default)

One accent on warm neutrals. Accent (`#F59E0B`) is reserved for rare highlights (rating stars).

```
primary #2563EB · primaryHover #1D4ED8 · accent #F59E0B
text #0F172A/#F8FAFC · textSoft #475569/#9FB0C8 · textMuted #64748B
surface #FFFFFF/#0E1424 · surfaceSubtle #F8FAFC/#0A0F1C
hairline #E5E7EB/rgba(255,255,255,.08) · hairlineStrong #D5DBE3/rgba(255,255,255,.16)
shadowSm  0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.05)
shadowMd  0 8px 24px -10px rgba(15,23,42,.12)
shadowLg  0 24px 50px -20px rgba(15,23,42,.20)
```

Implement as a `useLandingTokens()` hook (one `useColorModeValue` per token, all called
unconditionally) plus primitives, in a single `landingUI.jsx`. Everything pulls from it.

```jsx
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};
export const MotionBox = motion.create(Box);
```

## Primitives (build these, then compose)

- **`Eyebrow`** — short 22px primary rule + uppercase 12px primary label. Replaces big badges.
- **`SectionHeading`** — eyebrow + 800-weight ink `<h2>` (`letterSpacing -0.02em`) + soft subtitle.
- **`SurfaceCard`** — `surface` bg, 1px `hairline` border, 20px radius, `shadowSm`;
  hover = `hairlineStrong` border + `shadowMd` + `translateY(-3px)`. No colour, no rotate.
- **`LandingButton`** — `primary` (solid brand, hover `primaryHover` + `translateY(-1px)`) and
  `secondary` (transparent, hairline border → primary on hover). 14px radius, weight 600.
  No shimmer, no gradient.

## Section patterns

- **Hero**: eyebrow → heading with ONE accent word (e.g. `<span color={primary}>`) → soft
  subtitle → primary + secondary button → inline stat row (icon + value). On the right, a
  **real product specimen** in a neutral framed card (reuse the actual app component, e.g. a
  static map), not a decorative mock.
- **Bento showcase** (the centrepiece): one `Grid` `repeat(12)`, rows that sum to 12
  (e.g. 7+5, then 4+4+4). Each cell is a neutral card whose *visual shows the product*:
  a real map, a data card with labelled bars (GDP/etc), a date timeline, a 9:16 video frame,
  a trust/sources cell. Single primary accent; icon in a `primarySoftBg` tile.
- **How it works**: 4 neutral step cards, small `01–04` label + primary icon tile. No 100px ghost numbers.
- **Social proof**: 3 lean cards, monogram initials, stars in `accent` (amber). No emoji.
- **CTA**: light bordered panel on `surfaceSubtle`, centred eyebrow + heading + two buttons +
  inline check perks. Not a dark glowing slab.

## Do / Don't

- DO use one accent; reserve amber only for stars. DON'T reintroduce per-card gradients.
- DO neutral hairline borders + soft shadow. DON'T use coloured glows.
- DO fade+rise once. DON'T add rotate/shimmer/spring.
- DO real flags (`<Flag code="JP" fallback={…} />`) & monograms. DON'T use emoji as data/avatars.
- DO consolidate repeated sections into a bento. DON'T stack near-identical grids.

## Gotchas (learned the hard way)

- **The build (Vite/rollup) does NOT catch missing imports / undefined components** — a
  `<MiniMap/>` used without `import` compiles fine, then white-screens at runtime with
  "X is not defined". After editing, **lint for `no-undef`** and double-check every component
  you reference is imported.
- `useColorModeValue` / any hook must be called **unconditionally** (not inside a ternary or
  `.map`). Put all token hooks at the top of the component/hook.
- Keep light AND dark mode values for every token.
- Reusing an interactive map (Leaflet) as a specimen: give it a **static mode** (disable
  dragging) and a definite height; rely on `invalidateSize` for late layout.

## Reference implementation

In this repo the system already exists at
`frontend/src/components/features/landing/landingUI.jsx` (tokens + primitives) and is used by
`HeroSection`, `BentoShowcase`, `HowItWorksSection`, `TestimonialsSection`, `CTASection`, and
the `Footer`. Read those before extending so new work matches.
