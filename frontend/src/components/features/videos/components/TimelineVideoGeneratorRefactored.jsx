/**
 * Componente principal do gerador de vídeo timeline (Refatorado) — Atlas UI
 */

import { useState, useContext } from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { HiArrowDownTray, HiFilm, HiStop } from 'react-icons/hi2';
import { AuthContext } from '../../../../context/AuthContext';
import { useVideoGenerator } from '../hooks/useVideoGenerator';
import VideoSettings from './VideoSettings';
import ModalButton from '../../../modals/ModalButton';
import { ModalActions, ModalNotice, Panel, ToneBadge, ToneProgress } from '../../../modals/ModalKit';
import { color, radius, type } from '../../../../design/tokens';

const TimelineVideoGenerator = ({ images, onClose, contextInfo, videoTitle }) => {
  const { isLoggedIn } = useContext(AuthContext);

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
    if (videoTitle && videoTitle.trim()) {
      return videoTitle.trim();
    }
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

  const handleGenerateVideo = () => {
    generateVideo(images, settings, audioFile, getVideoTitle());
  };

  const handleAudioFileChange = (file) => {
    setAudioFile(file);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (file) {
      setAudioUrl(URL.createObjectURL(file));
    } else {
      setAudioUrl(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <ModalNotice tone="warning" title="Sign in required">
        You need to be logged in to generate timeline videos.
      </ModalNotice>
    );
  }

  const missingAudio = settings.musicEnabled && settings.musicSource === 'upload' && !audioFile;
  const isBusy = isGenerating || isConverting;

  return (
    <Panel p={0} display="flex" flexDirection="column" h="100%" overflow="hidden">
      {/* Scrollable content */}
      <Box flex="1" overflowY="auto" p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 5, md: 6 }} align="stretch">
          <VStack spacing={1.5} align="start">
            <Text {...type.eyebrow} color={color.primary}>
              Your video
            </Text>
            <Text {...type.display} color={color.text}>
              {getVideoTitle()}
            </Text>
            <Text fontSize="sm" color={color.textSoft}>
              {getVideoDescription()}
            </Text>
          </VStack>

          <VideoSettings
            settings={settings}
            onSettingsChange={setSettings}
            audioFile={audioFile}
            onAudioFileChange={handleAudioFileChange}
            audioUrl={audioUrl}
          />

          {/* Hidden canvas used for rendering */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {isGenerating && (
            <Panel tone="brand">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="600" color={color.text} fontSize="sm">
                  {progress === 100 ? 'Finalizing video…' : 'Generating video…'}
                </Text>
                <Text {...type.data} fontSize="sm" color={color.primary}>
                  {progress}%
                </Text>
              </HStack>
              <ToneProgress value={progress} tone={progress === 100 ? 'success' : 'brand'} h="8px" />
              {progress < 100 && (
                <Text fontSize="xs" color={color.textMuted} mt={2.5}>
                  Processing timeline video frames…
                </Text>
              )}
            </Panel>
          )}

          {isConverting && (
            <Panel tone="teal">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="600" color={color.text} fontSize="sm">
                  {conversionProgress === 100 ? 'Finalizing MP4 conversion…' : 'Converting to MP4…'}
                </Text>
                <Text {...type.data} fontSize="sm" color={color.accent}>
                  {conversionProgress}%
                </Text>
              </HStack>
              <ToneProgress value={conversionProgress} tone="teal" h="8px" />
              <Text fontSize="xs" color={color.textMuted} mt={2.5}>
                Converting for iPhone compatibility…
              </Text>
            </Panel>
          )}

          {videoUrl && (
            <VStack spacing={3}>
              <HStack spacing={2}>
                <ToneBadge tone="success">Video ready</ToneBadge>
                {mp4VideoUrl && <ToneBadge tone="teal">MP4 · Mobile ready</ToneBadge>}
              </HStack>
              <Box
                as="video"
                ref={videoRef}
                src={mp4VideoUrl || videoUrl}
                controls
                w="100%"
                maxW="420px"
                borderRadius={radius.md}
                border="1px solid"
                borderColor={color.hairlineMid}
                bg="black"
              />
              <Text fontSize="xs" color={color.textMuted} textAlign="center">
                {mp4VideoUrl ? 'Tap "Share video" to save or share it.' : 'Format: WebM (browser compatible)'}
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Sticky actions */}
      <Box borderTop="1px solid" borderColor={color.hairline} bg="rgba(8,10,15,0.35)" p={{ base: 4, md: 5 }}>
        {missingAudio && (
          <ModalNotice tone="warning" mb={4}>
            Select an audio file or switch to &quot;Preset music&quot; to generate the video.
          </ModalNotice>
        )}

        <ModalActions align="center">
          {onClose && (
            <ModalButton variant="secondary" size="lg" onClick={onClose}>
              Close
            </ModalButton>
          )}

          {!isBusy && !videoUrl && (
            <ModalButton
              variant="primary"
              size="lg"
              leftIcon={<HiFilm />}
              onClick={handleGenerateVideo}
              isDisabled={!images || images.length === 0 || missingAudio}
            >
              Generate video ({images?.length || 0} photos)
            </ModalButton>
          )}

          {isBusy && (
            <ModalButton variant="danger" size="lg" leftIcon={<HiStop />} onClick={stopGeneration} isDisabled={isConverting}>
              {isConverting ? 'Converting…' : 'Stop generation'}
            </ModalButton>
          )}

          {videoUrl && !isConverting && (
            <ModalButton variant="primary" size="lg" leftIcon={<HiArrowDownTray />} onClick={downloadVideo}>
              Share video
            </ModalButton>
          )}
        </ModalActions>
      </Box>
    </Panel>
  );
};

export default TimelineVideoGenerator;
