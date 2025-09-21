import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaChartLine, FaGlobeAmericas, FaBookOpen } from 'react-icons/fa';

const MotionBox = motion.create(Box);

const BenefitsSection = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.700');

  const benefits = [
    {
      title: 'Learning Through Travel',
      description: 'Transform your travel experiences into educational opportunities with comprehensive country data and interactive learning modules.',
      icon: FaLightbulb,
      color: 'yellow',
      gradient: 'linear(135deg, yellow.400, orange.500)'
    },
    {
      title: 'Data-Driven Insights',
      description: 'Access real-time economic and social indicators from authoritative sources like World Bank with advanced analytics.',
      icon: FaChartLine,
      color: 'blue',
      gradient: 'linear(135deg, blue.400, cyan.500)'
    },
    {
      title: 'Cultural Understanding',
      description: 'Deepen your knowledge of world cultures and social development patterns through comprehensive research tools.',
      icon: FaGlobeAmericas,
      color: 'green',
      gradient: 'linear(135deg, green.400, teal.500)'
    },
    {
      title: 'Academic Research',
      description: 'Use reliable data for studies, presentations, or personal research on global development with citation-ready sources.',
      icon: FaBookOpen,
      color: 'purple',
      gradient: 'linear(135deg, purple.400, pink.500)'
    }
  ];

  return (
    <Box py={28} bg={useColorModeValue('white', 'gray.900')}>
      <Container maxW="container.xl">
        <VStack spacing={24}>
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge
              colorScheme="purple"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              bg={useColorModeValue('purple.500', 'purple.400')}
              color="white"
              boxShadow="0 4px 6px -1px rgba(147, 51, 234, 0.2)"
            >
              💡 Why Choose Us
            </Badge>
            <Heading
              size="2xl"
              color={headingColor}
              lineHeight="1.2"
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
            >
              Why Choose Our Educational Platform?
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={textColor}
              lineHeight="1.7"
              maxW="700px"
              fontWeight="medium"
            >
              Discover the unique benefits that make our application an essential tool for
              global learning and cultural understanding
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} w="100%">
            {benefits.map((benefit, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <HStack
                  bg={cardBg}
                  p={10}
                  borderRadius="3xl"
                  boxShadow={useColorModeValue('xl', '2xl')}
                  border="1px solid"
                  borderColor={borderColor}
                  spacing={8}
                  align="start"
                  h="full"
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: useColorModeValue('2xl', '3xl'),
                    borderColor: `${benefit.color}.400`,
                    _before: { opacity: 1 }
                  }}
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
                    bgGradient: benefit.gradient,
                    opacity: 0,
                    transition: 'opacity 0.4s ease'
                  }}
                >
                  <Box
                    p={5}
                    bgGradient={benefit.gradient}
                    borderRadius="2xl"
                    color="white"
                    boxShadow="lg"
                    flexShrink={0}
                    boxSize="60px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={benefit.icon} boxSize={7} />
                  </Box>
                  <VStack align="start" spacing={4} flex={1}>
                    <Heading size="lg" color={headingColor} lineHeight="1.3" fontWeight="bold">
                      {benefit.title}
                    </Heading>
                    <Text color={textColor} fontSize="md" lineHeight="1.6" fontWeight="medium">
                      {benefit.description}
                    </Text>
                  </VStack>
                </HStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
