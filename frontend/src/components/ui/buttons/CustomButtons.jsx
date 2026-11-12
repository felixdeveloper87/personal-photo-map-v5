import { Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { HiTrash } from 'react-icons/hi2';
import { brandGradient, brandGradientHover, color, radius, shadow, tones } from '../../../design/tokens';

const MotionButton = motion.create(Button);

/**
 * Atlas page buttons. The legacy `gradient` names map onto the Atlas variants:
 *   primary / premium / success / secondary → amber primary
 *   neutral                                  → glass secondary
 *   danger / warning                         → quiet rose (the solid red lives in ConfirmDialog)
 *   info                                     → steel outline
 */
const STYLES = {
  primary: {
    bgGradient: brandGradient,
    color: color.textOnBrand,
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.16)',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), ${shadow.brandGlow}`,
    _hover: { bgGradient: brandGradientHover },
  },
  neutral: {
    bg: 'rgba(236,231,220,0.04)',
    color: color.text,
    border: '1px solid',
    borderColor: color.hairlineMid,
    _hover: { bg: 'rgba(236,231,220,0.08)', borderColor: 'rgba(236,231,220,0.28)' },
  },
  danger: {
    bg: tones.danger.softer,
    color: tones.danger.fg,
    border: '1px solid',
    borderColor: tones.danger.border,
    _hover: { bg: tones.danger.soft, borderColor: tones.danger.fg },
  },
  info: {
    bg: 'transparent',
    color: tones.info.fg,
    border: '1px solid',
    borderColor: tones.info.border,
    _hover: { bg: tones.info.soft },
  },
};

const ALIAS = {
  primary: 'primary',
  premium: 'primary',
  success: 'primary',
  secondary: 'primary',
  neutral: 'neutral',
  danger: 'danger',
  warning: 'danger',
  info: 'info',
};

const BaseButton = ({ children, icon, gradient = 'primary', variant = 'solid', ...props }) => {
  // An "outline" request on a filled style degrades to the quiet neutral look.
  const key = ALIAS[gradient] || 'primary';
  const style = variant === 'outline' && key === 'primary' ? STYLES.neutral : STYLES[key];

  return (
    <MotionButton
      leftIcon={icon}
      size="md"
      borderRadius={radius.md}
      fontWeight="600"
      letterSpacing="0"
      transition="background .2s ease, border-color .2s ease, color .2s ease"
      _active={{ transform: 'translateY(0)' }}
      _focusVisible={{ boxShadow: `0 0 0 3px ${color.focusRing}` }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...style}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export const UploadButton = (props) => (
  <BaseButton icon={<FaCloudUploadAlt />} gradient="success" width="100%" {...props}>
    Upload
  </BaseButton>
);

export const DeleteButton = (props) => (
  <BaseButton icon={<HiTrash />} gradient="danger" {...props}>
    {props.children || 'Delete'}
  </BaseButton>
);

const SMALL = {
  size: { base: 'xs', sm: 'sm', md: 'sm' },
  h: { base: '30px', sm: '34px' },
  px: { base: 2.5, sm: 3, md: 4 },
};

export const DeleteAlbum = (props) => (
  <BaseButton icon={<HiTrash />} gradient="danger" mb={{ base: 1, sm: 2 }} {...SMALL} {...props}>
    {props.children || 'Delete Album'}
  </BaseButton>
);

export const CreateAlbumButton = (props) => (
  <BaseButton gradient="success" size={{ base: 'sm', sm: 'md', md: 'md' }} {...props}>
    {props.children || 'Create Album'}
  </BaseButton>
);

export const YearButton = ({ isActive, children, ...props }) => (
  <BaseButton
    gradient={isActive ? 'primary' : 'neutral'}
    variant={isActive ? 'solid' : 'outline'}
    size={{ base: 'sm', sm: 'md', md: 'md' }}
    {...props}
  >
    {children}
  </BaseButton>
);

export const DeleteByYearButton = ({ year, ...props }) => (
  <BaseButton icon={<HiTrash />} gradient="danger" {...SMALL} {...props}>
    Delete images of {year}
  </BaseButton>
);

export const DeleteAllByYearButton = ({ year, ...props }) => (
  <BaseButton icon={<HiTrash />} gradient="danger" {...SMALL} {...props}>
    {year ? `Delete all ${year}` : 'Delete all photos'}
  </BaseButton>
);
