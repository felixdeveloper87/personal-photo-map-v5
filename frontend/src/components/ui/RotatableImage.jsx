import React, { useState } from 'react';
import { Image, IconButton, Box, Tooltip } from '@chakra-ui/react';
import { FiRotateCw } from 'react-icons/fi';

/**
 * Componente de imagem que permite rotação manual
 * Útil para corrigir fotos do iPhone que aparecem rotacionadas
 */
const RotatableImage = ({ 
  src, 
  fallbackSrc,
  onLoad,
  onError,
  showRotateButton = true,
  ...props 
}) => {
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const getTransform = () => {
    if (rotation === 0) return 'none';
    return `rotate(${rotation}deg)`;
  };

  return (
    <Box position="relative" display="inline-block">
      <Image
        src={src}
        fallbackSrc={fallbackSrc}
        onLoad={onLoad}
        onError={onError}
        sx={{
          transform: getTransform(),
          transformOrigin: 'center',
          transition: 'transform 0.3s ease',
          ...props.sx
        }}
        {...props}
      />
      
      {showRotateButton && (
        <Tooltip label="Rotacionar imagem" placement="top">
          <IconButton
            aria-label="Rotacionar imagem"
            icon={<FiRotateCw />}
            size="sm"
            position="absolute"
            top="2"
            right="2"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            _hover={{ bg: 'rgba(0, 0, 0, 0.9)' }}
            onClick={handleRotate}
            opacity={0}
            _groupHover={{ opacity: 1 }}
            transition="opacity 0.2s"
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default RotatableImage;
