import React, { useState } from 'react';
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  Text,
  Box,
  VStack,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FaVideo, FaPlay, FaCog } from 'react-icons/fa';
import TimelineVideoGeneratorRefactored from '../videos/components/TimelineVideoGeneratorRefactored';

/**
 * VideoGeneratorButton - Botão para gerar vídeos de fotos filtradas
 * 
 * Funcionalidades:
 * - Gera vídeos de fotos por país, ano ou álbum
 * - Mostra preview das fotos que serão incluídas
 * - Abre modal com gerador de vídeo
 * - Suporte a diferentes contextos (país, ano, álbum)
 */
const VideoGeneratorButton = ({ 
  images = [], 
  context = 'country', 
  contextName = '', 
  contextYear = null,
  contextAlbum = null,
  isDisabled = false 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);

  // Color scheme
  const buttonBg = useColorModeValue('teal.500', 'teal.600');
  const buttonHoverBg = useColorModeValue('teal.600', 'teal.700');
  const buttonText = useColorModeValue('white', 'white');
  const modalBg = useColorModeValue('white', 'gray.800');

  // Determina o título baseado no contexto
  const getContextTitle = () => {
    if (contextAlbum) return `Album: ${contextAlbum}`;
    if (context === 'timeline' && contextYear) return `Timeline - ${contextYear}`;
    if (context === 'timeline') return 'Complete Timeline';
    if (contextYear) return `Year: ${contextYear}`;
    return `Country: ${contextName}`;
  };

  // Determina o subtítulo baseado no contexto
  const getContextSubtitle = () => {
    if (contextAlbum) return `${images.length} photos in album`;
    if (context === 'timeline' && contextYear) return `${images.length} photos from ${contextYear}`;
    if (context === 'timeline') return `${images.length} photos from your timeline`;
    if (contextYear) return `${images.length} photos from ${contextYear}`;
    return `${images.length} photos from ${contextName}`;
  };

  // Verifica se pode gerar vídeo
  const canGenerateVideo = images.length >= 2; // Mínimo 2 fotos para vídeo

  if (isDisabled || !canGenerateVideo) {
    return null;
  }

  return (
    <>
      <Button
        leftIcon={<Icon as={FaVideo} />}
        colorScheme="teal"
        variant="solid"
        size="md"
        borderRadius="xl"
        px={6}
        py={3}
        fontWeight="semibold"
        bg={buttonBg}
        color={buttonText}
        _hover={{
          bg: buttonHoverBg,
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onOpen}
        isDisabled={!canGenerateVideo}
      >
        <HStack spacing={2}>
          <Icon as={isHovered ? FaPlay : FaVideo} />
          <Text>Generate Video</Text>
          <Badge colorScheme="teal" variant="subtle" fontSize="xs">
            {images.length}
          </Badge>
        </HStack>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          bg={modalBg}
          borderRadius="xl"
          maxH="90vh"
          overflow="hidden"
        >
          <ModalHeader>
            <VStack align="start" spacing={1}>
              <HStack spacing={3}>
                <Icon as={FaVideo} color="teal.500" />
                <Text fontSize="xl" fontWeight="bold">
                  Video Generator
                </Text>
              </HStack>
              <Text fontSize="md" color="gray.600" fontWeight="normal">
                {getContextTitle()} • {getContextSubtitle()}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6} overflowY="auto">
            <TimelineVideoGeneratorRefactored 
              images={images}
              contextInfo={{
                type: context,
                name: contextName,
                year: contextYear,
                album: contextAlbum,
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VideoGeneratorButton;
