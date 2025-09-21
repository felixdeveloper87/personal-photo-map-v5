import { Box, VStack, Icon, Text, useColorModeValue, useBreakpointValue, Skeleton, Tooltip } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const InfoBox = ({ 
  icon, 
  label, 
  value, 
  colorScheme = "blue", 
  onClick, 
  size = "default",
  isLoading = false,
  tooltip = null,
  variant = "default"
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.3)');

  // Tamanhos responsivos baseados no breakpoint
  const isMobile = useBreakpointValue({ base: true, sm: false, md: false, lg: false, xl: false });

  // Esquemas de cores profissionais com gradientes
  const colorSchemes = {
    blue: {
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '#3b82f6',
      border: '#3b82f6',
      shadow: 'rgba(59, 130, 246, 0.15)'
    },
    green: {
      bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      icon: '#10b981',
      border: '#10b981',
      shadow: 'rgba(16, 185, 129, 0.15)'
    },
    red: {
      bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      icon: '#ef4444',
      border: '#ef4444',
      shadow: 'rgba(239, 68, 68, 0.15)'
    },
    orange: {
      bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '#f97316',
      border: '#f97316',
      shadow: 'rgba(249, 115, 22, 0.15)'
    },
    purple: {
      bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '#8b5cf6',
      border: '#8b5cf6',
      shadow: 'rgba(139, 92, 246, 0.15)'
    },
    yellow: {
      bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      icon: '#eab308',
      border: '#eab308',
      shadow: 'rgba(234, 179, 8, 0.15)'
    },
    cyan: {
      bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      icon: '#06b6d4',
      border: '#06b6d4',
      shadow: 'rgba(6, 182, 212, 0.15)'
    },
    pink: {
      bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      icon: '#ec4899',
      border: '#ec4899',
      shadow: 'rgba(236, 72, 153, 0.15)'
    },
    indigo: {
      bg: 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)',
      icon: '#6366f1',
      border: '#6366f1',
      shadow: 'rgba(99, 102, 241, 0.15)'
    }
  };

  // Variantes de design
  const variants = {
    default: {
      bg: bgColor,
      border: `1px solid ${borderColor}`,
      shadow: `0 4px 20px ${shadowColor}`,
      hoverShadow: `0 8px 30px ${shadowColor}`,
      iconBg: 'transparent'
    },
    gradient: {
      bg: colorSchemes[colorScheme]?.bg || colorSchemes.blue.bg,
      border: `1px solid ${colorSchemes[colorScheme]?.border || colorSchemes.blue.border}`,
      shadow: `0 4px 20px ${colorSchemes[colorScheme]?.shadow || colorSchemes.blue.shadow}`,
      hoverShadow: `0 8px 30px ${colorSchemes[colorScheme]?.shadow || colorSchemes.blue.shadow}`,
      iconBg: 'rgba(255, 255, 255, 0.15)'
    },
    glass: {
      bg: useColorModeValue('rgba(255, 255, 255, 0.25)', 'rgba(0, 0, 0, 0.25)'),
      border: `1px solid ${useColorModeValue('rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.18)')}`,
      shadow: `0 8px 32px ${shadowColor}`,
      hoverShadow: `0 12px 40px ${shadowColor}`,
      iconBg: 'rgba(255, 255, 255, 0.1)'
    }
  };

  // Tamanhos padronizados para garantir consistência
  const sizes = {
    default: {
      minW: isMobile ? "100px" : "140px",
      minH: isMobile ? "100px" : "140px",
      p: isMobile ? 3 : 4,
      borderRadius: isMobile ? "12px" : "16px",
      iconSize: isMobile ? 6 : 8,
      labelFontSize: isMobile ? "xs" : "sm",
      valueFontSize: isMobile ? "sm" : "md",
      spacing: isMobile ? 2 : 3
    },
    mobile: {
      minW: "60px",
      minH: "60px",
      p: 3,
      borderRadius: "12px",
      iconSize: 5,
      labelFontSize: "xs",
      valueFontSize: "sm",
      spacing: 2
    },
    compact: {
      minW: isMobile ? "100px" : "120px",
      minH: isMobile ? "80px" : "135px",
      p: isMobile ? 2 : 3,
      borderRadius: isMobile ? "10px" : "12px",
      iconSize: isMobile ? 5 : 6,
      labelFontSize: isMobile ? "xs" : "sm",
      valueFontSize: isMobile ? "sm" : "sm",
      spacing: isMobile ? 1 : 2
    },
    compactXl: {
      minW: isMobile ? "100px" : "100px",
      minH: isMobile ? "100px" : "140px",
      p: isMobile ? 2 : 3,
      borderRadius: isMobile ? "10px" : "14px",
      iconSize: isMobile ? 5 : 7,
      labelFontSize: isMobile ? "xs" : "sm",
      valueFontSize: isMobile ? "sm" : "md",
      spacing: isMobile ? 1 : 3
    }
  };

  // Função para obter tamanho responsivo
  const getResponsiveSize = (sizeProp) => {
    if (typeof sizeProp === 'object') {
      // Se size é um objeto com breakpoints, usar useBreakpointValue
      const responsiveSize = useBreakpointValue(sizeProp);
      return sizes[responsiveSize] || sizes.default;
    }
    // Se size é uma string, usar diretamente
    return sizes[sizeProp] || sizes.default;
  };

  const currentSize = getResponsiveSize(size);
  const currentVariant = variants[variant] || variants.default;
  const currentColorScheme = colorSchemes[colorScheme] || colorSchemes.blue;

  // Animações do Framer Motion
  const boxVariants = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { 
        duration: 0.2, 
        ease: "easeOut" 
      }
    },
    tap: { 
      scale: 0.98,
      transition: { 
        duration: 0.1 
      }
    }
  };

  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    hover: { 
      rotate: [0, -10, 10, 0], 
      scale: 1.1,
      transition: { 
        duration: 0.6, 
        ease: "easeInOut" 
      }
    }
  };

  if (isLoading) {
    return (
      <MotionBox
        variants={boxVariants}
        initial="initial"
        animate="animate"
        minW={currentSize.minW}
        minH={currentSize.minH}
        p={currentSize.p}
        bg={currentVariant.bg}
        borderRadius={currentSize.borderRadius}
        border={currentVariant.border}
        boxShadow={currentVariant.shadow}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={currentSize.spacing}
        overflow="hidden"
        position="relative"
      >
        <Skeleton height="20px" width="60%" borderRadius="md" />
        <Skeleton height="16px" width="80%" borderRadius="md" />
        <Skeleton height="24px" width="70%" borderRadius="md" />
      </MotionBox>
    );
  }

  const content = (
    <VStack 
      spacing={currentSize.spacing} 
      align="center" 
      justify="center" 
      h="full"
      position="relative"
      zIndex={2}
    >
      {/* Ícone com fundo e animação */}
      <MotionBox
        as={motion.div}
        variants={iconVariants}
        initial="initial"
        whileHover="hover"
        p={2}
        borderRadius="full"
        bg={currentVariant.iconBg}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon 
          as={icon} 
          boxSize={currentSize.iconSize} 
          color={variant === 'gradient' ? 'white' : currentColorScheme.icon}
          filter={variant === 'gradient' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'}
        />
      </MotionBox>

      {/* Label com tipografia aprimorada */}
      <Text 
        fontSize={currentSize.labelFontSize} 
        color={variant === 'gradient' ? 'white' : labelColor} 
        textTransform="uppercase" 
        fontWeight="700" 
        letterSpacing="wider"
        textAlign="center"
        opacity={0.9}
        filter={variant === 'gradient' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'}
      >
        {label}
      </Text>

      {/* Valor com tipografia aprimorada */}
      <Text 
        fontSize={currentSize.valueFontSize} 
        fontWeight="600" 
        color={variant === 'gradient' ? 'white' : textColor} 
        noOfLines={2} 
        textAlign="center"
        lineHeight="1.2"
        filter={variant === 'gradient' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'}
      >
        {value || 'N/A'}
      </Text>
    </VStack>
  );

  const boxContent = (
    <MotionBox
      as={motion.div}
      variants={boxVariants}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      minW={currentSize.minW}
      minH={currentSize.minH}
      textAlign="center"
      p={currentSize.p}
      bg={currentVariant.bg}
      borderRadius={currentSize.borderRadius}
      boxShadow={currentVariant.shadow}
      border={currentVariant.border}
      backdropFilter={variant === 'glass' ? 'blur(20px)' : 'none'}
      cursor={onClick ? 'pointer' : 'default'}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      position="relative"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        boxShadow: currentVariant.hoverShadow,
        transform: onClick ? "translateY(-8px) scale(1.02)" : "translateY(-4px)",
      }}
      _active={onClick ? { transform: "translateY(-2px) scale(0.98)" } : undefined}
      _focus={{
        outline: 'none',
        ring: 2,
        ringColor: currentColorScheme.border,
        ringOffset: 2,
        ringOffsetColor: bgColor
      }}
    >
      {/* Efeito de brilho sutil */}
      {variant === 'gradient' && (
        <Box
          position="absolute"
          top="0"
          left="-100%"
          width="100%"
          height="100%"
          background="linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
          transition="left 0.5s"
          _groupHover={{ left: "100%" }}
          pointerEvents="none"
        />
      )}
      
      {content}
    </MotionBox>
  );

  // Wrapper com Tooltip se especificado
  if (tooltip) {
    return (
      <Tooltip 
        label={tooltip} 
        placement="top" 
        hasArrow 
        bg={useColorModeValue('gray.800', 'gray.200')}
        color={useColorModeValue('white', 'gray.800')}
        borderRadius="md"
        fontSize="sm"
      >
        {boxContent}
      </Tooltip>
    );
  }

  return boxContent;
};

export default InfoBox;
