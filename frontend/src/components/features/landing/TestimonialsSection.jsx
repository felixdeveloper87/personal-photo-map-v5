import React from 'react';
import { Box, Container, VStack, Heading, Text, SimpleGrid, Badge, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi2';

const MotionBox = motion.create(Box);
const testimonials = [
  { name: 'Dr. Sarah Johnson', location: 'Geography Professor, NYU', text: 'This platform is incredible for teaching global development. The real-time data and interactive map make complex concepts accessible to students.', rating: 5, avatar: '👩‍🏫' },
  { name: 'Michael Chen', location: 'International Business Analyst, London', text: 'Perfect for understanding economic indicators and social metrics of countries I visit. The World Bank integration is invaluable.', rating: 5, avatar: '👨‍💼' },
  { name: 'Emma Rodriguez', location: 'Cultural Anthropologist, Barcelona', text: "I love how I can explore cultural data alongside my travel photos. It's like having a comprehensive world encyclopedia!", rating: 5, avatar: '👩‍🎓' }
];

const TestimonialsSection = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'whote');
  const cardBg = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('gray.300', 'gray.700');
  const bgValue = useColorModeValue('white', 'gray.800');
  const badgeBg = useColorModeValue('pink.500', 'pink.400');
  const boxShadow = useColorModeValue('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
  const hoverShadow = useColorModeValue('0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.1)');

  return (
    <Box py={28} bg={bgValue}>
      <Container maxW="container.xl">
        <VStack spacing={24}>
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge colorScheme="pink" variant="solid" px={6} py={3} borderRadius="full" fontSize="lg" fontWeight="semibold" bg={badgeBg} color="white" boxShadow="0 4px 6px -1px rgba(236, 72, 153, 0.2)">
              <HStack spacing={2} align="center" justify="center">
                <Icon as={HiStar} boxSize={5} />
                <Text>User Testimonials</Text>
              </HStack>
            </Badge>
            <Heading size="2xl" color={headingColor} lineHeight="1.2" fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="extrabold">
              What Our Users Say
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color={textColor} lineHeight="1.7" maxW="700px" fontWeight="medium">
              Join thousands of learners, researchers, and travelers who have transformed their global understanding through our platform
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="100%">
            {testimonials.map((testimonial, index) => (
              <MotionBox key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }} viewport={{ once: true }}>
                <Box
                  bg={cardBg}
                  p={{ base: 6, md: 8 }}
                  borderRadius="2xl"
                  boxShadow={boxShadow}
                  border="1px solid"
                  borderColor={borderColor}
                  h="full"
                  _hover={{ transform: { base: 'translateY(-4px)', md: 'translateY(-6px)' }, boxShadow: hoverShadow, borderColor: 'pink.400', _before: { opacity: 1 } }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                  overflow="hidden"
                  _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, h: '3px', bgGradient: 'linear(135deg, pink.400, purple.500)', opacity: 0, transition: 'opacity 0.3s ease' }}
                >
                  <VStack spacing={6} align="start" h="full">
                    <HStack spacing={4} w="100%">
                      <Box fontSize="3xl" p={3} bgGradient="linear(135deg, pink.400, purple.500)" borderRadius="xl" color="white" boxShadow="md">
                        {testimonial.avatar}
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold" color={headingColor} fontSize="lg">{testimonial.name}</Text>
                        <Text color={textColor} fontSize="sm" opacity={0.8}>{testimonial.location}</Text>
                      </VStack>
                      <HStack spacing={1}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Icon key={i} as={HiStar} color="yellow.400" boxSize={4} />
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
