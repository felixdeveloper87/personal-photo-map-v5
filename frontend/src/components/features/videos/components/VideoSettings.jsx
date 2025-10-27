/**
 * Componente de configurações para o gerador de vídeo
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { presetMusics } from '../../../../services/video/audioProcessor';

const VideoSettings = ({ 
  settings, 
  onSettingsChange, 
  audioFile, 
  onAudioFileChange,
  audioUrl 
}) => {
  const inputBg = useColorModeValue('white', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleAudioFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onAudioFileChange(file);
    }
  };

  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
      {/* Duração por foto */}
      <FormControl>
        <FormLabel color={textColor}>Duration per photo (seconds)</FormLabel>
        <NumberInput
          value={settings.duration}
          onChange={(valueString) => handleSettingChange('duration', parseFloat(valueString))}
          min={0.5}
          max={10}
          step={0.1}
          bg={inputBg}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      {/* Tipo de transição */}
      <FormControl>
        <FormLabel color={textColor}>Transition type</FormLabel>
        <Select
          value={settings.transition}
          onChange={(e) => handleSettingChange('transition', e.target.value)}
          bg={inputBg}
        >
          <option value="stories">📱 Stories Style (Clean & Simple)</option>
          <option value="dynamic">🎭 Dynamic (Smart)</option>
          <option value="fade">🌅 Fade (Professional)</option>
          <option value="slide">➡️ Slide (Cinematic)</option>
          <option value="zoom">🔍 Zoom (Smooth)</option>
          <option value="kenBurns">🎬 Ken Burns (Classic)</option>
          <option value="dissolve">✨ Dissolve (Elegant)</option>
          <option value="push">📱 Push (Modern)</option>
          <option value="reveal">🎭 Reveal (Dramatic)</option>
          <option value="scale">📏 Scale (Dynamic)</option>
          <option value="rotate">🔄 Rotate (Artistic)</option>
          <option value="wipe">🧹 Wipe (Clean)</option>
          <option value="spiral">🌀 Spiral (Creative)</option>
          <option value="bounce">⚡ Bounce (Playful)</option>
          <option value="flip3d">🎪 Flip 3D (3D Effect)</option>
        </Select>
      </FormControl>

      {/* Modo dinâmico (apenas se dynamic estiver selecionado) */}
      {settings.transition === 'dynamic' && (
        <FormControl>
          <FormLabel color={textColor}>Dynamic mode</FormLabel>
          <Select
            value={settings.dynamicMode}
            onChange={(e) => handleSettingChange('dynamicMode', e.target.value)}
            bg={inputBg}
          >
            <option value="smart">🧠 Smart (Context-based)</option>
            <option value="random">🎲 Random</option>
            <option value="sequential">📋 Sequential</option>
          </Select>
        </FormControl>
      )}

      {/* Descrição do estilo Stories */}
      {settings.transition === 'stories' && (
        <Box p={3} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md">
          <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={1}>
            📱 Stories Style
          </Text>
          <Text fontSize="xs" color="blue.700">
            Clean, simple transitions perfect for Instagram Stories. 
            Images display without complex effects for maximum impact.
          </Text>
        </Box>
      )}

      {/* Duração da transição */}
      <FormControl>
        <FormLabel color={textColor}>
          Transition duration: {settings.transitionDuration}s
        </FormLabel>
        <Slider
          value={settings.transitionDuration}
          onChange={(value) => handleSettingChange('transitionDuration', value)}
          min={0.1}
          max={2}
          step={0.1}
          colorScheme="blue"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>

      {/* Resolução */}
      <FormControl>
        <FormLabel color={textColor}>Resolution</FormLabel>
        <Select
          value={settings.resolution}
          onChange={(e) => handleSettingChange('resolution', e.target.value)}
          bg={inputBg}
        >
          <option value="720p">🖥️ 720p (1280x720)</option>
          <option value="1080p">📺 1080p (1920x1080)</option>
          <option value="1440p">🖨️ 1440p (2560x1440)</option>
          <option value="stories-hd">📱 Stories HD (1080x1920) - Vertical</option>
          <option value="stories-4k">📱 Stories 4K (1440x2560) - Vertical</option>
          <option value="reel-standard">📱 Instagram Feed (1080x1350) - Square</option>
        </Select>
        <Text fontSize="xs" color={mutedTextColor} mt={1}>
          {settings.resolution.includes('stories') && 
            '💡 Stories format: Smart crop will preserve image meaning for landscape photos'
          }
        </Text>
      </FormControl>

      {/* Modo de ajuste de imagem */}
      <FormControl>
        <FormLabel color={textColor}>Image Fit Mode</FormLabel>
        <Select
          value={settings.imageFitMode || 'fill'}
          onChange={(e) => handleSettingChange('imageFitMode', e.target.value)}
          bg={inputBg}
        >
          <option value="fill">🖼️ Fill (Crop to fit, no black bars)</option>
          <option value="fit">📏 Fit (Show entire image, may add black bars)</option>
          <option value="stretch">🔄 Stretch (Distort to fit exactly)</option>
        </Select>
        <Text fontSize="xs" color={mutedTextColor} mt={1}>
          How to handle images with different aspect ratios than the video
        </Text>
      </FormControl>

      {/* Smart Crop para Fill mode */}
      {settings.imageFitMode === 'fill' && (
        <FormControl>
          <FormLabel color={textColor}>Smart Crop Position</FormLabel>
          <Select
            value={settings.smartCrop || 'center'}
            onChange={(e) => handleSettingChange('smartCrop', e.target.value)}
            bg={inputBg}
          >
            <option value="center">🎯 Center Crop (Default)</option>
            <option value="face-detection">👤 Face Detection (Best for portraits)</option>
            <option value="object-detection">🔍 Object Detection (Best for landscapes)</option>
            <option value="rule-of-thirds">📐 Rule of Thirds (Artistic composition)</option>
            <option value="top">⬆️ Top Focus</option>
            <option value="bottom">⬇️ Bottom Focus</option>
            <option value="left">⬅️ Left Focus</option>
            <option value="right">➡️ Right Focus</option>
          </Select>
          <Text fontSize="xs" color={mutedTextColor} mt={1}>
            Choose which part of the image to focus on when cropping
          </Text>
        </FormControl>
      )}

      {/* FPS */}
      <FormControl>
        <FormLabel color={textColor}>Frames per second (FPS)</FormLabel>
        <Select
          value={settings.fps}
          onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}
          bg={inputBg}
        >
          <option value={24}>🎬 24 FPS (Cinema)</option>
          <option value={30}>📹 30 FPS (Standard)</option>
          <option value={60}>⚡ 60 FPS (Smooth)</option>
        </Select>
      </FormControl>

      {/* Switches de texto */}
      <HStack justify="space-between">
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-year" mb="0" color={textColor}>
            Show year text
          </FormLabel>
          <Switch
            id="show-year"
            isChecked={settings.showYearText}
            onChange={(e) => handleSettingChange('showYearText', e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-country" mb="0" color={textColor}>
            Show country name
          </FormLabel>
          <Switch
            id="show-country"
            isChecked={settings.showCountryName}
            onChange={(e) => handleSettingChange('showCountryName', e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-count" mb="0" color={textColor}>
            Show photo count
          </FormLabel>
          <Switch
            id="show-count"
            isChecked={settings.showPhotoCount}
            onChange={(e) => handleSettingChange('showPhotoCount', e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>
      </HStack>

      {/* Efeitos adicionais */}
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="enable-particles" mb="0" color={textColor}>
          Enable particle effects
        </FormLabel>
        <Switch
          id="enable-particles"
          isChecked={settings.enableParticles}
          onChange={(e) => handleSettingChange('enableParticles', e.target.checked)}
          colorScheme="purple"
        />
      </FormControl>

      {/* Configurações de música */}
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="enable-music" mb="0" color={textColor}>
          Enable background music
        </FormLabel>
        <Switch
          id="enable-music"
          isChecked={settings.musicEnabled}
          onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
          colorScheme="green"
        />
      </FormControl>

      {settings.musicEnabled && (
        <VStack spacing={3} align="stretch">
          {/* Fonte de música */}
          <FormControl>
            <FormLabel color={textColor}>Music source</FormLabel>
            <Select
              value={settings.musicSource}
              onChange={(e) => handleSettingChange('musicSource', e.target.value)}
              bg={inputBg}
            >
              <option value="none">🚫 No music</option>
              <option value="upload">📁 Upload file</option>
              <option value="preset">🎵 Preset music</option>
            </Select>
          </FormControl>

          {/* Upload de arquivo */}
          {settings.musicSource === 'upload' && (
            <FormControl>
              <FormLabel color={textColor}>Audio file (MP3, WAV, AAC, etc.)</FormLabel>
              <VStack spacing={3} align="stretch">
                
                {/* Alerta importante sobre Apple Music */}
                <Box 
                  p={4} 
                  bg="orange.50" 
                  border="2px solid" 
                  borderColor="orange.300" 
                  borderRadius="md"
                  _dark={{ bg: "orange.900", borderColor: "orange.700" }}
                >
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={2}>
                      <Text fontSize="lg">⚠️</Text>
                      <Text fontSize="sm" color="orange.800" fontWeight="bold" _dark={{ color: "orange.200" }}>
                        iOS Safari Limitation
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="orange.700" _dark={{ color: "orange.300" }}>
                      <strong>Importante:</strong> iOS Safari não pode acessar músicas da biblioteca do Apple Music diretamente por questões de segurança.
                    </Text>
                    <Text fontSize="xs" color="orange.700" fontWeight="medium" _dark={{ color: "orange.300" }} mt={1}>
                      📝 <strong>Solução:</strong> Se a música está no Apple Music:
                    </Text>
                    <Box as="ul" fontSize="xs" color="orange.700" _dark={{ color: "orange.300" }} ml={4} mt={1}>
                      <li>1. Abra a música no app "Music"</li>
                      <li>2. Exporte ou encontre o arquivo MP3</li>
                      <li>3. Salve no app "Files"</li>
                      <li>4. Depois volte aqui e selecione do "Files"</li>
                    </Box>
                  </VStack>
                </Box>

                <Box position="relative">
                  <Input
                    id="audio-upload"
                    type="file"
                    accept="audio/mpeg,audio/mp4,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/*"
                    onChange={handleAudioFileSelect}
                    bg={inputBg}
                    border="2px dashed"
                    borderColor="blue.300"
                    _hover={{ borderColor: "blue.500" }}
                    pt={1}
                    cursor="pointer"
                  />
                  {!audioFile && (
                    <Text 
                      position="absolute" 
                      left="50%" 
                      top="50%" 
                      transform="translate(-50%, -50%)" 
                      fontSize="sm" 
                      color="blue.600"
                      pointerEvents="none"
                      textAlign="center"
                      width="100%"
                      px={2}
                      fontWeight="medium"
                    >
                      📁 Tap aqui para selecionar música
                    </Text>
                  )}
                </Box>
                
                {/* Instruções detalhadas para iOS */}
                <Box 
                  p={4} 
                  bg="blue.50" 
                  border="1px solid" 
                  borderColor="blue.200" 
                  borderRadius="md"
                  _dark={{ bg: "blue.900", borderColor: "blue.700" }}
                >
                  <Text fontSize="sm" color="blue.800" fontWeight="bold" mb={3} _dark={{ color: "blue.200" }}>
                    📱 Passo a Passo para iPhone/iPad:
                  </Text>
                  <VStack spacing={2} align="stretch" fontSize="sm" color="blue.700" _dark={{ color: "blue.200" }}>
                    <HStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="lg">1️⃣</Text>
                      <Text><strong>Tap</strong> no campo de seleção acima (azul tracejado)</Text>
                    </HStack>
                    <HStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="lg">2️⃣</Text>
                      <Text>Na tela que abrir, procure por <strong>"Editar"</strong> no canto superior direito</Text>
                    </HStack>
                    <HStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="lg">3️⃣</Text>
                      <Text>Tap em <strong>"Adicionar Arquivos..."</strong> (Add Files)</Text>
                    </HStack>
                    <HStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="lg">4️⃣</Text>
                      <Text>Escolha onde está sua música:</Text>
                    </HStack>
                    <Box as="ul" ml={6} mt={-2}>
                      <li>📱 <strong>Files</strong> - Se salvou antes</li>
                      <li>☁️ <strong>iCloud Drive</strong> - Se tem na nuvem</li>
                      <li>📦 <strong>Dropbox</strong> - Se estiver lá</li>
                      <li>🌐 <strong>Google Drive</strong> - Também funciona</li>
                      <li>💾 <strong>Downloads</strong> - Se baixou recentemente</li>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
              
              {audioFile && (
                <Box 
                  p={3} 
                  bg="green.50" 
                  border="1px solid" 
                  borderColor="green.200" 
                  borderRadius="md"
                  mt={2}
                >
                  <HStack>
                    <Text fontSize="lg">✅</Text>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="green.800" fontWeight="bold">
                        Música selecionada com sucesso!
                      </Text>
                      <Text fontSize="xs" color="green.700">
                        {audioFile.name}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}
              {audioUrl && !audioFile && (
                <Text fontSize="sm" color="blue.500" mt={2}>
                  🎵 Audio loaded from previous session
                </Text>
              )}
            </FormControl>
          )}

          {/* Música preset */}
          {settings.musicSource === 'preset' && (
            <FormControl>
              <FormLabel color={textColor}>Preset music</FormLabel>
              <Select
                value={settings.selectedPresetMusic}
                onChange={(e) => handleSettingChange('selectedPresetMusic', e.target.value)}
                bg={inputBg}
              >
                {Object.entries(presetMusics).map(([key, music]) => (
                  <option key={key} value={key}>
                    🎵 {music.name} - {music.description}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Volume da música */}
          <FormControl>
            <FormLabel color={textColor}>
              Music volume: {Math.round(settings.musicVolume * 100)}%
            </FormLabel>
            <Slider
              value={settings.musicVolume}
              onChange={(value) => handleSettingChange('musicVolume', value)}
              min={0}
              max={1}
              step={0.1}
              colorScheme="green"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>

          {/* Tempo de início da música */}
          <FormControl>
            <FormLabel color={textColor}>Music start time (seconds)</FormLabel>
            <NumberInput
              value={settings.musicStartTime}
              onChange={(valueString) => handleSettingChange('musicStartTime', parseFloat(valueString) || 0)}
              min={0}
              max={300}
              step={1}
              bg={inputBg}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="xs" color={mutedTextColor} mt={1}>
              💡 Cut the music to start from this time (e.g., 55 to start from the chorus at 55 seconds)
            </Text>
          </FormControl>
        </VStack>
      )}

      {/* Informação sobre configurações */}
      <Text fontSize="sm" color={mutedTextColor} textAlign="center" mt={4}>
        💡 Tip: Higher FPS and resolution will increase processing time but improve quality
      </Text>
    </VStack>
  );
};

export default VideoSettings;
