import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';

const FeatureCard = ({ feature }) => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <VStack
      bgGradient={useColorModeValue(
        'linear(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
        'linear(135deg, rgba(26, 32, 44, 0.9), rgba(45, 55, 72, 0.7))'
      )}
      backdropFilter="blur(20px)"
      p={10}
      borderRadius="3xl"
      boxShadow={useColorModeValue(
        '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(203, 213, 224, 0.2)',
        '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(45, 55, 72, 0.3)'
      )}
      border="1px solid"
      borderColor={useColorModeValue('rgba(203, 213, 224, 0.3)', 'rgba(45, 55, 72, 0.5)')}
      spacing={8}
      textAlign="center"
      h="full"
      justify="space-between"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        h: '4px',
        bgGradient: feature.gradient,
        opacity: 0,
        transition: 'opacity 0.4s ease'
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        bgGradient: useColorModeValue(
          'linear(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
          'linear(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
        ),
        borderRadius: '50%',
        opacity: 0,
        transition: 'opacity 0.4s ease',
        zIndex: -1
      }}
      _hover={{
        transform: 'translateY(-12px) scale(1.02)',
        boxShadow: useColorModeValue(
          '0 30px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.3)',
          '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.4)'
        ),
        borderColor: `${feature.color}.400`,
        _before: { opacity: 1 },
        _after: { opacity: 1 }
      }}
    >
      <Box
        p={6}
        bgGradient={feature.gradient}
        borderRadius="2xl"
        color="white"
        boxShadow={useColorModeValue('0 10px 25px rgba(0, 0, 0, 0.15)', '0 10px 25px rgba(0, 0, 0, 0.3)')}
        boxSize="80px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          transform: 'scale(1.1) rotate(5deg)',
          boxShadow: useColorModeValue('0 15px 35px rgba(0, 0, 0, 0.2)', '0 15px 35px rgba(0, 0, 0, 0.4)')
        }}
        transition="all 0.3s ease"
      >
        <Icon as={feature.icon} boxSize={9} />
      </Box>
      
      <VStack spacing={5} flex={1} justify="center">
        <Heading
          size="lg"
          color={headingColor}
          lineHeight="1.3"
          fontWeight="bold"
          bgGradient={useColorModeValue('linear(135deg, #2D3748, #4A5568)', 'linear(135deg, #F7FAFC, #E2E8F0)')}
          bgClip="text"
        >
          {feature.title}
        </Heading>
        
        <Text color={textColor} fontSize="md" lineHeight="1.6" fontWeight="medium" opacity={0.9}>
          {feature.description}
        </Text>
      </VStack>
    </VStack>
  );
};

export default FeatureCard;
