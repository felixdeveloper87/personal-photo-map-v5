import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Grid,
  Badge,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaGlobe, FaChartLine, FaCamera } from 'react-icons/fa';

const MotionBox = motion.create(Box);

const HowItWorksSection = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const learningSteps = [
    {
      step: '01',
      title: 'Explore Countries',
      description: 'Click on any country to access comprehensive educational data and statistics',
      icon: FaGlobe
    },
    {
      step: '02',
      title: 'Analyze Data',
      description: 'Study economic indicators, social metrics, and cultural information from trusted sources',
      icon: FaChartLine
    },
    {
      step: '03',
      title: 'Document & Learn',
      description: 'Upload photos and create a personal learning journey with visual context',
      icon: FaCamera
    }
  ];

  return (
    <Box py={28} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Container maxW="container.xl">
        <VStack spacing={24}>
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge
              colorScheme="teal"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              bg={useColorModeValue('teal.500', 'teal.400')}
              color="white"
              boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.2)"
            >
              🚀 Getting Started
            </Badge>
            <Heading
              size="2xl"
              color={headingColor}
              lineHeight="1.2"
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
            >
              Your Learning Journey
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={textColor}
              lineHeight="1.7"
              maxW="700px"
              fontWeight="medium"
            >
              Start exploring the world through data-driven insights and interactive learning experiences
            </Text>
          </VStack>

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={12} w="100%">
            {learningSteps.map((item, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <VStack spacing={8} textAlign="center" align="stretch">
                  <VStack spacing={6}>
                    <Box
                      p={5}
                      bgGradient="linear(135deg, blue.400, blue.600)"
                      borderRadius="2xl"
                      color="white"
                      boxShadow="lg"
                      boxSize="60px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={item.icon} boxSize={7} />
                    </Box>
                    <Heading size="lg" color={headingColor} lineHeight="1.3" fontWeight="bold">
                      {item.title}
                    </Heading>
                    <Text color={textColor} lineHeight="1.6" fontSize="md" fontWeight="medium" maxW="280px">
                      {item.description}
                    </Text>
                  </VStack>
                </VStack>
              </MotionBox>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
