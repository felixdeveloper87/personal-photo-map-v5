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
  Spinner
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
  FaTimes
} from 'react-icons/fa';

// Lazy loading para os modais
const LoginModal = lazy(() => import('./LoginModal'));
const RegisterModal = lazy(() => import('./RegisterModal'));

const ConversionModal = ({ isOpen, onClose, country }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.900', 'white');

  // Determine if this is for a specific country or general access
  const isCountrySpecific = country && country.name;
  const pageTitle = isCountrySpecific ? country.name : 'Timeline & Photo Gallery';
  const pageDescription = isCountrySpecific 
    ? `You're about to discover amazing insights about ${country.name}.`
    : "You're about to access your personal timeline and photo gallery.";

  const features = [
    {
      icon: FaGlobe,
      title: 'Interactive World Map',
      description: 'Explore countries with real-time data and educational insights',
      color: 'blue'
    },
    {
      icon: FaCamera,
      title: 'Photo Organization',
      description: 'Organize your travel memories by country with educational context',
      color: 'green'
    },
    {
      icon: FaChartLine,
      title: 'Economic Data',
      description: 'Access World Bank indicators and social metrics for every country',
      color: 'purple'
    },
    {
      icon: FaGraduationCap,
      title: 'Learning Journey',
      description: 'Transform travel experiences into educational opportunities',
      color: 'orange'
    }
  ];

  const timelineBenefits = [
    'Personal photo timeline by year',
    'Organize memories by country',
    'Track your global journey',
    'Share travel experiences',
    'Educational insights for each location',
    'Free photo storage and organization'
  ];

  const handleClose = () => {
    setShowLogin(false);
    setShowRegister(false);
    onClose();
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleRegister = () => {
    setShowRegister(true);
  };

  if (showLogin) {
    return (
      <Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" h="200px">
          <Spinner size="xl" color="blue.500" />
        </Box>
      }>
        <LoginModal
          isOpen={showLogin}
          onClose={handleClose}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      </Suspense>
    );
  }

  if (showRegister) {
    return (
      <Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" h="200px">
          <Spinner size="xl" color="blue.500" />
        </Box>
      }>
        <RegisterModal
          isOpen={showRegister}
          onClose={handleClose}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      </Suspense>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent
        bg={bgColor}
        borderRadius="2xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        {/* Header with gradient */}
        <Box
          bgGradient="linear(135deg, blue.500, purple.600)"
          color="white"
          p={6}
          textAlign="center"
          position="relative"
        >
          {/* Close button */}
          <IconButton
            icon={<FaTimes />}
            onClick={handleClose}
            position="absolute"
            top={4}
            right={4}
            zIndex={2}
            variant="ghost"
            color="white"
            _hover={{
              bg: 'whiteAlpha.200',
              transform: 'scale(1.1)'
            }}
            _active={{ transform: 'scale(0.95)' }}
            transition="all 0.2s ease"
            aria-label="Close modal"
          />
          
          <Box position="relative" zIndex={1}>
            <Badge
              bgGradient="linear(135deg, yellow.400, orange.400)"
              color="white"
              variant="solid"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              mb={3}
            >
              🔒 Login Required
            </Badge>
            
            <Heading size="lg" mb={3} lineHeight="1.2">
              Unlock {pageTitle} and the World! 🌍
            </Heading>
            
            <Text fontSize="md" opacity={0.95} maxW="500px" mx="auto">
              {pageDescription} 
              Create a free account to access comprehensive data, organize your photos, 
              and start your global learning journey!
            </Text>
          </Box>
        </Box>

        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Features Grid */}
            <Box>
              <Heading size="sm" color={headingColor} mb={4} textAlign="center">
                Timeline & Photo Features:
              </Heading>
              
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
              >
                {features.map((feature, index) => (
                  <HStack
                    key={index}
                    p={4}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    spacing={3}
                    align="start"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                      borderColor: `${feature.color}.300`
                    }}
                    transition="all 0.3s ease"
                  >
                    <Box
                      p={2.5}
                      bgGradient={`linear(135deg, ${feature.color}.400, ${feature.color}.600)`}
                      borderRadius="md"
                      color="white"
                      boxShadow="md"
                    >
                      <Icon as={feature.icon} boxSize={4} />
                    </Box>
                    
                    <VStack align="start" spacing={1.5} flex={1}>
                      <Heading size="xs" color={headingColor}>
                        {feature.title}
                      </Heading>
                      <Text fontSize="xs" color={textColor} lineHeight="1.4">
                        {feature.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </Box>
            </Box>

            {/* Benefits List */}
            <Box>
              <Heading size="sm" color={headingColor} mb={3} textAlign="center">
                Timeline Benefits:
              </Heading>
              
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={2.5}
              >
                {timelineBenefits.map((benefit, index) => (
                  <HStack key={index} spacing={2.5}>
                    <Icon as={FaStar} color="yellow.400" boxSize={3} />
                    <Text fontSize="xs" color={textColor}>
                      {benefit}
                    </Text>
                  </HStack>
                ))}
              </Box>
            </Box>

            {/* Social Proof */}
            <Box
              p={4}
              bg={useColorModeValue('blue.50', 'blue.900')}
              borderRadius="lg"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              textAlign="center"
            >
              <HStack justify="center" spacing={2} mb={2}>
                <Icon as={FaUsers} color="blue.500" boxSize={4} />
                <Text fontWeight="bold" color="blue.700" fontSize="sm">
                  Join thousands of learners worldwide
                </Text>
              </HStack>
              <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')}>
                "I love how I can organize my travel photos and see my journey through time. The timeline feature is incredible!" - Emma Rodriguez, Travel Blogger
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter
          p={6}
          bg={useColorModeValue('gray.50', 'gray.800')}
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack spacing={3} w="100%">
            <HStack spacing={7} justify="center" w="100%">
              <Button
                size="md"
                bgGradient="linear(135deg, green.500, teal.500)"
                color="white"
                variant="solid"
                _hover={{
                  bgGradient: "linear(135deg, green.600, teal.600)",
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl'
                }}
                _active={{ transform: 'translateY(0)' }}
                leftIcon={<FaRocket />}
                onClick={handleRegister}
                px={6}
                py={4}
                fontSize="md"
                fontWeight="bold"
                borderRadius="xl"
                transition="all 0.3s ease"
              >
                Create Free Account
              </Button>
              
              <Button
                size="md"
                variant="outline"
                borderColor={useColorModeValue('gray.400', 'gray.500')}
                borderWidth="2px"
                color={useColorModeValue('gray.700', 'gray.300')}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  borderColor: useColorModeValue('gray.600', 'gray.400'),
                  transform: 'translateY(-2px)'
                }}
                _active={{ transform: 'translateY(0)' }}
                leftIcon={<FaLock />}
                onClick={handleLogin}
                px={6}
                py={4}
                fontSize="md"
                fontWeight="semibold"
                borderRadius="xl"
                transition="all 0.3s ease"
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
