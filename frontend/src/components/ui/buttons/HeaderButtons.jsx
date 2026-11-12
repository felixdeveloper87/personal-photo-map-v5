import { Button, HStack, Icon, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaCrown, FaImages, FaGlobe, FaSignOutAlt,
  FaClock, FaSearch, FaUserPlus, FaSignInAlt, FaUserCircle,
} from 'react-icons/fa';
import { brandGradient, brandGradientHover, color, shadow, tones } from '../../../design/tokens';

const MotionButton = motion.create(Button);

const ICON_SIZE = { xs: 12, sm: 13, md: 14, lg: 16 };
const HEIGHT = { xs: '30px', sm: '34px', md: '38px', lg: '42px' };
const PADDING_X = { xs: 2.5, sm: 3.5, md: 4, lg: 5 };

/**
 * Atlas header nav pill.
 *  emphasis="brand"  — amber fill (Premium, Sign up): the one highlighted action
 *  emphasis="danger" — neutral at rest, rose on hover (Logout)
 *  default           — quiet glass pill; icon turns amber on hover
 */
const NavPill = ({ icon, text, emphasis = 'neutral', onClick, size = 'sm', hideText = false, ...props }) => {
  const s = HEIGHT[size] ? size : 'sm';

  const styles =
    emphasis === 'brand'
      ? {
          bgGradient: brandGradient,
          color: color.textOnBrand,
          border: '1px solid',
          borderColor: 'rgba(255,255,255,0.18)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), ${shadow.brandGlow}`,
          _hover: { bgGradient: brandGradientHover },
          '--icon-color': color.textOnBrand,
          '--icon-hover': color.textOnBrand,
        }
      : {
          bg: 'rgba(236,231,220,0.04)',
          color: color.textSoft,
          border: '1px solid',
          borderColor: color.hairline,
          _hover: {
            bg: emphasis === 'danger' ? tones.danger.soft : 'rgba(236,231,220,0.08)',
            borderColor: emphasis === 'danger' ? tones.danger.border : color.hairlineMid,
            color: emphasis === 'danger' ? tones.danger.fg : color.text,
          },
          '--icon-color': color.textMuted,
          '--icon-hover': emphasis === 'danger' ? tones.danger.fg : color.primary,
        };

  return (
    <MotionButton
      role="group"
      onClick={onClick}
      h={HEIGHT[s]}
      px={hideText ? 0 : PADDING_X[s]}
      minW={hideText ? HEIGHT[s] : undefined}
      borderRadius="full"
      fontSize="13px"
      fontWeight="600"
      letterSpacing="0"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      _focusVisible={{ boxShadow: `0 0 0 3px ${color.focusRing}` }}
      aria-label={hideText ? text : undefined}
      {...styles}
      {...props}
    >
      <HStack spacing={hideText ? 0 : 2}>
        {icon && (
          <Icon
            as={icon}
            boxSize={`${ICON_SIZE[s]}px`}
            color="var(--icon-color)"
            transition="color .2s ease"
            _groupHover={{ color: 'var(--icon-hover)' }}
          />
        )}
        {text && !hideText && <Text as="span">{text}</Text>}
      </HStack>
    </MotionButton>
  );
};

export const PremiumButton = ({ onClick, ...props }) => (
  <NavPill icon={FaCrown} text="Premium" emphasis="brand" onClick={onClick} {...props} />
);
export const PhotoStorageButton = ({ onClick, ...props }) => (
  <NavPill icon={FaImages} text="Photos" onClick={onClick} {...props} />
);
export const UserProfileButton = ({ onClick, ...props }) => (
  <NavPill icon={FaUserCircle} text="Profile" onClick={onClick} {...props} />
);
export const LogoutButton = ({ onClick, ...props }) => (
  <NavPill icon={FaSignOutAlt} text="Logout" emphasis="danger" onClick={onClick} {...props} />
);
export const TimelineButton = ({ onClick, ...props }) => (
  <NavPill icon={FaClock} text="Timeline" onClick={onClick} {...props} />
);
export const SearchButton = ({ onClick, ...props }) => (
  <NavPill icon={FaSearch} text="Search" onClick={onClick} {...props} />
);
export const MapButton = ({ onClick, ...props }) => (
  <NavPill icon={FaGlobe} text="Map" onClick={onClick} {...props} />
);
export const LoginButton = ({ onClick, size = 'sm', ...props }) => (
  <NavPill icon={FaSignInAlt} text="Login" onClick={onClick} size={size} {...props} />
);
export const RegisterButton = ({ onClick, size = 'sm', ...props }) => (
  <NavPill icon={FaUserPlus} text="Sign Up" emphasis="brand" onClick={onClick} size={size} {...props} />
);
