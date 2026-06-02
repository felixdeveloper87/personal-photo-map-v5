import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, VStack, HStack, Text, Icon, Image, Button } from '@chakra-ui/react';
import { FaGlobe, FaClock, FaCrown } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import { useLandingTokens } from '../features/landing/landingUI';
import SettingsMenu from './SettingsMenu';

export const SIDEBAR_WIDTH = '256px';

const NavItem = ({ icon, label, active, onClick, accent }) => {
  const t = useLandingTokens();
  return (
    <Button
      onClick={onClick}
      w="full"
      h="42px"
      px={3}
      justifyContent="flex-start"
      borderRadius="10px"
      fontWeight="600"
      fontSize="sm"
      bg={active ? t.primarySoftBg : 'transparent'}
      color={active ? t.primary : t.textSoft}
      transition="all .2s ease"
      _hover={{ bg: t.primarySoftBg, color: t.primary }}
      _active={{ bg: t.primarySoftBg }}
      leftIcon={<Icon as={icon} boxSize={4} color={accent && !active ? t.accent : undefined} />}
    >
      {label}
    </Button>
  );
};

const Sidebar = ({ nav }) => {
  const t = useLandingTokens();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      w={SIDEBAR_WIDTH}
      bg={t.surface}
      borderRight="1px solid"
      borderColor={t.hairline}
      zIndex={1100}
      display="flex"
      flexDirection="column"
      px={4}
      py={5}
    >
      {/* Brand */}
      <HStack
        spacing={2.5}
        px={2}
        mb={6}
        cursor="pointer"
        onClick={() => navigate('/')}
        role="group"
      >
        <Image src={logo} alt="Photomap" h="34px" w="34px" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))" />
        <Text fontFamily="heading" fontSize="xl" fontWeight="900" letterSpacing="-0.02em" lineHeight="1">
          <Box as="span" color={t.text}>Photo</Box>
          <Box as="span" color={t.primary}>map</Box>
        </Text>
      </HStack>

      {/* Primary nav */}
      <VStack spacing={1} align="stretch">
        <Text px={3} mb={1} fontSize="10px" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={t.textMuted}>
          Menu
        </Text>
        <NavItem icon={FaGlobe} label="Map" active={isActive('/map')} onClick={() => navigate('/map/private')} />
        <NavItem icon={FaClock} label="Timeline" active={isActive('/timeline')} onClick={() => navigate('/timeline')} />
        <NavItem icon={FaCrown} label="Premium" accent onClick={nav.premiumModal.onOpen} />
      </VStack>

      {/* Settings group */}
      <VStack spacing={1} align="stretch" mt={6}>
        <Text px={3} mb={1} fontSize="10px" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={t.textMuted}>
          Account
        </Text>
        <SettingsMenu
          variant="rail"
          onProfile={nav.profileModal.onOpen}
          onPhotos={nav.photoStorageModal.onOpen}
        />
      </VStack>

      <Box flex="1" />

      {/* Footer hint */}
      <Text px={3} fontSize="11px" color={t.textMuted}>
        Journey through photos
      </Text>
    </Box>
  );
};

export default Sidebar;
