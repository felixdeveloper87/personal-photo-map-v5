import React, { useState, useEffect, useRef } from 'react';
import { Image, Box } from '@chakra-ui/react';

/**
 * Componente de imagem que detecta e corrige automaticamente a orientação
 * Especialmente útil para fotos do iPhone que aparecem rotacionadas
 */
const AutoOrientedImage = ({ 
  src, 
  fallbackSrc,
  onLoad,
  onError,
  ...props 
}) => {
  const [orientation, setOrientation] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    
    // Criar uma nova imagem para detectar orientação
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Detectar orientação baseada nas dimensões
      const { naturalWidth, naturalHeight } = img;
      
      // Se a largura é maior que a altura, pode ser uma imagem rotacionada
      // (fotos do iPhone em modo retrato têm largura > altura quando rotacionadas)
      if (naturalWidth > naturalHeight) {
        // Verificar se parece ser uma foto de retrato rotacionada
        // Fotos de retrato normalmente têm altura > largura
        const aspectRatio = naturalWidth / naturalHeight;
        
        // Se a proporção está invertida (largura muito maior que altura),
        // provavelmente precisa de rotação de 90° ou 270°
        if (aspectRatio > 1.3) {
          // Tentar rotação de 90° primeiro (mais comum no iPhone)
          setOrientation(6);
        } else if (aspectRatio < 0.7) {
          // Tentar rotação de 270°
          setOrientation(8);
        } else {
          setOrientation(1);
        }
      } else {
        setOrientation(1);
      }
      
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = (error) => {
      setIsLoading(false);
      onError?.(error);
    };
    
    img.src = src;
  }, [src, onLoad, onError]);

  const getTransform = () => {
    switch (orientation) {
      case 6:
        return 'rotate(90deg)';
      case 8:
        return 'rotate(-90deg)';
      case 3:
        return 'rotate(180deg)';
      default:
        return 'none';
    }
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        minHeight="200px"
        {...props}
      >
        <Image
          src={src}
          fallbackSrc={fallbackSrc}
          opacity={0.5}
          {...props}
        />
      </Box>
    );
  }

  return (
    <Image
      ref={imgRef}
      src={src}
      fallbackSrc={fallbackSrc}
      onLoad={onLoad}
      onError={onError}
      sx={{
        transform: getTransform(),
        transformOrigin: 'center',
        ...props.sx
      }}
      {...props}
    />
  );
};

export default AutoOrientedImage;
