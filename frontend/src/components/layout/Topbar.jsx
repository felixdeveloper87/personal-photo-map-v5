import React, { forwardRef } from 'react';
import { Box, Flex, HStack, Text, Icon, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { FaSearch, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useLandingTokens } from '../features/landing/landingUI';
import { SIDEBAR_WIDTH } from './Sidebar';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
};

const Topbar = forwardRef(({ nav }, ref) => {
  const t = useLandingTokens();

  return (
    <Box
      ref={ref}
      as="header"
      position="fixed"
      top={0}
      left={{ base: 0, lg: SIDEBAR_WIDTH }}
      right={0}
      h="64px"
      bg={t.surface}
      borderBottom="1px solid"
      borderColor={t.hairline}
      zIndex={1000}
      px={{ base: 4, md: 6 }}
    >
      <Flex h="full" align="center" justify="space-between" gap={4}>
        {/* Search */}
        <Button
          onClick={nav.handleSearchTrigger}
          leftIcon={<Icon as={FaSearch} boxSize={3.5} />}
          justifyContent="flex-start"
          w={{ base: '44px', md: '320px' }}
          h="40px"
          px={{ base: 0, md: 3.5 }}
          bg={t.surfaceSubtle}
          border="1px solid"
          borderColor={t.hairline}
          borderRadius="12px"
          color={t.textMuted}
          fontWeight="500"
          fontSize="sm"
          transition="all .2s ease"
          _hover={{ borderColor: t.primary, color: t.primary }}
          iconSpacing={{ base: 0, md: 2.5 }}
        >
          <Box as="span" display={{ base: 'none', md: 'inline' }}>Search photos...</Box>
        </Button>

        {/* Right controls */}
        <HStack spacing={2}>
          <Menu placement="bottom-end" gutter={10} autoSelect={false}>
            <MenuButton
              as={Button}
              h="40px"
              px={2}
              borderRadius="12px"
              bg="transparent"
              _hover={{ bg: t.surfaceSubtle }}
              _active={{ bg: t.surfaceSubtle }}
            >
              <HStack spacing={2.5}>
                <Flex
                  align="center"
                  justify="center"
                  w="30px"
                  h="30px"
                  borderRadius="full"
                  bg={t.primarySoftBg}
                  color={t.primary}
                  fontWeight="700"
                  fontSize="12px"
                >
                  {getInitials(nav.fullname)}
                </Flex>
                <Text display={{ base: 'none', md: 'block' }} fontSize="sm" fontWeight="600" color={t.text} maxW="140px" isTruncated>
                  {nav.fullname || 'Account'}
                </Text>
                <Icon as={FaChevronDown} boxSize={2.5} color={t.textMuted} display={{ base: 'none', md: 'block' }} />
              </HStack>
            </MenuButton>
            <MenuList bg={t.surface} borderColor={t.hairline} borderRadius="14px" boxShadow={t.shadowLg} py={2} minW="190px">
              {nav.fullname && (
                <Box px={3} py={1} mb={1}>
                  <Text fontSize="sm" fontWeight="700" color={t.text} isTruncated>{nav.fullname}</Text>
                  {nav.isPremium && (
                    <Text fontSize="11px" fontWeight="700" color={t.accent}>Premium</Text>
                  )}
                </Box>
              )}
              <MenuItem
                onClick={nav.handleLogout}
                bg="transparent"
                mx={2}
                px={2.5}
                py={2}
                w="auto"
                borderRadius="8px"
                color="#DC2626"
                fontSize="sm"
                fontWeight="500"
                _hover={{ bg: 'rgba(220,38,38,0.08)' }}
                _focus={{ bg: 'rgba(220,38,38,0.08)' }}
              >
                <HStack spacing={3}>
                  <Icon as={FaSignOutAlt} boxSize={4} />
                  <Text>Log out</Text>
                </HStack>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
});

Topbar.displayName = 'Topbar';
export default Topbar;
