import React from 'react';
import {
  Box,
  Text,
  IconButton,
  HStack,
  VStack,
  Badge,
  Tooltip,
  useDisclosure,
  useToast,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useImageCache } from '../../hooks/useImageCache';
import { useColorModeValue } from '@chakra-ui/react';
import { ConfirmDialog } from './ConfirmDialog';

const CacheStatus = () => {
  const {
    cacheSize,
    cacheCount,
    formatCacheSize,
    clearCache,
    maxCacheSize,
    maxCacheItems,
  } = useImageCache();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
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
                  <Badge colorScheme={percentage > 80 ? 'red' : percentage > 50 ? 'yellow' : 'green'}>
                    {cacheCount} images
                  </Badge>
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
                <CircularProgress value={percentage} size="40px" color="blue.500">
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
                  colorScheme="red"
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

