import {
  Box,
  Text,
  IconButton,
  HStack,
  VStack,
  Tooltip,
  useDisclosure,
  useToast,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useImageCache } from '../../hooks/useImageCache';
import { color, tones } from '../../design/tokens';
import { ToneBadge } from '../modals/ModalKit';
import { ConfirmDialog } from './ConfirmDialog';

const CacheStatus = () => {
  const {
    cacheSize,
    cacheCount,
    formatCacheSize,
    clearCache,
    maxCacheSize,
  } = useImageCache();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = 'rgba(236,231,220,0.025)';
  const textColor = color.textSoft;
  const borderColor = color.hairline;
  
  // Percentual usado
  const percentage = Math.min((cacheSize / maxCacheSize) * 100, 100);
  
  const handleClearCache = async () => {
    await clearCache();
    onClose();
    toast({
      title: 'Cache cleared',
      description: 'All cached images have been removed',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  const isCacheEmpty = cacheCount === 0;
  
  return (
    <>
      <Tooltip label="Photo cache status">
        <Box
          p={3}
          borderRadius="lg"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack spacing={3} justify="space-between">
            <VStack spacing={0} align="start">
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  Photo Cache
                </Text>
                {!isCacheEmpty && (
                  <ToneBadge tone={percentage > 80 ? 'danger' : percentage > 50 ? 'warning' : 'success'}>
                    {cacheCount} images
                  </ToneBadge>
                )}
              </HStack>
              <Text fontSize="xs" color={textColor} opacity={0.7}>
                {isCacheEmpty ? (
                  'No cached images yet'
                ) : (
                  `${formatCacheSize(cacheSize)} / ${formatCacheSize(maxCacheSize)}`
                )}
              </Text>
            </VStack>
            
            <HStack spacing={2}>
              {!isCacheEmpty && (
                <CircularProgress value={percentage} size="40px" color={color.primary} trackColor={color.hairline}>
                  <CircularProgressLabel fontSize="xs">
                    {Math.round(percentage)}%
                  </CircularProgressLabel>
                </CircularProgress>
              )}
              
              {!isCacheEmpty && (
                <IconButton
                  aria-label="Clear cache"
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  color={tones.danger.fg}
                  _hover={{ bg: tones.danger.soft }}
                  onClick={onOpen}
                />
              )}
            </HStack>
          </HStack>
        </Box>
      </Tooltip>
      
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleClearCache}
        title="Clear photo cache?"
        confirmLabel="Clear cache"
        message={`This will remove all ${cacheCount} cached images (${formatCacheSize(cacheSize)}). Images will need to be downloaded again when viewed.`}
      />
    </>
  );
};

export default CacheStatus;

