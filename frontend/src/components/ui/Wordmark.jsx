import { memo } from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import logo from '../../assets/logo.png';
import { color, font, type } from '../../design/tokens';

/**
 * PhotoMap wordmark — the one brand lockup used everywhere (landing, header, sidebar, footer).
 * Serif "Photo" in cream + italic amber "Map", preceded by either the map-pin dot or the app logo.
 */
const Wordmark = ({ mark = 'pin', size = 'md', tagline, onClick, ...props }) => {
  const fontSize = { sm: '20px', md: { base: '21px', md: '24px' }, lg: { base: '24px', md: '30px' } }[size] || '24px';
  const logoSize = { sm: '28px', md: { base: '30px', md: '36px' }, lg: '40px' }[size] || '36px';

  return (
    <Flex
      align="center"
      gap={2.5}
      minW="max-content"
      cursor={onClick ? 'pointer' : undefined}
      onClick={onClick}
      role={onClick ? 'link' : undefined}
      aria-label={onClick ? 'PhotoMap home' : undefined}
      userSelect="none"
      sx={{ '&:hover .wm-pin': { boxShadow: '0 0 24px rgba(235,181,114,0.7)' } }}
      {...props}
    >
      {mark === 'logo' ? (
        <Image src={logo} alt="" h={logoSize} w={logoSize} flexShrink={0} filter="drop-shadow(0 2px 6px rgba(0,0,0,0.35))" />
      ) : (
        <Box
          className="wm-pin"
          w="10px"
          h="10px"
          borderRadius="50% 50% 50% 0"
          bg={color.primary}
          transform="rotate(-45deg)"
          boxShadow="0 0 18px rgba(235,181,114,0.45)"
          transition="box-shadow .3s ease"
          flexShrink={0}
        />
      )}
      <Box>
        <Text fontFamily={font.display} fontSize={fontSize} lineHeight="1" color={color.text} whiteSpace="nowrap">
          Photo
          <Text as="span" color={color.primary} fontStyle="italic">
            Map
          </Text>
        </Text>
        {tagline && (
          <Text {...type.label} fontSize="9px" color={color.textMuted} mt={1.5} display={{ base: 'none', sm: 'block' }}>
            {tagline}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default memo(Wordmark);
