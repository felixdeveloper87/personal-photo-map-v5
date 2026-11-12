// theme.jsx — Chakra theme built on the Atlas design tokens (src/design/tokens.js).
import { extendTheme } from '@chakra-ui/react';
import { color, font, palette, radius, shadow, tones } from './design/tokens';

// Fixed dark cartographic identity — no user-facing theme switching.
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Fonts actually loaded in index.html (the old Montserrat/Inter were never loaded).
const fonts = {
  heading: font.sans,
  body: font.sans,
  mono: font.mono,
  display: font.display,
};

/**
 * Colour scales. The app is dark-only and Chakra's dark mode reads the `.200`
 * shade for filled controls (checkbox, switch, progress, slider), so `.200` is
 * each tone's main colour.
 */
const colors = {
  brand: {
    50: '#FCF5EA', 100: palette.amber[400], 200: palette.amber[500], 300: palette.amber[600],
    400: palette.amber[700], 500: '#C98843', 600: '#A46A2F', 700: '#7A4E22', 800: '#4F3216', 900: '#2E1D0C',
  },
  accent: {
    50: '#E9FAF7', 100: palette.teal[400], 200: palette.teal[500], 300: palette.teal[600],
    400: '#3E9A8F', 500: '#2F7D74', 600: '#245F58', 700: '#19423D', 800: '#0F2724', 900: '#071412',
  },
  danger: {
    50: '#FCEEEB', 100: palette.rose[400], 200: palette.rose[500], 300: palette.rose[600],
    400: '#B5574A', 500: '#93463B', 600: '#70352D', 700: '#4D241F', 800: '#2B1411', 900: '#160A08',
  },
  ink: palette.ink,
};

const styles = {
  global: {
    body: {
      bg: color.bg,
      color: color.text,
      fontFamily: 'body',
    },
    '::selection': { background: 'rgba(235,181,114,0.32)', color: color.text },
  },
};

/* ─── Form fields: one recessed "well" style for every input ──────── */
const fieldBase = {
  bg: color.surfaceSubtle,
  border: '1px solid',
  borderColor: 'rgba(236,231,220,0.12)',
  color: color.text,
  borderRadius: radius.md,
  transition: 'border-color .15s ease, box-shadow .15s ease, background .15s ease',
  _placeholder: { color: color.textMuted },
  _hover: { borderColor: color.hairlineMid },
  _focusVisible: {
    borderColor: color.primary,
    boxShadow: `0 0 0 3px ${color.focusRing}`,
  },
  _invalid: {
    borderColor: color.rose,
    boxShadow: '0 0 0 3px rgba(229,138,123,0.18)',
  },
  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
};

const fieldTheme = {
  variants: {
    outline: {
      field: fieldBase,
      addon: { bg: color.surfaceSolid, borderColor: 'rgba(236,231,220,0.12)', color: color.textSoft, borderRadius: radius.md },
      element: { color: color.textMuted },
    },
  },
  sizes: {
    md: { field: { h: '44px', fontSize: 'sm', px: 3.5 }, addon: { h: '44px' }, element: { h: '44px', w: '44px' } },
    lg: { field: { h: '52px', fontSize: 'md', px: 4 }, addon: { h: '52px' }, element: { h: '52px', w: '52px' } },
  },
  defaultProps: { variant: 'outline', size: 'md' },
};

// Chakra maps alert/toast status → colorScheme (success=green, error=red, warning=orange, info/loading=blue).
const ALERT_TONE = {
  green: tones.success.fg,
  red: tones.danger.fg,
  orange: tones.warning.fg,
  yellow: tones.warning.fg,
  blue: tones.info.fg,
};

