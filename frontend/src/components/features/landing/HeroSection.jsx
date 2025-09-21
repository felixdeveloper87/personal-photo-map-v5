import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { FaRocket, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import MiniMap from './MiniMap';

const MotionBox = motion.create(Box);

const HeroSection = ({ onOpenRegister, onOpenLogin }) => {
  const navigate = useNavigate();
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box
      bgGradient="linear(135deg, blue.600 0%, purple.700 50%, indigo.800 100%)"
      color="white"
      pt={12}
      pb={28}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.4
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(79, 70, 229, 0.1) 100%)',
        zIndex: 0
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
          <VStack align="start" spacing={10}>
            <Badge
              colorScheme="blue"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="md"
              fontWeight="bold"
              bg={useColorModeValue('blue.600', 'blue.400')}
              color="white"
              boxShadow="sm"
            >
              🎓 Educational Platform
            </Badge>

            <Heading
              size="2xl"
              lineHeight="1.2"
              fontWeight="extrabold"
              letterSpacing="tight"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              color={headingColor}
            >
              Discoverrrr the world through{' '}
              <Text
                as="span"
                bgGradient="linear(to-r, yellow.400, orange.400)"
                bgClip="text"
              >
                data-driven learning
              </Text>{' '}
              and interactive exploration
            </Heading>

            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={textColor}
              lineHeight="1.7"
              maxW="600px"
              fontWeight="medium"
            >
              Access comprehensive economic, social, and cultural data for every
              country, organize your travel memories, and transform your global
              understanding through interactive learning experiences.
            </Text>

            <HStack spacing={6} flexWrap="wrap">
              <Button
                size="lg"
                bgGradient={useColorModeValue(
                  'linear(135deg, blue.600, cyan.500)',
                  'linear(135deg, blue.400, cyan.400)'
                )}
                color="white"
                variant="solid"
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: 'xl'
                }}
                _active={{ transform: 'translateY(0)' }}
                leftIcon={<FaRocket />}
                onClick={onOpenRegister}
                px={10}
                py={7}
                fontSize="lg"
                fontWeight="bold"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
              >
                Start Learning
              </Button>

              <Button
                size="lg"
                variant="outline"
                borderColor={useColorModeValue('blue.600', 'blue.300')}
                color={useColorModeValue('blue.600', 'blue.300')}
                _hover={{
                  bg: useColorModeValue('blue.50', 'whiteAlpha.100'),
                  transform: 'translateY(-3px)',
                  boxShadow: 'lg'
                }}
                _active={{ transform: 'translateY(0)' }}
                leftIcon={<FaGlobe />}
                onClick={() => navigate('/map')}
                px={10}
                py={7}
                fontSize="lg"
                fontWeight="bold"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
              >
                Explore Data
              </Button>
            </HStack>
          </VStack>

          <Box position="relative">
            <MotionBox
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              {/* Container principal com gradiente e efeitos modernos */}
              <Box
                position="relative"
                borderRadius="3xl"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  right: '-20px',
                  bottom: '-20px',
                  bgGradient: useColorModeValue(
                    'linear(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08))',
                    'linear(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))'
                  ),
                  borderRadius: '3xl',
                  zIndex: -1,
                  filter: 'blur(20px)'
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: useColorModeValue(
                    'linear(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                    'linear(135deg, rgba(26, 32, 44, 0.9), rgba(45, 55, 72, 0.8))'
                  ),
                  borderRadius: '3xl',
                  zIndex: -1
                }}
              >
                {/* Header informativo sobre o mapa - mais fino */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  zIndex={5}
                  bgGradient={useColorModeValue(
                    'linear(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))',
                    'linear(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9))'
                  )}
                  color="white"
                  p={3}
                  textAlign="center"
                  backdropFilter="blur(10px)"
                  borderBottom="1px solid"
                  borderColor={useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)')}
                >
                  <VStack spacing={1}>
                    <Text fontSize="md" fontWeight="bold" letterSpacing="wide" color="white">
                      🌍 Explore the World
                    </Text>
                    <Text fontSize="xs" opacity={0.9} color="white" fontWeight="medium">
                      Interactive map with 195+ countries and real-time data
                    </Text>
                  </VStack>
                </Box>

                {/* Mapa com padding ajustado para o header mais fino */}
                <Box pt="60px" p={6}>
                  <MiniMap width="100%" height="500px" />
                </Box>
              </Box>
            </MotionBox>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
