import React, { useState, useEffect } from 'react';
import { Image, IconButton, Box, Tooltip } from '@chakra-ui/react';
import { FiRotateCw } from 'react-icons/fi';

/**
 * Componente de imagem que detecta e permite rotação manual
 * Detecta automaticamente se a imagem precisa de rotação baseada nas dimensões
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
  const [needsRotation, setNeedsRotation] = useState(false);

  // Detectar se a imagem precisa de rotação baseada nas dimensões
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      
      // Se a largura é muito maior que a altura, provavelmente é uma foto de retrato rotacionada
      const aspectRatio = naturalWidth / naturalHeight;
      
      // Desabilitar rotação automática - deixar apenas controle manual
      // O problema de rotação está no backend que não preserva orientação EXIF
      setNeedsRotation(false);
      setRotation(0);
    };
    
    img.onerror = () => {
      setNeedsRotation(false);
      setRotation(0);
    };
    
    img.src = src;
  }, [src]);

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
        <Tooltip 
          label="Rotacionar imagem manualmente" 
          placement="top"
        >
          <IconButton
            aria-label="Rotacionar imagem"
            icon={<FiRotateCw />}
            size="sm"
            position="absolute"
            top="2"
            right="2"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.9)" }}
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
