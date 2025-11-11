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
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiLightBulb } from 'react-icons/hi2';
import { benefits } from '../../../data/homeData';
import FeatureCard from './FeatureCard';

const MotionBox = motion.create(Box);

const BenefitsSection = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'white');
  const badgeBg = useColorModeValue('purple.500', 'purple.400');

  return (
    <Box py={10}>
      <Container maxW="container.2xl">
        <VStack spacing={24}>
          {/* === Section Header === */}
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge
              colorScheme="purple"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              bg={badgeBg}
              color="white"
              boxShadow="0 4px 6px -1px rgba(147, 51, 234, 0.2)"
            >
              <HStack spacing={2} align="center" justify="center">
                <Icon as={HiLightBulb} boxSize={5} />
                <Text>Why Choose Us</Text>
              </HStack>
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
              Discover the unique benefits that make our application an
              essential tool for global learning and cultural understanding
            </Text>
          </VStack>

          {/* === Benefits Grid === */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
            {benefits.map((benefit, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: 'easeOut',
                  type: 'spring',
                  stiffness: 100,
                }}
                viewport={{ once: true, margin: '-100px' }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: 'easeOut' },
                }}
              >
                <FeatureCard feature={benefit} />
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
