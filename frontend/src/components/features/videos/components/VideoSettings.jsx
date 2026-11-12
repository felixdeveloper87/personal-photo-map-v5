/**
 * Componente de configurações para o gerador de vídeo — Atlas UI
 */

import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import { HiCheckCircle, HiFilm, HiMusicalNote, HiPhoto, HiSparkles, HiArrowUpTray } from 'react-icons/hi2';
import { presetMusics } from '../../../../services/video/audioProcessor';
import { ModalNotice, ModalSection, Panel } from '../../../modals/ModalKit';
import { color, font, radius, type } from '../../../../design/tokens';

/** Label + value readout for sliders. */
const SliderLabel = ({ label, value }) => (
  <HStack justify="space-between" mb={2}>
    <FormLabel variant="atlas" mb={0}>
      {label}
    </FormLabel>
    <Text {...type.label} color={color.primary}>
      {value}
    </Text>
  </HStack>
);

/** One switch row (label left, switch right). */
const ToggleRow = ({ id, label, isChecked, onChange }) => (
  <FormControl
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap={3}
    px={3.5}
    py={2.5}
    borderRadius={radius.md}
    bg="rgba(236,231,220,0.025)"
    border="1px solid"
    borderColor={color.hairline}
  >
    <FormLabel htmlFor={id} mb="0" fontSize="sm" fontWeight="500" color={color.textSoft} cursor="pointer">
      {label}
    </FormLabel>
    <Switch id={id} isChecked={isChecked} onChange={onChange} />
  </FormControl>
);

