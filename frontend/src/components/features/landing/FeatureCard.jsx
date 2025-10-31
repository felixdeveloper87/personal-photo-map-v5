import React from 'react';
import { Box, VStack, Heading, Text, Icon, useColorModeValue } from '@chakra-ui/react';

const FeatureCard = ({ feature }) => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.600', 'white');
  const bgColor = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const boxShadow = useColorModeValue('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
  const hoverShadow = useColorModeValue('0 25px 35px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.1)', '0 25px 35px -5px rgba(0, 0, 0, 0.7), 0 15px 15px -5px rgba(0, 0, 0, 0.2)');
  const iconShadow = useColorModeValue('0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');

  return (
    <VStack
      bg={bgColor}
      p={{ base: 5, sm: 6, md: 8, lg: 10 }}
      borderRadius="2xl"
      boxShadow={boxShadow}
      border="1px solid"
      borderColor={borderColor}
      spacing={{ base: 4, sm: 5, md: 6 }}
      textAlign="center"
      h="full"
      justify="flex-start"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, h: '4px', bgGradient: feature.gradient, opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left', transition: 'all 0.4s ease' }}
      _after={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient: `linear(135deg, ${feature.color}.50, transparent)`, opacity: 0, transition: 'opacity 0.4s ease', zIndex: -1 }}
      _hover={{ transform: { base: 'translateY(-4px) scale(1.02)', md: 'translateY(-8px) scale(1.02)' }, boxShadow: hoverShadow, borderColor: `${feature.color}.400`, _before: { opacity: 1, transform: 'scaleX(1)' }, _after: { opacity: 0.1 } }}
    >
      <Box
        p={{ base: 4, sm: 5, md: 6 }}
        bgGradient={feature.gradient}
        borderRadius="xl"
        color="white"
        boxShadow={iconShadow}
        boxSize={{ base: "55px", sm: "60px", md: "70px" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bg: 'rgba(255, 255, 255, 0.1)', borderRadius: 'xl', opacity: 0, transition: 'opacity 0.3s ease' }}
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{ transform: 'scale(1.15) rotate(5deg)', _before: { opacity: 1 } }}
      >
        <Icon as={feature.icon} boxSize={{ base: 6, sm: 7, md: 8 }} transition="all 0.3s ease" />
      </Box>
      
      <VStack spacing={{ base: 3, md: 4 }} flex={1} w="full">
        <Heading size={{ base: "md", md: "lg" }} color={headingColor} lineHeight="1.3" fontWeight="bold">
          {feature.title}
        </Heading>
        <Text color={textColor} fontSize={{ base: "sm", md: "md" }} lineHeight="1.7" fontWeight="normal">
          {feature.description}
        </Text>
      </VStack>
    </VStack>
  );
};

export default FeatureCard;
