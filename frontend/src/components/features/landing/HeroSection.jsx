import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Heading, Text, VStack, HStack, Badge, Icon } from '@chakra-ui/react';
import { HiRocketLaunch, HiGlobeAlt, HiPhoto } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import MiniMap from './MiniMap';

const MotionBox = motion.create(Box);
const PATTERN_URL = 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';
const BUTTON_BEFORE = { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient: 'linear(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', borderRadius: 'xl', zIndex: -1, opacity: 0, transition: 'opacity 0.3s ease' };
const HIGHLIGHT_BEFORE = { content: '""', position: 'absolute', top: '-5px', left: '-5px', right: '-5px', bottom: '-5px', bg: 'rgba(251, 191, 36, 0.1)', borderRadius: 'lg', zIndex: -1 };

const HeroSection = ({ onOpenRegister, onOpenLogin }) => {
  const navigate = useNavigate();

  return (
    <Box
      bgGradient="linear(135deg, #1e40af 0%, #7c3aed 50%, #4338ca 100%)"
      color="white"
      pt={{ base: 20, md: 24, lg: 28 }}
      pb={{ base: 20, md: 28, lg: 32 }}
      position="relative"
      overflow="hidden"
      minH={{ base: "auto", lg: "90vh" }}
      display="flex"
      alignItems="center"
      mt="-1px"
      _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '100px', bgGradient: 'linear(to-b, rgba(0, 0, 0, 0.05) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }}
      _after={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bg: PATTERN_URL, opacity: 0.5, animation: 'subtleFloat 20s ease-in-out infinite', zIndex: 0 }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
          <VStack align="start" spacing={{ base: 6, md: 8, lg: 10 }} w="full">
            <MotionBox initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} whileHover={{ scale: 1.05 }}>
              <Badge variant="solid" px={{ base: 3, sm: 4, md: 6 }} py={{ base: 1.5, sm: 2, md: 3 }} borderRadius="full" fontSize={{ base: "xs", sm: "sm", md: "md" }} fontWeight="bold" bgGradient="linear(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))" color="white" boxShadow="0 8px 25px rgba(59, 130, 246, 0.4)" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.300" _hover={{ transform: 'scale(1.05)', boxShadow: '0 12px 35px rgba(59, 130, 246, 0.5)' }} transition="all 0.3s ease" position="relative" _before={{ content: '""', position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', bgGradient: 'linear(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', borderRadius: 'full', zIndex: -1 }}>
                <HStack spacing={2} align="center">
                  <Icon as={HiPhoto} boxSize={{ base: 3, sm: 4, md: 5 }} />
                  <Text>Travel Photo Organizer</Text>
                </HStack>
              </Badge>
            </MotionBox>

            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <Heading as="h1" lineHeight={{ base: "1.1", sm: "1.15", md: "1.2" }} fontWeight="extrabold" letterSpacing="tight" fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl', xl: '6xl' }} color="white" textShadow="0 4px 20px rgba(0,0,0,0.2)" position="relative" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient: 'linear(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', borderRadius: 'xl', zIndex: -1, transform: 'scaleX(0)', transformOrigin: 'left', animation: 'slideIn 1s ease-out 0.5s forwards' }} sx={{ '@keyframes slideIn': { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } } }}>
                Organize your travel photos by{' '}
                <MotionBox as="span" bgGradient="linear(to-r, #fbbf24, #f59e0b, #fb923c)" bgClip="text" textShadow="0 2px 15px rgba(251, 191, 36, 0.3)" display="inline-block" position="relative" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.8 }} _before={HIGHLIGHT_BEFORE}>
                  countries and dates
                </MotionBox>
                {' '}while learning about the world and creating{' '}
                <MotionBox as="span" bgGradient="linear(to-r, #fbbf24, #f59e0b, #fb923c)" bgClip="text" textShadow="0 2px 15px rgba(251, 191, 36, 0.4)" display="inline-block" position="relative" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.0 }} _before={HIGHLIGHT_BEFORE}>
                  social media ready videos
                </MotionBox>
              </Heading>
            </MotionBox>

            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
              <Text fontSize={{ base: 'sm', sm: 'md', md: 'lg', lg: 'xl' }} color="whiteAlpha.900" lineHeight={{ base: "1.6", md: "1.8" }} maxW="700px" fontWeight="medium" textShadow="0 2px 10px rgba(0,0,0,0.1)" position="relative" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient: 'linear(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', borderRadius: 'lg', zIndex: -1 }}>
                Upload and organize your travel photos by countries and dates, learn about each destination with comprehensive educational data, and create professional videos ready to share on social media.
              </Text>
            </MotionBox>

            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
              <HStack spacing={{ base: 3, md: 4 }} flexWrap="wrap" w="full">
                <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size={{ base: "md", md: "lg" }} bgGradient="linear(135deg, #3b82f6, #06b6d4)" color="white" variant="solid" _hover={{ bgGradient: "linear(135deg, #2563eb, #0891b2)", transform: 'translateY(-2px)', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)', _before: { opacity: 1 } }} _active={{ transform: 'translateY(0)', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)' }} leftIcon={<HiRocketLaunch />} onClick={onOpenRegister} px={{ base: 4, sm: 6, md: 10 }} py={{ base: 5, sm: 6, md: 7 }} fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="bold" transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" borderRadius="xl" boxShadow="0 10px 30px rgba(59, 130, 246, 0.3)" flex={{ base: "1 1 auto", md: "0 0 auto" }} minW={{ base: "140px", md: "auto" }} position="relative" _before={BUTTON_BEFORE}>
                    Start Learning
                  </Button>
                </MotionBox>

                <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size={{ base: "md", md: "lg" }} variant="outline" borderWidth="2px" borderColor="white" color="white" bg="whiteAlpha.100" backdropFilter="blur(10px)" _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)', boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)', borderColor: 'whiteAlpha.900', _before: { opacity: 1 } }} _active={{ transform: 'translateY(0)', bg: 'whiteAlpha.300' }} leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')} px={{ base: 4, sm: 6, md: 10 }} py={{ base: 5, sm: 6, md: 7 }} fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="bold" transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" borderRadius="xl" flex={{ base: "1 1 auto", md: "0 0 auto" }} minW={{ base: "140px", md: "auto" }} position="relative" _before={BUTTON_BEFORE}>
                    Explore Map
                  </Button>
                </MotionBox>
              </HStack>
            </MotionBox>
          </VStack>

          <Box position="relative" display={{ base: "none", lg: "block" }}>
            <MotionBox initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }} whileHover={{ scale: 1.02 }}>
              <Box position="relative" borderRadius="2xl" overflow="hidden" boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)" border="1px solid" borderColor="whiteAlpha.200" bg="white" _dark={{ bg: "gray.800" }} _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient: 'linear(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))', borderRadius: '2xl', zIndex: 1, pointerEvents: 'none' }}>
                <Box bgGradient="linear(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))" color="white" px={6} py={4} textAlign="center" backdropFilter="blur(10px)" borderBottom="1px solid" borderColor="whiteAlpha.200" position="relative" _before={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgGradient: 'linear(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', zIndex: -1 }}>
                  <VStack spacing={1}>
                    <MotionBox initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
                      <Text fontSize="lg" fontWeight="bold" letterSpacing="wide">🌍 Interactive World Map</Text>
                      <Text fontSize="sm" opacity={0.9} fontWeight="medium">195+ countries • Real-time data • Educational insights</Text>
                    </MotionBox>
                  </VStack>
                </Box>

                <Box p={6} position="relative" zIndex={2}>
                  <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
                    <MiniMap width="100%" height="480px" />
                  </MotionBox>
                </Box>

                <Box position="absolute" top={4} right={4} w={3} h={3} bg="green.400" borderRadius="full" boxShadow="0 0 10px rgba(72, 187, 120, 0.6)" animation="pulse 2s infinite" zIndex={3} />
                <Box position="absolute" bottom={4} left={4} w={2} h={2} bg="blue.400" borderRadius="full" boxShadow="0 0 8px rgba(59, 130, 246, 0.6)" animation="pulse 3s infinite" zIndex={3} />
              </Box>
            </MotionBox>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
