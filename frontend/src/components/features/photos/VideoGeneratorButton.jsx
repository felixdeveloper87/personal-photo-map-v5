import { useState } from 'react';
import { Button, useDisclosure, Text, VStack, HStack, Icon, Badge } from '@chakra-ui/react';
import { FaVideo, FaPlay } from 'react-icons/fa';
import { HiFilm, HiPencil } from 'react-icons/hi2';
import TimelineVideoGeneratorRefactored from '../videos/components/TimelineVideoGeneratorRefactored';
import BaseModal from '../../modals/BaseModal';
import { ModalField } from '../../modals/ModalKit';

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
  const [videoTitle, setVideoTitle] = useState('');

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
        colorScheme="green"
        variant="solid"
        size={{ base: "sm", sm: "sm", md: "sm" }}
        borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
        px={{ base: 2, sm: 3, md: 4 }}
        py={{ base: 2, sm: 2, md: 2 }}
        fontWeight="semibold"
        boxShadow="md"
        _hover={{
          transform: 'translateY(-1px)',
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
          <Text display={{ base: "none", sm: "block" }}>Generate Video</Text>
          <Badge 
            colorScheme="green" 
            variant="subtle" 
            fontSize="xs"
            display={{ base: "none", sm: "inline-flex" }}
          >
            {images.length}
          </Badge>
        </HStack>
      </Button>

      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        eyebrow={getContextTitle()}
        title="Video generator"
        subtitle={getContextSubtitle()}
        icon={HiFilm}
        size={{ base: 'full', sm: '2xl', md: '4xl', xl: '6xl' }}
        maxHeight="90vh"
      >
        <VStack spacing={5} align="stretch">
          <ModalField
            label="Video title (optional)"
            icon={HiPencil}
            placeholder={getContextTitle()}
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            helper="This title will appear on the first frame of your video"
          />

          <TimelineVideoGeneratorRefactored
            images={images}
            contextInfo={{
              type: context,
              name: contextName,
              year: contextYear,
              album: contextAlbum,
            }}
            videoTitle={videoTitle || getContextTitle()}
          />
        </VStack>
      </BaseModal>
    </>
  );
};

export default VideoGeneratorButton;
