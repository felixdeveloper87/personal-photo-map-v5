/**
 * Serviço para processamento de áudio no gerador de vídeo timeline
 */

// Preset music (generated using Web Audio API)
export const presetMusics = {
  ambient1: { name: 'Calm Ambient', description: 'Relaxing tone for memories' },
  upbeat1: { name: 'Energetic', description: 'Animated rhythm for adventures' },
  nostalgic1: { name: 'Nostalgic', description: 'Melancholic for special moments' },
  cinematic1: { name: 'Cinematic', description: 'Epic for great moments' },
};

/**
 * Gera música preset usando Web Audio API
 * @param {string} musicType - Tipo de música (ambient1, upbeat1, etc.)
 * @param {number} durationSeconds - Duração em segundos
 * @returns {Promise<AudioBuffer>}
 */
export const generatePresetMusic = async (musicType, durationSeconds) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const numberOfChannels = 2;
  const length = sampleRate * durationSeconds;
  
  const audioBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let sample = 0;
      
      switch (musicType) {
        case 'ambient1':
          // Tom relaxante com harmonias suaves
          sample = Math.sin(2 * Math.PI * 220 * time) * 0.1 * Math.sin(2 * Math.PI * 0.5 * time) +
                   Math.sin(2 * Math.PI * 330 * time) * 0.05 * Math.sin(2 * Math.PI * 0.3 * time) +
                   Math.sin(2 * Math.PI * 440 * time) * 0.03 * Math.sin(2 * Math.PI * 0.7 * time);
          break;
          
        case 'upbeat1':
          // Ritmo energético com batida
          const beat = Math.floor(time * 2) % 2 === 0 ? 1 : 0.3;
          sample = Math.sin(2 * Math.PI * 440 * time) * 0.15 * beat +
                   Math.sin(2 * Math.PI * 880 * time) * 0.1 * Math.sin(2 * Math.PI * 4 * time);
          break;
          
        case 'nostalgic1':
          // Tom melancólico com progressão lenta
          sample = Math.sin(2 * Math.PI * 293.66 * time) * 0.12 * Math.sin(2 * Math.PI * 0.2 * time) +
                   Math.sin(2 * Math.PI * 349.23 * time) * 0.08 * Math.sin(2 * Math.PI * 0.15 * time);
          break;
          
        case 'cinematic1':
          // Tom épico com crescendo
          const intensity = Math.min(time / (durationSeconds * 0.7), 1);
          sample = Math.sin(2 * Math.PI * 174.61 * time) * 0.2 * intensity +
                   Math.sin(2 * Math.PI * 261.63 * time) * 0.15 * intensity +
                   Math.sin(2 * Math.PI * 392 * time) * 0.1 * intensity;
          break;
          
        default:
          sample = Math.sin(2 * Math.PI * 440 * time) * 0.1;
      }
      
      // Aplicar envelope para evitar cliques no início/fim
      const fadeTime = 0.1; // 100ms de fade
      if (time < fadeTime) {
        sample *= time / fadeTime;
      } else if (time > durationSeconds - fadeTime) {
        sample *= (durationSeconds - time) / fadeTime;
      }
      
      channelData[i] = sample;
    }
  }
  
  return audioBuffer;
};

/**
 * Configura áudio para gravação com MediaRecorder
 * @param {File|null} audioFile - Arquivo de áudio carregado
 * @param {number} videoDuration - Duração do vídeo em segundos
 * @param {Object} settings - Configurações de áudio
 * @returns {Promise<Object|null>}
 */