const VideoSettings = ({ settings, onSettingsChange, audioFile, onAudioFileChange, audioUrl }) => {
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
    <VStack spacing={6} align="stretch">
      {/* ── Timing & transitions ─────────────────────────────── */}
      <ModalSection title="Timing & transitions" icon={HiFilm}>
        <VStack spacing={4} align="stretch">
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <FormControl>
              <FormLabel variant="atlas">Duration per photo (seconds)</FormLabel>
              <NumberInput
                value={settings.duration}
                onChange={(valueString) => handleSettingChange('duration', parseFloat(valueString))}
                min={0.5}
                max={10}
                step={0.1}
              >
                <NumberInputField fontFamily={font.mono} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel variant="atlas">Transition type</FormLabel>
              <Select value={settings.transition} onChange={(e) => handleSettingChange('transition', e.target.value)}>
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
          </SimpleGrid>

          {settings.transition === 'dynamic' && (
            <FormControl>
              <FormLabel variant="atlas">Dynamic mode</FormLabel>
              <Select value={settings.dynamicMode} onChange={(e) => handleSettingChange('dynamicMode', e.target.value)}>
                <option value="smart">🧠 Smart (Context-based)</option>
                <option value="random">🎲 Random</option>
                <option value="sequential">📋 Sequential</option>
              </Select>
            </FormControl>
          )}

          {settings.transition === 'stories' && (
            <ModalNotice tone="info" title="Stories style">
              Clean, simple transitions perfect for Instagram Stories. Images display without complex effects for maximum
              impact.
            </ModalNotice>
          )}

          <FormControl>
            <SliderLabel label="Transition duration" value={`${settings.transitionDuration}s`} />
            <Slider
              aria-label="Transition duration"
              value={settings.transitionDuration}
              onChange={(value) => handleSettingChange('transitionDuration', value)}
              min={0.1}
              max={2}
              step={0.1}
            >
              <SliderTrack bg="rgba(236,231,220,0.08)">
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxShadow={`0 0 0 4px ${color.focusRing}`} />
            </Slider>
          </FormControl>
        </VStack>
      </ModalSection>

      {/* ── Format ───────────────────────────────────────────── */}
      <ModalSection title="Format" icon={HiPhoto}>
        <VStack spacing={4} align="stretch">
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <FormControl>
              <FormLabel variant="atlas">Resolution</FormLabel>
              <Select value={settings.resolution} onChange={(e) => handleSettingChange('resolution', e.target.value)}>
                <option value="720p">🖥️ 720p (1280x720)</option>
                <option value="1080p">📺 1080p (1920x1080)</option>
                <option value="1440p">🖨️ 1440p (2560x1440)</option>
                <option value="stories-hd">📱 Stories HD (1080x1920) - Vertical</option>
                <option value="stories-4k">📱 Stories 4K (1440x2560) - Vertical</option>
                <option value="reel-standard">📱 Instagram Feed (1080x1350) - Square</option>
              </Select>
              {settings.resolution.includes('stories') && (
                <FormHelperText>Stories format: smart crop will preserve image meaning for landscape photos</FormHelperText>
              )}
            </FormControl>

            <FormControl>
              <FormLabel variant="atlas">Frames per second</FormLabel>
              <Select value={settings.fps} onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}>
                <option value={24}>🎬 24 FPS (Cinema)</option>
                <option value={30}>📹 30 FPS (Standard)</option>
                <option value={60}>⚡ 60 FPS (Smooth)</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: settings.imageFitMode === 'fill' ? 2 : 1 }} spacing={4}>
            <FormControl>
              <FormLabel variant="atlas">Image fit mode</FormLabel>
              <Select value={settings.imageFitMode || 'fill'} onChange={(e) => handleSettingChange('imageFitMode', e.target.value)}>
                <option value="fill">🖼️ Fill (Crop to fit, no black bars)</option>
                <option value="fit">📏 Fit (Show entire image, may add black bars)</option>
                <option value="stretch">🔄 Stretch (Distort to fit exactly)</option>
              </Select>
              <FormHelperText>How to handle images with different aspect ratios than the video</FormHelperText>
            </FormControl>

            {settings.imageFitMode === 'fill' && (
              <FormControl>
                <FormLabel variant="atlas">Smart crop position</FormLabel>
                <Select value={settings.smartCrop || 'center'} onChange={(e) => handleSettingChange('smartCrop', e.target.value)}>
                  <option value="center">🎯 Center Crop (Default)</option>
                  <option value="face-detection">👤 Face Detection (Best for portraits)</option>
                  <option value="object-detection">🔍 Object Detection (Best for landscapes)</option>
                  <option value="rule-of-thirds">📐 Rule of Thirds (Artistic composition)</option>
                  <option value="top">⬆️ Top Focus</option>
                  <option value="bottom">⬇️ Bottom Focus</option>
                  <option value="left">⬅️ Left Focus</option>
                  <option value="right">➡️ Right Focus</option>
                </Select>
                <FormHelperText>Choose which part of the image to focus on when cropping</FormHelperText>
              </FormControl>
            )}
          </SimpleGrid>
        </VStack>
      </ModalSection>

      {/* ── Overlays & effects ───────────────────────────────── */}
      <ModalSection title="Overlays & effects" icon={HiSparkles}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5}>
          <ToggleRow
            id="show-year"
            label="Show year text"
            isChecked={settings.showYearText}
            onChange={(e) => handleSettingChange('showYearText', e.target.checked)}
          />
          <ToggleRow
            id="show-country"
            label="Show country name"
            isChecked={settings.showCountryName}
            onChange={(e) => handleSettingChange('showCountryName', e.target.checked)}
          />
          <ToggleRow
            id="show-count"
            label="Show photo count"
            isChecked={settings.showPhotoCount}
            onChange={(e) => handleSettingChange('showPhotoCount', e.target.checked)}
          />
          <ToggleRow
            id="enable-particles"
            label="Enable particle effects"
            isChecked={settings.enableParticles}
            onChange={(e) => handleSettingChange('enableParticles', e.target.checked)}
          />
        </SimpleGrid>
      </ModalSection>

      {/* ── Music ────────────────────────────────────────────── */}
      <ModalSection title="Music" icon={HiMusicalNote}>
        <VStack spacing={4} align="stretch">
          <ToggleRow
            id="enable-music"
            label="Enable background music"
            isChecked={settings.musicEnabled}
            onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
          />

          {settings.musicEnabled && (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel variant="atlas">Music source</FormLabel>
                <Select value={settings.musicSource} onChange={(e) => handleSettingChange('musicSource', e.target.value)}>
                  <option value="none">🚫 No music</option>
                  <option value="upload">📁 Upload file</option>
                  <option value="preset">🎵 Preset music</option>
                </Select>
              </FormControl>

              {settings.musicSource === 'upload' && (
                <FormControl>
                  <FormLabel variant="atlas">Audio file (MP3, WAV, AAC, etc.)</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <ModalNotice tone="warning" title="iOS Safari Limitation">
                      <Text>
                        <strong>Importante:</strong> iOS Safari não pode acessar músicas da biblioteca do Apple Music
                        diretamente por questões de segurança.
                      </Text>
                      <Text mt={1.5}>
                        <strong>Solução:</strong> Se a música está no Apple Music:
                      </Text>
                      <Box as="ol" pl={5} mt={1}>
                        <li>Abra a música no app &quot;Music&quot;</li>
                        <li>Exporte ou encontre o arquivo MP3</li>
                        <li>Salve no app &quot;Files&quot;</li>
                        <li>Depois volte aqui e selecione do &quot;Files&quot;</li>
                      </Box>
                    </ModalNotice>

                    {/* Styled drop target over the native file input */}
                    <Box
                      as="label"
                      htmlFor="audio-upload"
                      position="relative"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={2.5}
                      minH="64px"
                      px={4}
                      borderRadius={radius.md}
                      border="1.5px dashed"
                      borderColor={audioFile ? color.primarySoftBorder : color.hairlineMid}
                      bg={audioFile ? color.primarySoftBg : 'rgba(236,231,220,0.02)'}
                      color={audioFile ? color.primary : color.textSoft}
                      cursor="pointer"
                      transition="all .2s ease"
                      _hover={{ borderColor: color.primarySoftBorder, bg: color.primarySoftBg }}
                    >
                      <Icon as={audioFile ? HiCheckCircle : HiArrowUpTray} boxSize={5} />
                      <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                        {audioFile ? audioFile.name : 'Tap aqui para selecionar música'}
                      </Text>
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/mpeg,audio/mp4,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/*"
                        onChange={handleAudioFileSelect}
                        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                      />
                    </Box>

                    <Panel>
                      <Text fontSize="sm" color={color.text} fontWeight="700" mb={2.5}>
                        Passo a Passo para iPhone/iPad
                      </Text>
                      <Box as="ol" pl={5} fontSize="sm" color={color.textSoft} sx={{ '& li': { mb: 1.5 } }}>
                        <li>
                          <strong>Tap</strong> no campo de seleção acima (tracejado)
                        </li>
                        <li>
                          Na tela que abrir, procure por <strong>&quot;Editar&quot;</strong> no canto superior direito
                        </li>
                        <li>
                          Tap em <strong>&quot;Adicionar Arquivos...&quot;</strong> (Add Files)
                        </li>
                        <li>
                          Escolha onde está sua música:
                          <Box as="ul" pl={4} mt={1} color={color.textMuted}>
                            <li>
                              <strong>Files</strong> - Se salvou antes
                            </li>
                            <li>
                              <strong>iCloud Drive</strong> - Se tem na nuvem
                            </li>
                            <li>
                              <strong>Dropbox</strong> - Se estiver lá
                            </li>
                            <li>
                              <strong>Google Drive</strong> - Também funciona
                            </li>
                            <li>
                              <strong>Downloads</strong> - Se baixou recentemente
                            </li>
                          </Box>
                        </li>
                      </Box>
                    </Panel>
                  </VStack>

                  {audioFile && (
                    <ModalNotice tone="success" title="Música selecionada com sucesso!" mt={3}>
                      {audioFile.name}
                    </ModalNotice>
                  )}
                  {audioUrl && !audioFile && (
                    <Text fontSize="sm" color={color.accent} mt={2}>
                      Audio loaded from previous session
                    </Text>
                  )}
                </FormControl>
              )}

              {settings.musicSource === 'preset' && (
                <FormControl>
                  <FormLabel variant="atlas">Preset music</FormLabel>
                  <Select
                    value={settings.selectedPresetMusic}
                    onChange={(e) => handleSettingChange('selectedPresetMusic', e.target.value)}
                  >
                    {Object.entries(presetMusics).map(([key, music]) => (
                      <option key={key} value={key}>
                        🎵 {music.name} - {music.description}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl>
                  <SliderLabel label="Music volume" value={`${Math.round(settings.musicVolume * 100)}%`} />
                  <Slider
                    aria-label="Music volume"
                    value={settings.musicVolume}
                    onChange={(value) => handleSettingChange('musicVolume', value)}
                    min={0}
                    max={1}
                    step={0.1}
                  >
                    <SliderTrack bg="rgba(236,231,220,0.08)">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxShadow={`0 0 0 4px ${color.focusRing}`} />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel variant="atlas">Music start time (seconds)</FormLabel>
                  <NumberInput
                    value={settings.musicStartTime}
                    onChange={(valueString) => handleSettingChange('musicStartTime', parseFloat(valueString) || 0)}
                    min={0}
                    max={300}
                    step={1}
                  >
                    <NumberInputField fontFamily={font.mono} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    Cut the music to start from this time (e.g., 55 to start from the chorus at 55 seconds)
                  </FormHelperText>
                </FormControl>
              </SimpleGrid>
            </VStack>
          )}
        </VStack>
      </ModalSection>

      <Text fontSize="xs" color={color.textMuted} textAlign="center">
        Tip: higher FPS and resolution will increase processing time but improve quality.
      </Text>
    </VStack>
  );
};

export default VideoSettings;
