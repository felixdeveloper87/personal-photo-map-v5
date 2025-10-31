import React from 'react';
import { Box, Container, VStack, Heading, Text, SimpleGrid, Badge, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

const MotionBox = motion.create(Box);

const FeaturesSection = ({ title, subtitle, description, features, badgeText, badgeIcon, badgeColor = 'blue', columns = { base: 1, md: 2, lg: 4 }, spacing = 8, bg = 'gray.50', bgDark = 'gray.900' }) => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const bgValue = useColorModeValue(bg, bgDark);
  const bgGradient = useColorModeValue('linear(135deg, rgba(59, 130, 246, 0.03), rgba(147, 51, 234, 0.03))', 'linear(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))');
  const badgeGradient = useColorModeValue('linear(135deg, #3182CE, #553C9A)', 'linear(135deg, #4299E1, #805AD5)');
  const headingGradient = useColorModeValue('linear(135deg, #2D3748, #4A5568)', 'linear(135deg, #F7FAFC, #E2E8F0)');
  const badgeShadow = useColorModeValue('0 8px 25px rgba(59, 130, 246, 0.3)', '0 8px 25px rgba(59, 130, 246, 0.4)');
  const badgeHoverShadow = useColorModeValue('0 12px 35px rgba(59, 130, 246, 0.4)', '0 12px 35px rgba(59, 130, 246, 0.5)');

  return (
    <Box py={28} bg={bgValue} position="relative" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient, zIndex: 0 }}>
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={24}>
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge variant="solid" px={8} py={4} borderRadius="full" fontSize="lg" fontWeight="bold" bgGradient={badgeGradient} color="white" boxShadow={badgeShadow} _hover={{ transform: 'translateY(-2px)', boxShadow: badgeHoverShadow }} transition="all 0.3s ease">
              <HStack spacing={2} align="center" justify="center">
                {badgeIcon && <Icon as={badgeIcon} boxSize={5} />}
                <Text>{badgeText}</Text>
              </HStack>
            </Badge>
            
            <Heading size="2xl" color={headingColor} lineHeight="1.2" fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="extrabold" bgGradient={headingGradient} bgClip="text">
              {title}
            </Heading>
            
            <Text fontSize={{ base: 'lg', md: 'xl' }} color={textColor} lineHeight="1.7" maxW="700px" fontWeight="medium" opacity={0.9}>
              {description}
            </Text>
          </VStack>

          <SimpleGrid columns={columns} spacing={spacing} w="100%">
            {features.map((feature, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut', type: 'spring', stiffness: 100 }}
                viewport={{ once: true, margin: '-100px' }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
              >
                <FeatureCard feature={feature} />
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
