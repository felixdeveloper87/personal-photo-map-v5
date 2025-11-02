import React, { useState, lazy, Suspense } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Box,
  Icon,
  useColorModeValue,
  Badge,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import {
  FaGlobe,
  FaCamera,
  FaChartLine,
  FaGraduationCap,
  FaRocket,
  FaUsers,
  FaStar,
  FaLock,
  FaTimes,
} from 'react-icons/fa';

const LoginModal = lazy(() => import('./LoginModal'));
const RegisterModal = lazy(() => import('./RegisterModal'));

const ConversionModal = ({ isOpen, onClose, country }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const cardBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(0,0,0,0.55)');
  const borderColor = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.900', 'white');

  const isCountrySpecific = country && country.name;
  const pageTitle = isCountrySpecific ? country.name : 'Timeline & Photo Gallery';
  const pageDescription = isCountrySpecific
    ? `You're about to discover amazing insights about ${country.name}.`
    : 'Access your personal timeline and photo gallery with global data and insights.';

  const features = [
    { icon: FaGlobe, title: 'Interactive World Map', description: 'Explore countries with real-time data and insights', color: 'blue' },
    { icon: FaCamera, title: 'Photo Organization', description: 'Organize travel memories with educational context', color: 'green' },
    { icon: FaChartLine, title: 'Economic Data', description: 'Access social and economic indicators globally', color: 'purple' },
    { icon: FaGraduationCap, title: 'Learning Journey', description: 'Transform your travels into global learning', color: 'orange' },
  ];

  const timelineBenefits = [
    'Personal photo timeline by year',
    'Organize memories by country',
    'Track your global journey',
    'Share travel experiences',
    'Educational insights for each location',
    'Free photo storage and organization',
  ];

  const handleClose = () => {
    setShowLogin(false);
    setShowRegister(false);
    onClose();
  };

  if (showLogin) {
    return (
      <Suspense fallback={<Box py={20} textAlign="center"><Spinner size="xl" color="blue.400" /></Box>}>
        <LoginModal
          isOpen={showLogin}
          onClose={handleClose}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
        />
      </Suspense>
    );
  }

  if (showRegister) {
    return (
      <Suspense fallback={<Box py={20} textAlign="center"><Spinner size="xl" color="green.400" /></Box>}>
        <RegisterModal
          isOpen={showRegister}
          onClose={handleClose}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      </Suspense>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg={cardBg}
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        boxShadow={useColorModeValue('0 4px 30px rgba(0,0,0,0.08)', '0 4px 30px rgba(255,255,255,0.06)')}
      >
        {/* Header */}
        <Box
          bgGradient="linear(135deg, rgba(56,128,255,0.85), rgba(168,85,247,0.85))"
          backdropFilter="blur(8px)"
          color="white"
          p={6}
          textAlign="center"
          borderTopRadius="2xl"
          position="relative"
        >
          <IconButton
            icon={<FaTimes />}
            onClick={handleClose}
            position="absolute"
            top={4}
            right={4}
            variant="ghost"
            color="whiteAlpha.900"
            _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.1)' }}
            _active={{ transform: 'scale(0.95)' }}
            aria-label="Close modal"
          />
          <Badge
            bgGradient="linear(135deg, yellow.400, orange.400)"
            color="white"
            px={3}
            py={1.5}
            borderRadius="full"
            fontSize="sm"
            fontWeight="bold"
            mb={3}
          >
            🔒 Login Required
          </Badge>

          <Heading size="lg" mb={3}>Unlock {pageTitle} 🌍</Heading>
          <Text fontSize="md" opacity={0.95} maxW="520px" mx="auto">
            {pageDescription} Create your free account to access all features and begin your journey.
          </Text>
        </Box>

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">

            {/* Features */}
            <Box>
              <Heading size="sm" color={headingColor} mb={4} textAlign="center">
                Timeline & Photo Features:
              </Heading>
              <Box
                display="grid"
                gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
              >
                {features.map((f, i) => (
                  <HStack
                    key={i}
                    p={4}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    backdropFilter="blur(8px)"
                    spacing={3}
                    align="start"
                    transition="all 0.3s ease"
                    _hover={{
                      transform: 'translateY(-2px)',
                      borderColor: `${f.color}.400`,
                      boxShadow: `0 0 8px var(--chakra-colors-${f.color}-300)`,
                    }}
                  >
                    <Box
                      p={2.5}
                      borderRadius="md"
                      bgGradient={`linear(135deg, ${f.color}.400, ${f.color}.600)`}
                      color="white"
                      boxShadow="md"
                    >
                      <Icon as={f.icon} boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color={headingColor} fontSize="sm">
                        {f.title}
                      </Text>
                      <Text fontSize="xs" color={textColor} lineHeight="1.4">
                        {f.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </Box>
            </Box>

            {/* Benefits */}
            <Box>
              <Heading size="sm" color={headingColor} mb={3} textAlign="center">
                Timeline Benefits:
              </Heading>
              <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={2.5}>
                {timelineBenefits.map((b, i) => (
                  <HStack key={i} spacing={2}>
                    <Icon as={FaStar} color="yellow.400" boxSize={3} />
                    <Text fontSize="xs" color={textColor}>{b}</Text>
                  </HStack>
                ))}
              </Box>
            </Box>

            {/* Social Proof */}
            <Box
              p={4}
              bg={useColorModeValue('rgba(219,234,254,0.6)', 'rgba(30,64,175,0.4)')}
              borderRadius="lg"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              backdropFilter="blur(8px)"
              textAlign="center"
            >
              <HStack justify="center" spacing={2} mb={2}>
                <Icon as={FaUsers} color="blue.400" boxSize={4} />
                <Text fontWeight="bold" color={useColorModeValue('blue.700', 'blue.200')} fontSize="sm">
                  Join thousands of learners worldwide
                </Text>
              </HStack>
              <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')}>
                “I love how I can organize my travel photos and see my journey through time.” — Emma R.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter
          bg={useColorModeValue('rgba(255,255,255,0.6)', 'rgba(0,0,0,0.6)')}
          backdropFilter="blur(8px)"
          borderTop="1px solid"
          borderColor={borderColor}
          borderBottomRadius="2xl"
        >
          <VStack spacing={3} w="100%">
            <HStack spacing={5} justify="center" w="100%">
              <Button
                bgGradient="linear(135deg, green.400, teal.400)"
                color="white"
                fontWeight="bold"
                px={6}
                py={4}
                borderRadius="xl"
                _hover={{
                  bgGradient: 'linear(135deg, green.500, teal.500)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 10px rgba(72,187,120,0.4)',
                }}
                _active={{ transform: 'translateY(0)' }}
                leftIcon={<FaRocket />}
                onClick={() => setShowRegister(true)}
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                borderColor={useColorModeValue('gray.400', 'gray.500')}
                borderWidth="2px"
                color={useColorModeValue('gray.700', 'gray.200')}
                px={6}
                py={4}
                borderRadius="xl"
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  transform: 'translateY(-2px)',
                }}
                _active={{ transform: 'translateY(0)' }}
                leftIcon={<FaLock />}
                onClick={() => setShowLogin(true)}
              >
                I Already Have an Account
              </Button>
            </HStack>

            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
              ✨ No credit card required • Setup in 2 minutes • 24/7 Support
            </Text>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConversionModal;
