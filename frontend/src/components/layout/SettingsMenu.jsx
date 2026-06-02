import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button, HStack, Icon, Text, Box } from '@chakra-ui/react';
import { FaBars, FaCog, FaUserCircle, FaImages, FaChevronRight } from 'react-icons/fa';
import { useLandingTokens } from '../features/landing/landingUI';

/**
 * "Sandwich" Settings menu grouping Profile + Photos.
 * variant: 'pill' (compact header button) | 'icon' (mobile icon button) | 'rail' (full-width sidebar item).
 */
const SettingsMenu = ({
  onProfile,
  onPhotos,
  variant = 'pill',
  size = 'sm',
  hideText = false,
  items,
  title = 'Settings',
  ...props
}) => {
  const t = useLandingTokens();

  const menuItems = items || [
    { icon: FaUserCircle, label: 'Profile', onClick: onProfile },
    { icon: FaImages, label: 'Photos', onClick: onPhotos },
  ];

  const isRail = variant === 'rail';
  const isIcon = variant === 'icon';

  const triggerStyles = isRail
    ? {
        w: 'full',
        h: '42px',
        px: 3,
        justifyContent: 'flex-start',
        borderRadius: '10px',
        bg: 'transparent',
        color: t.textSoft,
        fontWeight: '600',
        fontSize: 'sm',
        _hover: { bg: t.primarySoftBg, color: t.primary },
        _active: { bg: t.primarySoftBg },
      }
    : isIcon
    ? {
        h: '38px',
        w: '44px',
        minW: '44px',
        p: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '14px',
        bg: 'transparent',
        border: '1px solid',
        borderColor: t.hairlineStrong,
        color: t.textSoft,
        _hover: { bg: t.primarySoftBg, borderColor: t.primary, color: t.primary },
        _active: { bg: t.primarySoftBg },
      }
    : {
        h: size === 'xs' ? '28px' : '34px',
        px: 3,
        borderRadius: 'full',
        bg: 'transparent',
        border: '1px solid',
        borderColor: t.hairlineStrong,
        color: t.textSoft,
        fontWeight: '600',
        fontSize: '12px',
        _hover: { bg: t.primarySoftBg, borderColor: t.primary, color: t.primary },
      };

  return (
    <Menu placement={isRail ? 'right-start' : 'bottom-end'} gutter={isRail ? 12 : 8} autoSelect={false}>
      <MenuButton as={Button} transition="all .2s ease" {...triggerStyles} {...props}>
        {isRail ? (
          <HStack w="full" justify="space-between">
            <HStack spacing={3}>
              <Icon as={FaCog} boxSize={4} />
              <Text>Settings</Text>
            </HStack>
            <Icon as={FaChevronRight} boxSize={2.5} opacity={0.6} />
          </HStack>
        ) : (
          hideText ? (
            <Icon as={FaBars} boxSize="15px" display="block" />
          ) : (
            <HStack spacing={2}>
              <Icon as={FaBars} boxSize="13px" />
              <Text>{title}</Text>
            </HStack>
          )
        )}
      </MenuButton>

      <MenuList
        bg={t.surface}
        borderColor={t.hairline}
        borderRadius="14px"
        boxShadow={t.shadowLg}
        py={2}
        minW="200px"
      >
        <Box px={3} pb={2} pt={1}>
          <Text fontSize="10px" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={t.textMuted}>
            {title}
          </Text>
        </Box>
        {menuItems.map((it) => (
          <MenuItem
            key={it.label}
            onClick={it.onClick}
            bg="transparent"
            borderRadius="8px"
            mx={2}
            px={2.5}
            py={2}
            w="auto"
            color={it.danger ? '#DC2626' : t.text}
            fontSize="sm"
            fontWeight="500"
            _hover={it.danger ? { bg: 'rgba(220,38,38,0.08)' } : { bg: t.primarySoftBg, color: t.primary }}
            _focus={it.danger ? { bg: 'rgba(220,38,38,0.08)' } : { bg: t.primarySoftBg, color: t.primary }}
          >
            <HStack spacing={3}>
              <Icon as={it.icon} boxSize={4} color={it.danger ? '#DC2626' : t.primary} />
              <Text>{it.label}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default SettingsMenu;
