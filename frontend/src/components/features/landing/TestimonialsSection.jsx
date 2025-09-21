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
import { FaStar } from 'react-icons/fa';

const MotionBox = motion.create(Box);

const TestimonialsSection = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.700');

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      location: 'Geography Professor, NYU',
      text: 'This platform is incredible for teaching global development. The real-time data and interactive map make complex concepts accessible to students.',
      rating: 5,
      avatar: '👩‍🏫'
    },
    {
      name: 'Michael Chen',
      location: 'International Business Analyst, London',
      text: 'Perfect for understanding economic indicators and social metrics of countries I visit. The World Bank integration is invaluable.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Emma Rodriguez',
      location: 'Cultural Anthropologist, Barcelona',
      text: "I love how I can explore cultural data alongside my travel photos. It's like having a comprehensive world encyclopedia!",
      rating: 5,
      avatar: '👩‍🎓'
    }
  ];

  return (
    <Box py={28} bg={useColorModeValue('white', 'gray.800')}>
      <Container maxW="container.xl">
        <VStack spacing={24}>
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge
              colorScheme="pink"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              bg={useColorModeValue('pink.500', 'pink.400')}
              color="white"
              boxShadow="0 4px 6px -1px rgba(236, 72, 153, 0.2)"
            >
              🌟 User Testimonials
            </Badge>
            <Heading
              size="2xl"
              color={headingColor}
              lineHeight="1.2"
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
            >
              What Our Users Say
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={textColor}
              lineHeight="1.7"
              maxW="700px"
              fontWeight="medium"
            >
              Join thousands of learners, researchers, and travelers who have transformed their
              global understanding through our platform
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="100%">
            {testimonials.map((testimonial, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
              >
                <Box
                  bg={cardBg}
                  p={8}
                  borderRadius="3xl"
                  boxShadow={useColorModeValue('xl', '2xl')}
                  border="1px solid"
                  borderColor={borderColor}
                  h="full"
                  _hover={{
                    transform: 'translateY(-6px)',
                    boxShadow: useColorModeValue('2xl', '3xl'),
                    borderColor: 'pink.400',
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
                    bgGradient: 'linear(135deg, pink.400, purple.500)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease'
                  }}
                >
                  <VStack spacing={6} align="start" h="full">
                    <HStack spacing={4} w="100%">
                      <Box
                        fontSize="3xl"
                        p={3}
                        bgGradient="linear(135deg, pink.400, purple.500)"
                        borderRadius="xl"
                        color="white"
                        boxShadow="md"
                      >
                        {testimonial.avatar}
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold" color={headingColor} fontSize="lg">
                          {testimonial.name}
                        </Text>
                        <Text color={textColor} fontSize="sm" opacity={0.8}>
                          {testimonial.location}
                        </Text>
                      </VStack>
                      <HStack spacing={1}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Icon key={i} as={FaStar} color="yellow.400" boxSize={4} />
                        ))}
                      </HStack>
                    </HStack>

                    <Text color={textColor} fontSize="md" lineHeight="1.6" fontWeight="medium" flex={1}>
                      "{testimonial.text}"
                    </Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
