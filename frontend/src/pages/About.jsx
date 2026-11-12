import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Avatar, Box, Container, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { HiCamera, HiEnvelope, HiGlobeAmericas, HiMap, HiPhoto, HiSparkles, HiUserCircle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import ModalButton from '../components/modals/ModalButton';
import { IconTile, ModalActions, ToneBadge } from '../components/modals/ModalKit';
import { GlowCard, Eyebrow } from '../components/features/landing/landingUI';
import { color, font, type } from '../design/tokens';

const MotionBox = motion.create(Box);

const FEATURES = [
  { icon: HiCamera, tone: 'brand', title: 'Capture Memories', text: 'Upload photos from your travels and organize them by country and year' },
  { icon: HiGlobeAmericas, tone: 'teal', title: 'Explore the World', text: 'Visualize your travels on an interactive world map and track your progress' },
  { icon: HiMap, tone: 'rose', title: 'Plan Adventures', text: 'Discover new destinations and plan your next adventure' },
];

/** Soft amber/teal glow behind the page — the Atlas replacement for the old rainbow gradient. */
const PageGlow = () => (
  <Box
    aria-hidden
    position="absolute"
    inset={0}
    pointerEvents="none"
    bg="radial-gradient(900px 480px at 15% -10%, rgba(235,181,114,0.10), transparent 60%), radial-gradient(700px 420px at 95% 10%, rgba(111,208,196,0.07), transparent 60%)"
  />
);

const About = () => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <Box minH="100vh" bg={color.bg} display="flex" alignItems="center" justifyContent="center" position="relative" px={4}>
        <PageGlow />
        <Container maxW="md" position="relative" zIndex={1}>
          <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlowCard textAlign="center" p={{ base: 7, md: 10 }}>
              <VStack spacing={5}>
                <IconTile icon={HiMap} size="lg" />
                <Text {...type.display} fontSize={{ base: '2rem', md: '2.4rem' }} color={color.text}>
                  Welcome to PhotoMap
                </Text>
                <Text color={color.textSoft} lineHeight="1.7">
                  Your personal travel companion for capturing and mapping memories around the world.
                </Text>
                <ModalButton variant="primary" size="lg" leftIcon={<HiUserCircle />} onClick={() => navigate('/')}>
                  Get started
                </ModalButton>
              </VStack>
            </GlowCard>
          </MotionBox>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={color.bg} py={{ base: 8, md: 14 }} position="relative" px={{ base: 3, md: 0 }}>
      <PageGlow />
      <Container maxW="4xl" position="relative" zIndex={1}>
        <MotionBox initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <VStack spacing={6} align="stretch">
            {/* Profile */}
            <GlowCard>
              <VStack spacing={5} textAlign="center">
                <Avatar
                  size="xl"
                  name={fullname}
                  bg={color.primary}
                  color={color.textOnBrand}
                  fontWeight="700"
                  ring="2px"
                  ringOffset="3px"
                  ringOffsetColor={color.bg}
                  ringColor={isPremium ? color.primary : color.hairlineMid}
                />
                <VStack spacing={2.5}>
                  <Text fontFamily={font.display} fontSize={{ base: '2rem', md: '2.6rem' }} lineHeight="1.04" color={color.text}>
                    {fullname}
                  </Text>
                  <HStack spacing={2} justify="center" flexWrap="wrap">
                    <ToneBadge tone="teal" icon={HiGlobeAmericas}>
                      Travel Explorer
                    </ToneBadge>
                    {isPremium && (
                      <ToneBadge tone="brand" icon={HiSparkles}>
                        Premium Member
                      </ToneBadge>
                    )}
                  </HStack>
                </VStack>
                <HStack spacing={2} color={color.textSoft}>
                  <Icon as={HiEnvelope} />
                  <Text fontSize="sm">{email}</Text>
                </HStack>
              </VStack>
            </GlowCard>

            {/* About */}
            <GlowCard>
              <VStack spacing={6} align="stretch">
                <VStack spacing={3} textAlign="center">
                  <Eyebrow>About</Eyebrow>
                  <Text {...type.display} fontSize={{ base: '1.9rem', md: '2.3rem' }} color={color.text}>
                    About PhotoMap
                  </Text>
                  <Text color={color.textSoft} fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8" maxW="620px">
                    PhotoMap is your personal travel companion that helps you document and visualize your journey around the
                    world. Upload photos from your adventures and watch as your travel map comes to life, creating a
                    beautiful visual story of your experiences.
                  </Text>
                </VStack>

                <Box h="1px" bg={color.hairline} />

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {FEATURES.map((f) => (
                    <VStack key={f.title} spacing={3} textAlign="center">
                      <IconTile icon={f.icon} tone={f.tone} />
                      <Text fontWeight="700" color={color.text}>
                        {f.title}
                      </Text>
                      <Text color={color.textSoft} fontSize="sm" lineHeight="1.6">
                        {f.text}
                      </Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </VStack>
            </GlowCard>

            {/* CTA */}
            <GlowCard textAlign="center">
              <VStack spacing={4}>
                <Text {...type.display} fontSize={{ base: '1.8rem', md: '2.2rem' }} color={color.text}>
                  Ready for your next adventure?
                </Text>
                <Text color={color.textSoft}>Start exploring the world and documenting your journey today!</Text>
                <ModalActions align="center" maxW="440px">
                  <ModalButton variant="secondary" size="lg" leftIcon={<HiPhoto />} onClick={() => navigate('/timeline')}>
                    View timeline
                  </ModalButton>
                  <ModalButton variant="primary" size="lg" leftIcon={<HiGlobeAmericas />} onClick={() => navigate('/map/private')}>
                    View countries
                  </ModalButton>
                </ModalActions>
              </VStack>
            </GlowCard>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default About;