const components = {
  // Buttons keep their previous defaults; the Atlas variants are opt-in.
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    sizes: {
      md: {
        h: '40px',
        px: '20px',
        fontSize: 'md',
      },
    },
    variants: {
      solid: (props) => ({
        bg: `${props.colorScheme}.500`,
        color: props.colorMode === 'light' ? 'white' : 'gray.900',
        _hover: {
          bg: `${props.colorScheme}.600`,
        },
      }),
      outline: (props) => ({
        border: '2px solid',
        borderColor: props.colorMode === 'light' ? 'teal.900' : 'teal.300',
        color: props.colorMode === 'light' ? 'teal.600' : 'teal.200',
        _hover: {
          bg: props.colorMode === 'light' ? 'teal.50' : 'gray.700',
        },
      }),
    },
    defaultProps: {
      variant: 'solid',
      size: 'md',
      colorScheme: 'teal',
    },
  },

  Input: fieldTheme,
  Select: {
    ...fieldTheme,
    baseStyle: {
      field: { '> option, > optgroup': { bg: color.surfaceSolid, color: color.text } },
      icon: { color: color.textMuted },
    },
  },
  NumberInput: {
    ...fieldTheme,
    baseStyle: {
      stepper: {
        borderColor: 'rgba(236,231,220,0.12)',
        color: color.textMuted,
        _hover: { color: color.primary, bg: color.primarySoftBg },
      },
    },
  },
  Textarea: {
    variants: { outline: { ...fieldBase, py: 3 } },
    defaultProps: { variant: 'outline' },
  },

  Form: {
    baseStyle: {
      helperText: { color: color.textMuted, fontSize: 'xs', mt: 1.5 },
      requiredIndicator: { color: color.rose },
    },
  },
  // Opt-in (`variant="atlas"`) so existing inline labels elsewhere keep their look.
  FormLabel: {
    variants: {
      atlas: {
        fontFamily: font.mono,
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: color.textSoft,
        mb: 2,
      },
    },
  },
  FormError: {
    baseStyle: { text: { color: color.rose, fontSize: 'xs', mt: 1.5 }, icon: { color: color.rose } },
  },

  Checkbox: {
    baseStyle: {
      control: {
        borderRadius: '5px',
        borderColor: color.hairlineMid,
        bg: color.surfaceSubtle,
        _checked: { color: color.textOnBrand },
        _focusVisible: { boxShadow: `0 0 0 3px ${color.focusRing}` },
      },
      label: { color: color.textSoft },
    },
    defaultProps: { colorScheme: 'brand' },
  },
  Radio: { defaultProps: { colorScheme: 'brand' } },
  Switch: { defaultProps: { colorScheme: 'brand' } },
  Slider: { defaultProps: { colorScheme: 'brand' } },
  Progress: {
    baseStyle: { track: { bg: 'rgba(236,231,220,0.08)' } },
    defaultProps: { colorScheme: 'brand' },
  },
  Spinner: { baseStyle: { color: color.primary } },

  /*
   * Alerts — also what every useToast() renders (variant "solid"). Instead of the
   * light-theme solid green/red/orange/blue blocks, toasts become raised dark cards
   * with a tone accent.
   */
  Alert: {
    variants: {
      solid: (props) => {
        const fg = ALERT_TONE[props.colorScheme] || color.primary;
        return {
          container: {
            bg: color.surfaceRaised,
            color: color.text,
            border: '1px solid',
            borderColor: color.hairlineMid,
            borderLeft: '3px solid',
            borderLeftColor: fg,
            borderRadius: radius.md,
            boxShadow: shadow.lg,
          },
          icon: { color: fg },
          spinner: { color: fg },
          title: { fontWeight: 700, fontSize: 'sm' },
          description: { color: color.textSoft, fontSize: 'sm' },
        };
      },
      subtle: (props) => {
        const fg = ALERT_TONE[props.colorScheme] || color.primary;
        return {
          container: { bg: 'rgba(236,231,220,0.03)', border: '1px solid', borderColor: color.hairlineMid, borderRadius: radius.md },
          icon: { color: fg },
          description: { color: color.textSoft },
        };
      },
    },
  },

  Divider: { baseStyle: { borderColor: color.hairline, opacity: 1 } },
  Kbd: {
    baseStyle: {
      bg: color.surfaceSolid,
      borderColor: color.hairlineMid,
      color: color.textSoft,
      fontFamily: font.mono,
      fontSize: '10px',
    },
  },
  Tooltip: {
    baseStyle: {
      bg: color.surfaceRaised,
      color: color.text,
      border: '1px solid',
      borderColor: color.hairlineMid,
      borderRadius: radius.sm,
      fontSize: 'xs',
      fontWeight: 500,
      px: 2.5,
      py: 1.5,
      boxShadow: shadow.md,
      '--popper-arrow-bg': color.surfaceRaised,
    },
  },

  /*
   * Every Chakra Modal / AlertDialog gets the Atlas shell by default.
   * BaseModal (components/modals/BaseModal.jsx) layers the header anatomy and
   * mobile bottom-sheet behaviour on top of this.
   */
  Modal: {
    baseStyle: {
      overlay: { bg: color.overlay, backdropFilter: 'blur(8px)' },
      dialog: {
        bg: color.surfaceRaised,
        color: color.text,
        border: '1px solid',
        borderColor: color.hairline,
        borderRadius: radius.xl,
        boxShadow: shadow.modal,
      },
      header: { fontFamily: font.display, fontWeight: 400, fontSize: '1.6rem', lineHeight: 1.1, color: color.text },
      closeButton: {
        borderRadius: '10px',
        color: color.textMuted,
        _hover: { bg: color.surfaceHover, color: color.text },
      },
      body: { color: color.textSoft },
      footer: { borderTop: '1px solid', borderColor: color.hairline },
    },
  },
};

const theme = extendTheme({
  config,
  fonts,
  colors,
  styles,
  components,
});

export default theme;
