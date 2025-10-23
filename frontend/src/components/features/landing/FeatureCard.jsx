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
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack
      bg={bgColor}
      p={{ base: 6, md: 8, lg: 10 }}
      borderRadius="2xl"
      boxShadow={useColorModeValue(
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      )}
      border="1px solid"
      borderColor={borderColor}
      spacing={{ base: 5, md: 6 }}
      textAlign="center"
      h="full"
      justify="flex-start"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        h: '3px',
        bgGradient: feature.gradient,
        opacity: 0,
        transition: 'opacity 0.3s ease'
      }}
      _hover={{
        transform: { base: 'translateY(-4px)', md: 'translateY(-8px)' },
        boxShadow: useColorModeValue(
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
        ),
        borderColor: `${feature.color}.400`,
        _before: { opacity: 1 }
      }}
    >
      <Box
        p={{ base: 5, md: 6 }}
        bgGradient={feature.gradient}
        borderRadius="xl"
        color="white"
        boxShadow={useColorModeValue(
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        )}
        boxSize={{ base: "60px", md: "70px" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        _groupHover={{
          transform: 'scale(1.1) rotate(5deg)',
        }}
        transition="all 0.3s ease"
      >
        <Icon as={feature.icon} boxSize={{ base: 7, md: 8 }} />
      </Box>
      
      <VStack spacing={{ base: 3, md: 4 }} flex={1} w="full">
        <Heading
          size={{ base: "md", md: "lg" }}
          color={headingColor}
          lineHeight="1.3"
          fontWeight="bold"
        >
          {feature.title}
        </Heading>
        
        <Text 
          color={textColor} 
          fontSize={{ base: "sm", md: "md" }} 
          lineHeight="1.7" 
          fontWeight="normal"
        >
          {feature.description}
        </Text>
      </VStack>
    </VStack>
  );
};

export default FeatureCard;
