import { useColorModeValue } from '@chakra-ui/react';

export const useHomeStyles = () => {
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.700');

  return {
    colors: {
      text: textColor,
      heading: headingColor,
      card: cardBg,
      border: borderColor
    },
    gradients: {
      hero: 'linear(135deg, blue.600 0%, purple.700 50%, indigo.800 100%)',
      heroDark: 'linear(135deg, blue.700 0%, purple.800 50%, indigo.900 100%)',
      features: 'linear(135deg, #F7FAFC 0%, #EDF2F7 100%)',
      featuresDark: 'linear(135deg, #1A202C 0%, #2D3748 100%)',
      cta: 'linear(135deg, green.600, teal.600)',
      ctaDark: 'linear(135deg, green.500, teal.500)'
    },
    shadows: {
      card: useColorModeValue('xl', '2xl'),
      cardHover: useColorModeValue('2xl', '3xl'),
      button: useColorModeValue('lg', 'xl'),
      buttonHover: useColorModeValue('2xl', '3xl')
    },
    animations: {
      cardHover: {
        transform: 'translateY(-10px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      buttonHover: {
        transform: 'translateY(-3px)',
        transition: 'all 0.3s ease'
      }
    },
    spacing: {
      section: 28,
      container: 24,
      items: 8
    }
  };
};

export const commonCardStyles = (colorScheme) => {
  const baseStyles = useColorModeValue(
    {
      bg: 'white',
      borderColor: 'gray.300',
      boxShadow: 'xl',
      _hover: {
        boxShadow: '2xl',
        transform: 'translateY(-10px)'
      }
    },
    {
      bg: 'gray.800',
      borderColor: 'gray.700',
      boxShadow: '2xl',
      _hover: {
        boxShadow: '3xl',
        transform: 'translateY(-10px)'
      }
    }
  );

  return {
    ...baseStyles,
    p: 10,
    borderRadius: '3xl',
    border: '1px solid',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      h: '4px',
      bgGradient: colorScheme?.gradient || 'linear(135deg, blue.400, cyan.500)',
      opacity: 0,
      transition: 'opacity 0.4s ease'
    },
    _hover: {
      ...baseStyles._hover,
      borderColor: `${colorScheme?.color || 'blue'}.400`,
      _before: { opacity: 1 }
    }
  };
};

export const iconBoxStyles = (gradient) => ({
  p: 6,
  bgGradient: gradient,
  borderRadius: '2xl',
  color: 'white',
  boxShadow: 'lg',
  boxSize: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  _hover: {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: 'xl'
  }
});

export const badgeStyles = (colorScheme, size = 'md') => ({
  variant: 'solid',
  px: size === 'lg' ? 8 : 6,
  py: size === 'lg' ? 4 : 3,
  borderRadius: 'full',
  fontSize: size === 'lg' ? 'lg' : 'md',
  fontWeight: 'bold',
  color: 'white',
  boxShadow: 'sm'
});

export const headingStyles = (size = '2xl') => ({
  size,
  lineHeight: '1.2',
  fontWeight: 'extrabold',
  letterSpacing: 'tight',
  fontSize: size === '2xl' ? { base: '2xl', md: '3xl', lg: '4xl' } : { base: '3xl', md: '4xl', lg: '5xl' }
});

export const textStyles = (size = 'lg') => ({
  fontSize: size === 'lg' ? { base: 'lg', md: 'xl' } : '2xl',
  lineHeight: '1.7',
  fontWeight: 'medium'
});
