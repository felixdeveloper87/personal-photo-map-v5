import { useState, lazy, Suspense } from 'react';
import { Box, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { HiAcademicCap, HiCamera, HiChartBar, HiGlobeAmericas, HiLockClosed, HiRocketLaunch, HiUsers } from 'react-icons/hi2';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { CheckItem, IconTile, ModalActions, ModalSection, Panel } from './ModalKit';
import { color } from '../../design/tokens';

const LoginModal = lazy(() => import('./LoginModal'));
const RegisterModal = lazy(() => import('./RegisterModal'));

const FEATURES = [
  { icon: HiGlobeAmericas, tone: 'brand', title: 'Interactive world map', description: 'Explore countries with real-time data and insights' },
  { icon: HiCamera, tone: 'teal', title: 'Photo organisation', description: 'Organise travel memories with educational context' },
  { icon: HiChartBar, tone: 'rose', title: 'Economic data', description: 'Access social and economic indicators globally' },
  { icon: HiAcademicCap, tone: 'brand', title: 'Learning journey', description: 'Transform your travels into global learning' },
];

const BENEFITS = [
  'Personal photo timeline by year',
  'Organize memories by country',
  'Track your global journey',
  'Share travel experiences',
  'Educational insights for each location',
  'Free photo storage and organization',
];

const Fallback = () => (
  <Box py={20} textAlign="center">
    <Spinner size="xl" />
  </Box>
);

const ConversionModal = ({ isOpen, onClose, country }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const isCountrySpecific = country && country.name;
  const pageTitle = isCountrySpecific ? country.name : 'Timeline & Photo Gallery';
  const pageDescription = isCountrySpecific
    ? `You're about to discover insights about ${country.name}.`
    : 'Access your personal timeline and photo gallery with global data and insights.';

  const handleClose = () => {
    setShowLogin(false);
    setShowRegister(false);
    onClose();
  };

  if (showLogin) {
    return (
      <Suspense fallback={<Fallback />}>
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
      <Suspense fallback={<Fallback />}>
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

  const footer = (
    <VStack spacing={3} w="full">
      <ModalActions>
        <ModalButton variant="secondary" leftIcon={<HiLockClosed />} onClick={() => setShowLogin(true)}>
          I already have an account
        </ModalButton>
        <ModalButton variant="primary" leftIcon={<HiRocketLaunch />} onClick={() => setShowRegister(true)}>
          Create free account
        </ModalButton>
      </ModalActions>
      <Text fontSize="xs" color={color.textMuted} textAlign={{ base: 'center', sm: 'right' }} w="full">
        No credit card required · Setup in 2 minutes · 24/7 support
      </Text>
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow="Login required"
      title={`Unlock ${pageTitle}`}
      subtitle={`${pageDescription} Create your free account to access all features and begin your journey.`}
      icon={HiLockClosed}
      footer={footer}
      size={{ base: 'full', sm: 'xl', md: '3xl' }}
    >
      <VStack spacing={6} align="stretch">
        <ModalSection title="Timeline & photo features">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {FEATURES.map((f) => (
              <Panel key={f.title} interactive>
                <HStack spacing={3.5} align="start">
                  <IconTile icon={f.icon} tone={f.tone} />
                  <Box>
                    <Text fontWeight="700" color={color.text} fontSize="sm">
                      {f.title}
                    </Text>
                    <Text fontSize="xs" color={color.textSoft} lineHeight="1.5" mt={0.5}>
                      {f.description}
                    </Text>
                  </Box>
                </HStack>
              </Panel>
            ))}
          </SimpleGrid>
        </ModalSection>

        <ModalSection title="Timeline benefits">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={2.5}>
            {BENEFITS.map((b) => (
              <CheckItem key={b}>{b}</CheckItem>
            ))}
          </SimpleGrid>
        </ModalSection>

        <Panel tone="brand" textAlign="center">
          <HStack justify="center" spacing={2} mb={1.5} color={color.primary}>
            <HiUsers />
            <Text fontWeight="700" color={color.text} fontSize="sm">
              Join thousands of learners worldwide
            </Text>
          </HStack>
          <Text fontSize="sm" color={color.textSoft} lineHeight="1.6">
            “I love how I can organize my travel photos and see my journey through time.” — Emma R.
          </Text>
        </Panel>
      </VStack>
    </BaseModal>
  );
};

export default ConversionModal;
