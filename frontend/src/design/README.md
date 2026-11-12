# Atlas — PhotoMap design system

A dark, cartographic night-map. Warm cream ink on deep blue-black, **one** amber brand
colour, two supporting map tones (teal, rose). Calm surfaces, hairline borders, serif
titles, mono labels.

- Tokens: [`tokens.js`](./tokens.js) — the only place raw colours/fonts/radii live.
- Chakra theme: [`../theme.jsx`](../theme.jsx) — inputs, selects, checkboxes, tooltips and
  every `Modal` get the Atlas look automatically.
- Modal kit: [`../components/modals/`](../components/modals/) — `BaseModal`, `ModalButton`, `ModalKit`.
- `useLandingTokens()` still works and returns the same tokens as a flat object.

## Principles

1. **One accent per view.** Amber marks the single most important thing (the primary
   action, the active state). If everything is amber, nothing is.
2. **Tones carry meaning.** brand/amber = primary & warning · teal = success & positive
   data · rose = danger & errors · steel = info · neutral = everything else.
3. **Depth by surface, not by colour.** Page `bg` → glass `surface` → `surfaceRaised`
   (modals, menus) → `surfaceSubtle` wells (inputs, insets). Borders are hairlines.
4. **Three voices of type.** Serif for titles, sans for reading, mono for labels & data.
5. **Mobile first, iOS aware.** Sheets rise from the bottom; respect `env(safe-area-inset-*)`.

## Colour

| Token | Use |
|---|---|
| `color.bg` / `bg2` | Page background |
| `color.surface` | Glass cards on the page |
| `color.surfaceRaised` | Modals, popovers, menus |
| `color.surfaceSubtle` | Recessed wells — inputs, inset panels |
| `color.text` / `textSoft` / `textMuted` | Primary / secondary / captions |
| `color.textOnBrand` | Text on amber fills (never white on amber) |
| `color.hairline` / `hairlineMid` | Default / emphasised borders |
| `color.primary` (+ `primarySoftBg`, `primarySoftBorder`) | Brand amber |
| `color.focusRing` | `0 0 0 3px` focus ring on every interactive element |

Tinted backgrounds always come from `tones.<name>` (`fg`, `soft`, `softer`, `border`, `glow`)
— never write `rgba(...)` by hand in a component.

## Typography

| Style (`type.*`) | Font | Use |
|---|---|---|
| `displayLg` / `display` | Instrument Serif | Page titles / modal titles |
| `title` | Schibsted Grotesk 700 | Card & row titles |
| `body` / `caption` | Schibsted Grotesk | Reading text |
| `eyebrow` | Spline Sans Mono, caps, tracked | Section labels above titles |
| `label` | Spline Sans Mono, caps, 10px | Stat labels, badges, field labels |
| `data` | Spline Sans Mono 700 | Numbers, metrics |

Usage: `<Text {...type.eyebrow} color={color.primary}>Sign in</Text>`.

## Shape & motion

Radii: `sm 8` chips · `md 12` buttons, inputs · `lg 16` cards, panels · `xl 20` modals.
Motion: `.15s` hovers, `.2s` state changes; lift buttons by 1px at most; no bounce.

## Modals

```jsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  eyebrow="Account"            // mono label in the tone colour
  title="Photo storage"        // serif title
  subtitle="Optional one-liner"
  icon={HiCloudArrowUp}        // react-icons/hi2
  tone="teal"                  // brand | teal | rose | danger | info …
  size={{ base: 'full', sm: 'md', md: 'lg' }}
  footer={
    <ModalActions>
      <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
      <ModalButton variant="primary" onClick={save}>Save</ModalButton>
    </ModalActions>
  }
>
  …
</BaseModal>
```

Anatomy: tone hairline · header (icon tile, eyebrow, serif title, subtitle, close) ·
scrollable body · sticky footer. Desktop = centred dialog; mobile = bottom sheet with a
grab handle and safe-area padding.

### Rules

- **Actions live in the footer**, inside `<ModalActions>`: secondary first, primary last.
  Desktop shows them right-aligned; mobile stacks them full-width with primary on top.
- **One primary button** per modal. Destructive confirmations use `variant="danger"`
  and focus the cancel button first (`ConfirmDialog` does this).
- Forms: give the `<form>` an `id` and the footer button `type="submit" form={id}` so
  Enter submits.
- Use `ModalNotice` instead of Chakra `Alert`; `ModalState` for loading / empty / error.
- No `useColorModeValue`, no Chakra palette names (`blue.500`, `gray.700`) — tokens only.

### Kit reference (`components/modals/ModalKit.jsx`)

| Component | For |
|---|---|
| `ModalActions` | Footer button row |
| `ModalSection` | Titled group (mono eyebrow + optional right action) |
| `Panel` | Inset container; `tone` tints it, `interactive` adds hover |
| `ModalDivider` | Hairline, optionally labelled ("or continue with") |
| `IconTile` | Icon in a toned square |
| `ToneBadge` | Status pill |
| `Chip` / `Segmented` | Selectable options |
| `ModalStat` | Metric tile |
| `ToneProgress` | Thin progress bar |
| `ModalNotice` | Inline callout (info/success/warning/danger) |
| `ModalState` | Centred loading / empty / error state |
| `ModalField` | Label + icon + input + error; password show/hide built in |
| `CheckItem` | Bullet row with a check icon |

`ModalButton` variants: `primary` · `secondary` · `ghost` · `outline` · `danger` · `success`.
`ConfirmDialog` (`components/ui/ConfirmDialog.jsx`) covers every "are you sure?".

## Migrating a screen

1. Replace hard-coded hex / `rgba` / Chakra palette colours with `color.*` / `tones.*`.
2. Replace `fontFamily` strings with `font.*` or a `type.*` style.
3. Remove `useColorModeValue` (the app is dark-only).
4. Swap bespoke cards/alerts/buttons for kit components.
