/**
 * Componente principal do gerador de vídeo timeline (Refatorado)
 */

import React, { useState, useContext } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Text,
  Button,
  Progress,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FaVideo, FaDownload, FaStop } from 'react-icons/fa';
import { AuthContext } from '../../../../context/AuthContext';
import { useVideoGenerator } from '../hooks/useVideoGenerator';
import VideoSettings from './VideoSettings';

const TimelineVideoGenerator = ({ images, onClose, contextInfo, videoTitle }) => {
  const { isLoggedIn } = useContext(AuthContext);
  
  // Log básico apenas uma vez
  React.useEffect(() => {
    if (images?.length > 0) {
      console.log('🎬 VideoGenerator iniciado:', `${images.length} imagens carregadas`, contextInfo);
    }
  }, [images?.length, contextInfo]);
  const {
    canvasRef,
    videoRef,
    isGenerating,
    progress,
    videoUrl,
    isConverting,
    conversionProgress,
    mp4VideoUrl,
    generateVideo,
    downloadVideo,
    stopGeneration,
  } = useVideoGenerator();

  // Cores do tema - Estilo OpenAI
  const bgColor = useColorModeValue('#f8f9fa', '#262626');
  const textColor = useColorModeValue('#1a1a1a', '#f0f0f0');
  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const mutedTextColor = useColorModeValue('#666666', '#a0a0a0');
  const buttonBg = useColorModeValue('#000000', '#ffffff');
  const buttonText = useColorModeValue('#ffffff', '#000000');

  // State para configurações
  const [settings, setSettings] = useState({
    duration: 1.5, // segundos por foto
    transition: 'dynamic', // dynamic, fade, slide, zoom, kenBurns, wipe, spiral, bounce, flip3d
    resolution: '1080p',
    fps: 30,
    showYearText: true,
    showPhotoCount: true,
    showCountryName: true, // Exibir nome do país
    musicEnabled: false,
    musicSource: 'none', // 'none', 'upload', 'preset'
    musicVolume: 0.5,
    musicStartTime: 0, // Tempo de início da música em segundos
    selectedPresetMusic: 'ambient1',
    transitionDuration: 0.8, // Duração da transição em segundos
    enableParticles: false, // Efeitos de partículas
    dynamicMode: 'smart', // 'smart', 'random', 'sequential'
    imageFitMode: 'fill', // 'fill', 'fit', 'stretch'
    smartCrop: 'center', // Para fill mode
  });

  // Audio settings
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Funções para personalizar vídeo baseado no contexto
  const getVideoTitle = () => {
    // Se um título personalizado foi fornecido, usar ele
    if (videoTitle && videoTitle.trim()) {
      return videoTitle.trim();
    }
    
    // Caso contrário, usar o título baseado no contexto
    if (contextInfo?.album) return `Album: ${contextInfo.album}`;
    if (contextInfo?.type === 'timeline' && contextInfo?.year) return `Timeline - ${contextInfo.year}`;
    if (contextInfo?.type === 'timeline') return 'Complete Timeline';
    if (contextInfo?.year) return `${contextInfo.name} - ${contextInfo.year}`;
    if (contextInfo?.name) return `${contextInfo.name} - My Photos`;
    return 'Timeline';
  };

  const getVideoDescription = () => {
    if (contextInfo?.album) return `Video from album ${contextInfo.album} with ${images?.length || 0} photos`;
    if (contextInfo?.type === 'timeline' && contextInfo?.year) return `Video from ${contextInfo.year} with ${images?.length || 0} photos from timeline`;
    if (contextInfo?.type === 'timeline') return `Complete timeline video with ${images?.length || 0} photos`;
    if (contextInfo?.year) return `Video from ${contextInfo.year} with ${images?.length || 0} photos from ${contextInfo.name}`;
    if (contextInfo?.name) return `Video from ${contextInfo.name} with ${images?.length || 0} photos`;
    return `Timeline video with ${images?.length || 0} photos`;
  };

  // Handlers
  const handleGenerateVideo = () => {
    generateVideo(images, settings, audioFile, getVideoTitle());
  };

  const handleAudioFileChange = (file) => {
    setAudioFile(file);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    } else {
      setAudioUrl(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          You need to be logged in to generate timeline videos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box 
      display="flex"
      flexDirection="column"
      h="100%"
      bg={bgColor} 
      borderRadius="xl" 
      border={`1px solid ${borderColor}`}
      boxShadow={useColorModeValue(
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
      )}
    >
      {/* Conteúdo principal com scroll */}
      <Box 
        flex="1"
        overflowY="auto"
        p={{ base: 6, md: 8 }}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <VStack spacing={2} align="start">
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            {getVideoTitle()}
          </Text>
          <Text fontSize="sm" color={mutedTextColor}>
            {getVideoDescription()}
          </Text>
        </VStack>

        {/* Settings */}
        <VideoSettings
          settings={settings}
          onSettingsChange={setSettings}
          audioFile={audioFile}
          onAudioFileChange={handleAudioFileChange}
          audioUrl={audioUrl}
        />

        {/* Canvas escondido para renderização */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Progress */}
        {(isGenerating || isConverting) && (
          <VStack spacing={4}>
            {isGenerating && (
              <VStack spacing={3}>
                <Text fontWeight="semibold" color={textColor}>
                  {progress === 100 ? 'Finalizing video...' : `Generating video... ${progress}%`}
                </Text>
                <Progress 
                  value={progress} 
                  colorScheme={progress === 100 ? "green" : "blue"} 
                  size="lg" 
                  borderRadius="md"
                  isAnimated={progress < 100}
                  hasStripe={progress < 100}
                />
                {progress < 100 && (
                  <Text fontSize="sm" color={mutedTextColor}>
                    Processing timeline video frames...
                  </Text>
                )}
              </VStack>
            )}

            {isConverting && (
              <VStack spacing={3}>
                <Text fontWeight="semibold" color={textColor}>
                  {conversionProgress === 100 ? 'Finalizing MP4 conversion...' : `Converting to MP4... ${conversionProgress}%`}
                </Text>
                <Progress 
                  value={conversionProgress} 
                  colorScheme="purple" 
                  size="lg" 
                  borderRadius="md"
                  isAnimated={conversionProgress < 100}
                  hasStripe={conversionProgress < 100}
                />
                <Text fontSize="sm" color={mutedTextColor}>
                  📱 Converting for iPhone compatibility...
                </Text>
              </VStack>
            )}
          </VStack>
        )}

        {/* Generated video */}
        {videoUrl && (
          <VStack spacing={3}>
            <HStack spacing={2}>
              <Text color="green.500" fontWeight="bold">Video generated successfully!</Text>
              {mp4VideoUrl && (
                <Text fontSize="sm" color="purple.500" fontWeight="semibold">
                  📱 MP4 Ready
                </Text>
              )}
            </HStack>
            <video
              ref={videoRef}
              src={mp4VideoUrl || videoUrl}
              controls
              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
            />
            <Text fontSize="sm" color={mutedTextColor}>
              Format: {mp4VideoUrl ? 'MP4 (iPhone compatible)' : 'WebM (Browser compatible)'}
            </Text>
          </VStack>
        )}

        </VStack>
      </Box>

      {/* Botões fixos no bottom */}
      <Box
        borderTop={`1px solid ${borderColor}`}
        bg={bgColor}
        p={{ base: 4, md: 6 }}
        borderBottomRadius="xl"
      >
        {/* Aviso se música está habilitada mas arquivo não foi carregado */}
        {settings.musicEnabled && settings.musicSource === 'upload' && !audioFile && (
          <Text fontSize="sm" color="orange.500" textAlign="center" mb={4}>
            ⚠️ Select an audio file or switch to "Preset music" to generate the video
          </Text>
        )}

        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 3, sm: 4 }} 
          justify="center"
          align="center"
        >
          {!isGenerating && !isConverting && !videoUrl && (
            <Button
              leftIcon={<FaVideo />}
              bg={buttonBg}
              color={buttonText}
              size={{ base: "lg", md: "lg" }}
              onClick={handleGenerateVideo}
              isDisabled={
                !images || 
                images.length === 0 || 
                (settings.musicEnabled && settings.musicSource === 'upload' && !audioFile)
              }
              w={{ base: "100%", sm: "auto" }}
              minW="250px"
              borderRadius="xl"
              fontSize="md"
              fontWeight="semibold"
              py={6}
              _hover={{ 
                transform: "translateY(-1px)",
                boxShadow: useColorModeValue(
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  "0 10px 15px -3px rgba(0, 0, 0, 0.4)"
                )
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
              border={`1px solid ${useColorModeValue("transparent", "#404040")}`}
            >
              Generate Video ({images?.length || 0} photos)
            </Button>
          )}

          {(isGenerating || isConverting) && (
            <Button
              leftIcon={<FaStop />}
              bg="red.500"
              color="white"
              size={{ base: "lg", md: "lg" }}
              onClick={stopGeneration}
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
              borderRadius="xl"
              fontSize="md"
              fontWeight="semibold"
              py={6}
              isDisabled={isConverting}
              _hover={{
                bg: "red.600",
                transform: "translateY(-1px)",
                boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.4)"
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
            >
              {isConverting ? 'Converting...' : 'Stop Generation'}
            </Button>
          )}

          {videoUrl && !isConverting && (
            <Button
              leftIcon={<FaDownload />}
              bg="green.500"
              color="white"
              size={{ base: "lg", md: "lg" }}
              onClick={downloadVideo}
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
              borderRadius="xl"
              fontSize="md"
              fontWeight="semibold"
              py={6}
              _hover={{ 
                bg: "green.600",
                transform: "translateY(-1px)",
                boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.4)"
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
            >
              Download {mp4VideoUrl ? 'MP4' : 'WebM'}
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={onClose}
            borderColor={borderColor}
            color={textColor}
            _hover={{ 
              bg: useColorModeValue("gray.50", "gray.700"),
              borderColor: useColorModeValue("gray.300", "gray.500")
            }}
            size={{ base: "lg", md: "lg" }}
            w={{ base: "100%", sm: "auto" }}
            minW="120px"
            borderRadius="xl"
            py={6}
            transition="all 0.2s"
          >
            Close
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default TimelineVideoGenerator;
