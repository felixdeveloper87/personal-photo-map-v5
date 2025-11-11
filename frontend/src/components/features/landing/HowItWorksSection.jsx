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
import { HiRocketLaunch } from 'react-icons/hi2';
import { learningSteps } from '../../../data/homeData';
import FeatureCard from './FeatureCard';

const MotionBox = motion.create(Box);

const PATTERN_URL_LIGHT =
  'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';

const PATTERN_URL_DARK =
  'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';

const HowItWorksSection = () => {
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'white');
  const bgValue = useColorModeValue('gray.50', 'black');
  const badgeBg = useColorModeValue('teal.500', 'teal.400');
  const patternUrl = useColorModeValue(PATTERN_URL_LIGHT, PATTERN_URL_DARK);

  return (
    <Box 
      py={10} 
      bg={bgValue}
      position="relative"
      overflow="hidden"
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: patternUrl,
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Container maxW="container.2xl" position="relative" zIndex={1}>
        <VStack spacing={24}>
          {/* === Header Section === */}
          <VStack spacing={10} textAlign="center" maxW="900px">
            <Badge
              colorScheme="teal"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              bg={badgeBg}
              color="white"
              boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.2)"
            >
              <HStack spacing={2} align="center" justify="center">
                <Icon as={HiRocketLaunch} boxSize={5} />
                <Text>Getting Started</Text>
              </HStack>
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
              Start exploring the world through data-driven insights and
              interactive learning experiences
            </Text>
          </VStack>

          {/* === Steps Grid === */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={8}
            w="100%"
          >
            {learningSteps.map((step, index) => (
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
                <FeatureCard feature={step} />
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
