import { color } from '../design/tokens';

// Atlas header styles (kept as hooks for backwards compatibility with existing call sites).
export const useHeaderStyles = () => ({
  accentColor: color.primary,
  accentColorHover: color.primaryHover,
  logoTextColor: color.text,
  logoSubtextColor: color.textMuted,
});

export const useHeaderContainerStyles = () => ({
  w: '100%',
  bg: 'rgba(10,12,17,0.86)',
  backdropFilter: 'blur(20px) saturate(1.2)',
  borderBottom: '1px solid',
  borderColor: color.hairline,
  boxShadow: '0 1px 0 rgba(0,0,0,0.4), 0 12px 32px -20px rgba(0,0,0,0.8)',
  py: { base: 2, sm: 3, md: 3.5 },
});

export const logoStyles = () => ({
  align: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.2s ease',
  flexShrink: 0,
});
