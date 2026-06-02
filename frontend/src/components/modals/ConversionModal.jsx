import React, { useState, lazy, Suspense } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Heading,
  Box,
  Icon,
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
  FaCheckCircle,
  FaLock,
  FaTimes,
} from 'react-icons/fa';
import { useLandingTokens } from '../features/landing/landingUI';
import ModalButton from './ModalButton';

const LoginModal = lazy(() => import('./LoginModal'));
const RegisterModal = lazy(() => import('./RegisterModal'));

const ConversionModal = ({ isOpen, onClose, country }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const t = useLandingTokens();

  const isCountrySpecific = country && country.name;
  const pageTitle = isCountrySpecific ? country.name : 'Timeline & Photo Gallery';
  const pageDescription = isCountrySpecific
    ? `You're about to discover insights about ${country.name}.`
    : 'Access your personal timeline and photo gallery with global data and insights.';

  const features = [
    { icon: FaGlobe, title: 'Interactive World Map', description: 'Explore countries with real-time data and insights' },
    { icon: FaCamera, title: 'Photo Organization', description: 'Organize travel memories with educational context' },
    { icon: FaChartLine, title: 'Economic Data', description: 'Access social and economic indicators globally' },
    { icon: FaGraduationCap, title: 'Learning Journey', description: 'Transform your travels into global learning' },
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
      <Suspense fallback={<Box py={20} textAlign="center"><Spinner size="xl" color={t.primary} /></Box>}>
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
      <Suspense fallback={<Box py={20} textAlign="center"><Spinner size="xl" color={t.primary} /></Box>}>
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
      <ModalOverlay bg="rgba(2, 6, 23, 0.55)" backdropFilter="blur(6px)" />
      <ModalContent
        bg={t.surface}
        border="1px solid"
        borderColor={t.hairline}
        borderRadius="20px"
        boxShadow={t.shadowLg}
        overflow="hidden"
      >
        {/* Header */}
        <Box p={{ base: 6, md: 8 }} textAlign="center" position="relative" borderBottom="1px solid" borderColor={t.hairline}>
          <IconButton
            icon={<FaTimes />}
            onClick={handleClose}
            position="absolute"
            top={4}
            right={4}
            variant="ghost"
            borderRadius="10px"
            color={t.textMuted}
            _hover={{ bg: t.surfaceSubtle, color: t.text }}
            aria-label="Close modal"
          />

          <HStack spacing={2} justify="center" mb={3}>
            <Icon as={FaLock} boxSize={3} color={t.primary} />
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={t.primary}>
              Login required
            </Text>
          </HStack>

          <Heading
            size="lg"
            fontWeight="800"
            letterSpacing="-0.02em"
            color={t.text}
            mb={3}
          >
            Unlock {pageTitle}
          </Heading>
          <Text fontSize="md" color={t.textSoft} maxW="540px" mx="auto" lineHeight="1.7">
            {pageDescription} Create your free account to access all features and begin your journey.
          </Text>
        </Box>

        <ModalBody p={{ base: 6, md: 8 }}>
          <VStack spacing={7} align="stretch">
            {/* Features */}
            <Box>
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" color={t.textMuted} mb={4} textAlign="center">
                Timeline & Photo features
              </Text>
              <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                {features.map((f, i) => (
                  <HStack
                    key={i}
                    p={4}
                    bg={t.surface}
                    border="1px solid"
                    borderColor={t.hairline}
                    borderRadius="16px"
                    boxShadow={t.shadowSm}
                    spacing={3.5}
                    align="start"
                    transition="border-color .2s ease, box-shadow .2s ease, transform .2s ease"
                    _hover={{ transform: 'translateY(-2px)', borderColor: t.hairlineStrong, boxShadow: t.shadowMd }}
                  >
                    <Box display="inline-flex" p={2.5} borderRadius="10px" bg={t.primarySoftBg} color={t.primary}>
                      <Icon as={f.icon} boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="700" color={t.text} fontSize="sm">{f.title}</Text>
                      <Text fontSize="xs" color={t.textSoft} lineHeight="1.5">{f.description}</Text>
                    </VStack>
                  </HStack>
                ))}
              </Box>
            </Box>

            {/* Benefits */}
            <Box>
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" color={t.textMuted} mb={3} textAlign="center">
                Timeline benefits
              </Text>
              <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={2.5}>
                {timelineBenefits.map((b, i) => (
                  <HStack key={i} spacing={2.5}>
                    <Icon as={FaCheckCircle} color={t.primary} boxSize={3.5} />
                    <Text fontSize="sm" color={t.textSoft}>{b}</Text>
                  </HStack>
                ))}
              </Box>
            </Box>

            {/* Social proof */}
            <Box p={5} bg={t.surfaceSubtle} borderRadius="16px" border="1px solid" borderColor={t.hairline} textAlign="center">
              <HStack justify="center" spacing={2} mb={2}>
                <Icon as={FaUsers} color={t.primary} boxSize={4} />
                <Text fontWeight="700" color={t.text} fontSize="sm">Join thousands of learners worldwide</Text>
              </HStack>
              <Text fontSize="sm" color={t.textSoft} lineHeight="1.6">
                “I love how I can organize my travel photos and see my journey through time.” — Emma R.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg={t.surfaceSubtle} borderTop="1px solid" borderColor={t.hairline}>
          <VStack spacing={3} w="100%">
            <HStack spacing={3} justify="center" w="100%" flexWrap="wrap">
              <ModalButton variant="primary" leftIcon={<FaRocket />} onClick={() => setShowRegister(true)}>
                Create free account
              </ModalButton>
              <ModalButton variant="secondary" leftIcon={<FaLock />} onClick={() => setShowLogin(true)}>
                I already have an account
              </ModalButton>
            </HStack>
            <Text fontSize="xs" color={t.textMuted} textAlign="center">
              No credit card required · Setup in 2 minutes · 24/7 support
            </Text>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConversionModal;
