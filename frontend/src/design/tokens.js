/**
 * Atlas — PhotoMap design tokens.
 *
 * Single source of truth for the visual language: a dark, cartographic night-map
 * with warm cream ink, one amber brand colour and two supporting map tones.
 * Everything else (Chakra theme, landing tokens, modal kit) reads from here.
 *
 * See ./README.md for usage rules.
 */

/* ─── Raw palette ─────────────────────────────────────────────── */
export const palette = {
  ink: {
    950: '#05070B', // overlay base
    900: '#0A0C11', // page background
    850: '#0E1118', // secondary background
    800: '#11151E', // solid surface
    750: '#151A25', // raised surface (modals, popovers)
    700: '#1B2130', // hover on raised
  },
  cream: {
    100: '#ECE7DC', // primary text
    300: '#B8B0A2', // secondary text
    500: '#8B90A0', // muted text / captions
    700: '#5C6170', // disabled
  },
  amber: { 300: '#F3CF98', 400: '#F1C98D', 500: '#EBB572', 600: '#DFA25E', 700: '#D79A55' },
  teal: { 400: '#8ADBD1', 500: '#6FD0C4', 600: '#4FB8AB' },
  rose: { 400: '#EDA597', 500: '#E58A7B', 600: '#D06E5F' },
  steel: { 400: '#A9C1E3', 500: '#8AA9D6', 600: '#6E8FC0' },
};

/* ─── Semantic colours ────────────────────────────────────────── */
export const color = {
  bg: palette.ink[900],
  bg2: palette.ink[850],

  surface: 'rgba(20,24,33,0.74)', // glass card on the page
  surfaceSolid: palette.ink[800],
  surfaceRaised: palette.ink[750], // modals, menus
  surfaceSubtle: 'rgba(8,10,15,0.55)', // wells: inputs, inset panels
  surfaceHover: 'rgba(236,231,220,0.04)',

  text: palette.cream[100],
  textSoft: palette.cream[300],
  textMuted: palette.cream[500],
  textDisabled: palette.cream[700],
  textOnBrand: '#1A120A', // text on amber fills (AA contrast)

  hairline: 'rgba(236,231,220,0.09)',
  hairlineMid: 'rgba(236,231,220,0.16)',
  hairlineStrong: 'rgba(235,181,114,0.32)',

  primary: palette.amber[500],
  primaryHover: palette.amber[400],
  primaryActive: palette.amber[700],
  primarySoftBg: 'rgba(235,181,114,0.10)',
  primarySoftBorder: 'rgba(235,181,114,0.24)',

  accent: palette.teal[500],
  accentSoftBg: 'rgba(111,208,196,0.12)',
  rose: palette.rose[500],

  focusRing: 'rgba(235,181,114,0.28)',
  overlay: 'rgba(5,7,11,0.68)',
};

/**
 * Tones — every coloured accent in the UI picks one of these.
 * brand/teal/rose are the three map tones; info/success/warning/danger are
 * their semantic aliases for notices, badges and validation.
 */
const tone = (fg, rgb) => ({
  fg,
  soft: `rgba(${rgb},0.10)`,
  softer: `rgba(${rgb},0.06)`,
  border: `rgba(${rgb},0.30)`,
  glow: `rgba(${rgb},0.22)`,
});

export const tones = {
  brand: tone(palette.amber[500], '235,181,114'),
  teal: tone(palette.teal[500], '111,208,196'),
  rose: tone(palette.rose[500], '229,138,123'),
  steel: tone(palette.steel[500], '138,169,214'),
  neutral: tone(palette.cream[300], '236,231,220'),
};
tones.amber = tones.brand;
tones.info = tones.steel;
tones.success = tones.teal;
tones.warning = tones.brand;
tones.danger = tones.rose;

export const resolveTone = (name) => tones[name] || tones.brand;

/* ─── Typography ──────────────────────────────────────────────── */
export const font = {
  display: "'Instrument Serif', Georgia, serif", // titles, big numbers in prose
  sans: "'Schibsted Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif", // UI + body
  mono: "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace", // eyebrows, data, labels
};

/** Named text styles — spread into <Text {...type.eyebrow}>. */
export const type = {
  displayLg: { fontFamily: font.display, fontWeight: 400, fontSize: { base: '2rem', md: '2.6rem' }, lineHeight: 1.04, letterSpacing: '-0.01em' },
  display: { fontFamily: font.display, fontWeight: 400, fontSize: { base: '1.6rem', sm: '1.85rem' }, lineHeight: 1.08, letterSpacing: '-0.005em' },
  title: { fontFamily: font.sans, fontWeight: 700, fontSize: 'md', lineHeight: 1.3 },
  body: { fontFamily: font.sans, fontWeight: 400, fontSize: 'sm', lineHeight: 1.6 },
  caption: { fontFamily: font.sans, fontWeight: 400, fontSize: 'xs', lineHeight: 1.5 },
  eyebrow: { fontFamily: font.mono, fontWeight: 600, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', lineHeight: 1.2 },
  label: { fontFamily: font.mono, fontWeight: 600, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.2 },
  data: { fontFamily: font.mono, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.1 },
};

/* ─── Shape, depth, motion ────────────────────────────────────── */
export const radius = {
  sm: '8px', // chips, small controls
  md: '12px', // buttons, inputs, inner cards
  lg: '16px', // cards, panels
  xl: '20px', // modals, sheets
  full: '999px',
};

export const shadow = {
  sm: '0 1px 2px rgba(0,0,0,0.36)',
  md: '0 18px 44px -24px rgba(0,0,0,0.72)',
  lg: '0 34px 90px -38px rgba(0,0,0,0.88)',
  modal: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 100px -30px rgba(0,0,0,0.9)',
  brandGlow: '0 14px 36px -12px rgba(235,181,114,0.5)',
};

export const motion = {
  fast: '.15s ease',
  base: '.2s ease',
  slow: '.35s ease',
  easeOut: [0.22, 1, 0.36, 1],
};

/** Amber fill used by primary actions (matches the landing CTA). */
export const brandGradient = 'linear(180deg, #F3CF98, #EBB572 55%, #DFA25E)';
export const brandGradientHover = 'linear(180deg, #F7DBAE, #F1C98D 55%, #E5AC6A)';
