import { Button, HStack, Icon, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { brandGradient, brandGradientHover, color, shadow } from '../../../design/tokens';

// Header auth buttons (Atlas): Register = amber primary; Login = quiet secondary.

const MotionButton = motion.create(Button);

const heightMapping = { xs: '30px', sm: '36px', md: '40px', lg: '46px' };
const paddingXMapping = { xs: 3, sm: 4, md: 5, lg: 6 };
const fontSizeMapping = { xs: '12px', sm: '13px', md: '14px', lg: '15px' };
const iconSizeMapping = { xs: '12px', sm: '13px', md: '14px', lg: '16px' };

const mapSizeProp = (s, mapping) => {
  if (!s) return mapping.md;
  if (typeof s === 'string') return mapping[s] || mapping.md;
  if (typeof s === 'object') {
    const res = {};
    for (const key in s) res[key] = mapping[s[key]] || mapping.md;
    return res;
  }
  return mapping.md;
};

const STYLES = {
  register: {
    bgGradient: brandGradient,
    color: color.textOnBrand,
    borderColor: 'rgba(255,255,255,0.18)',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), ${shadow.brandGlow}`,
    _hover: { bgGradient: brandGradientHover },
  },
  login: {
    bg: 'rgba(236,231,220,0.04)',
    color: color.text,
    borderColor: color.hairlineMid,
    _hover: { bg: color.primarySoftBg, borderColor: color.primarySoftBorder, color: color.primary },
  },
};

function ModernButtonBase({ type, variant = 'compact', onClick, icon, children, size = 'md', ...rest }) {
  const isCompact = variant === 'compact';

  return (
    <MotionButton
      onClick={onClick}
      h={isCompact ? mapSizeProp(size, heightMapping) : '48px'}
      px={isCompact ? mapSizeProp(size, paddingXMapping) : 7}
      fontWeight="600"
      letterSpacing="0"
      borderRadius="full"
      borderWidth="1px"
      transition="background .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      _focusVisible={{ boxShadow: `0 0 0 3px ${color.focusRing}` }}
      {...STYLES[type]}
      {...rest}
    >
      <HStack spacing={2}>
        {icon && <Icon as={icon} boxSize={isCompact ? mapSizeProp(size, iconSizeMapping) : '16px'} />}
        <Text as="span" fontSize={isCompact ? mapSizeProp(size, fontSizeMapping) : 'md'} fontWeight="600">
          {children}
        </Text>
      </HStack>
    </MotionButton>
  );
}

export const ModernLoginButton = ({ onClick, children = 'Log in', ...props }) => (
  <ModernButtonBase type="login" onClick={onClick} icon={FaSignInAlt} {...props}>
    {children}
  </ModernButtonBase>
);

export const ModernRegisterButton = ({ onClick, children = 'Register', ...props }) => (
  <ModernButtonBase type="register" onClick={onClick} icon={FaUserPlus} {...props}>
    {children}
  </ModernButtonBase>
);