export const setupAudioForRecording = async (audioFile, videoDuration, settings) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer;
    
    if (settings.musicSource === 'upload' && audioFile) {
      // Processar arquivo carregado
      console.log('Processando arquivo de upload:', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        lastModified: audioFile.lastModified
      });
      
      const arrayBuffer = await audioFile.arrayBuffer();
      console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
      
      const originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Web Audio API funcionou! Áudio decodificado:', {
        duration: originalAudioBuffer.duration,
        sampleRate: originalAudioBuffer.sampleRate,
        channels: originalAudioBuffer.numberOfChannels,
        length: originalAudioBuffer.length
      });
      
      // Ajustar duração do áudio com margem de segurança para tempo de processamento
      const safetyMargin = Math.max(5, videoDuration * 0.2); // Pelo menos 5s ou 20% da duração do vídeo
      const targetDuration = videoDuration + safetyMargin;
      const targetLength = audioContext.sampleRate * targetDuration;
      const adjustedBuffer = audioContext.createBuffer(
        originalAudioBuffer.numberOfChannels,
        targetLength,
        audioContext.sampleRate
      );
      
      // Calcular offset de início da música
      const musicStartTime = settings.musicStartTime || 0;
      const startOffset = Math.floor(musicStartTime * audioContext.sampleRate);
      
      console.log('🎵 Sincronização de áudio:', {
        duracaoVideoTeorica: `${videoDuration}s`,
        margemSeguranca: `${safetyMargin.toFixed(1)}s`,
        duracaoAudioOriginal: `${originalAudioBuffer.duration.toFixed(2)}s`,
        duracaoAudioAjustada: `${targetDuration}s`,
        diferenca: `${(originalAudioBuffer.duration - targetDuration).toFixed(2)}s`,
        acao: originalAudioBuffer.duration >= targetDuration ? 'CORTAR' : 'REPETIR',
        musicStartTime: `${musicStartTime}s`,
        startOffset: `${startOffset} samples`
      });
      
      for (let channel = 0; channel < originalAudioBuffer.numberOfChannels; channel++) {
        const originalData = originalAudioBuffer.getChannelData(channel);
        const adjustedData = adjustedBuffer.getChannelData(channel);
        
        if (originalAudioBuffer.duration >= targetDuration) {
          // Áudio mais longo que necessário - cortar início e fim
          console.log('Áudio mais longo que necessário - cortando início e aplicando fade out...');
          const fadeOutDuration = 2; // 2 segundos de fade out
          const fadeOutStart = targetLength - (fadeOutDuration * audioContext.sampleRate);
          
          for (let i = 0; i < targetLength; i++) {
            // Cortar início da música - começar a partir do tempo especificado
            const sourceIndex = i + startOffset;
            let sample = originalData[sourceIndex] || 0;
            
            // Aplicar fade out nos últimos 2 segundos
            if (i >= fadeOutStart) {
              const fadeProgress = (i - fadeOutStart) / (fadeOutDuration * audioContext.sampleRate);
              sample *= (1 - fadeProgress);
            }
            
            adjustedData[i] = sample;
          }
        } else {
          // Áudio mais curto que necessário - repetir com corte de início
          console.log('Áudio mais curto que necessário - repetindo com corte de início...');
          for (let i = 0; i < targetLength; i++) {
            // Calcular posição no áudio original (com corte de início)
            const adjustedIndex = i + startOffset;
            const sourceIndex = adjustedIndex % originalData.length;
            const cyclePosition = (adjustedIndex % originalData.length) / originalData.length;
            
            let sample = originalData[sourceIndex] || 0;
            
            // Aplicar fade suave no início e fim de cada repetição
            let fadeMultiplier = 1;
            if (cyclePosition < 0.1) {
              // Fade in no início de cada repetição
              fadeMultiplier = cyclePosition / 0.1;
            } else if (cyclePosition > 0.9) {
              // Fade out no fim de cada repetição
              fadeMultiplier = (1 - cyclePosition) / 0.1;
            }
            
            sample *= fadeMultiplier;
            adjustedData[i] = sample;
          }
        }
      }
      
      audioBuffer = adjustedBuffer;
      
    } else if (settings.musicSource === 'preset') {
      // Gerar música preset
      console.log('Gerando música preset:', settings.selectedPresetMusic);
      const safetyMargin = Math.max(5, videoDuration * 0.2); // Pelo menos 5s ou 20% da duração do vídeo
      const targetDuration = videoDuration + safetyMargin;
      const musicStartTime = settings.musicStartTime || 0;
      
      // Gerar música com duração total incluindo o offset
      const totalDuration = targetDuration + musicStartTime;
      const generatedBuffer = await generatePresetMusic(settings.selectedPresetMusic, totalDuration);
      
      // Criar buffer final cortando o início
      const targetLength = audioContext.sampleRate * targetDuration;
      const startOffset = Math.floor(musicStartTime * audioContext.sampleRate);
      
      audioBuffer = audioContext.createBuffer(
        generatedBuffer.numberOfChannels,
        targetLength,
        audioContext.sampleRate
      );
      
      // Copiar dados cortando o início (começar a partir do tempo especificado)
      for (let channel = 0; channel < generatedBuffer.numberOfChannels; channel++) {
        const sourceData = generatedBuffer.getChannelData(channel);
        const targetData = audioBuffer.getChannelData(channel);
        
        for (let i = 0; i < targetLength; i++) {
          const sourceIndex = i + startOffset;
          targetData[i] = sourceData[sourceIndex] || 0;
        }
      }
      
      console.log('🎵 Música preset cortada:', {
        duracaoOriginal: `${totalDuration}s`,
        duracaoFinal: `${targetDuration}s`,
        tempoCortado: `${musicStartTime}s`,
        offset: `${startOffset} samples`
      });
    } else {
      console.log('Nenhuma fonte de áudio configurada');
      return null;
    }
    
    // Criar source e destination
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    
    // Controle de volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = settings.musicVolume || 0.5;
    
    // Criar destination para stream
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    
    // Conectar: source -> gain -> destination
    audioSource.connect(gainNode);
    gainNode.connect(mediaStreamDestination);
    
    console.log('Áudio conectado:', {
      bufferDuration: audioBuffer.duration,
      videoDuration: videoDuration,
      safetyMargin: 2,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      streamTracks: mediaStreamDestination.stream.getAudioTracks().length
    });
    
    return {
      audioSource,
      audioStream: mediaStreamDestination.stream,
      audioContext,
      gainNode
    };
    
  } catch (error) {
    console.error('Erro ao configurar áudio:', error);
    throw error;
  }
};
