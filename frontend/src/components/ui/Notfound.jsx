import { Box, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import ModalButton from '../modals/ModalButton';
import { brandGradient, color, font, type } from '../../design/tokens';

/**
 * 404 — "off the map".
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box minH="70vh" display="flex" alignItems="center" justifyContent="center" px={6} py={16} bg={color.bg}>
      <VStack spacing={5} textAlign="center" maxW="440px">
        <Text {...type.eyebrow} color={color.primary}>
          Error 404 · Off the map
        </Text>
        <Text
          fontFamily={font.display}
          fontSize={{ base: '6rem', md: '8rem' }}
          lineHeight="0.9"
          bgGradient={brandGradient}
          bgClip="text"
        >
          404
        </Text>
        <Text {...type.display} color={color.text}>
          Page not found
        </Text>
        <Text fontSize="sm" color={color.textSoft} lineHeight="1.7">
          Sorry, the page you are trying to access does not exist.
        </Text>
        <ModalButton variant="primary" leftIcon={<HiArrowLeft />} onClick={() => navigate('/')}>
          Back to home
        </ModalButton>
      </VStack>
    </Box>
  );
};

export default NotFound;
