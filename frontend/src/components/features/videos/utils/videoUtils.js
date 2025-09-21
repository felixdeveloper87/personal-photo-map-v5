/**
 * Utilitários para processamento de vídeo
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * Carrega uma imagem com fallback para CORS e timeout
 * @param {string} src - URL da imagem
 * @param {number} timeout - Timeout em ms (padrão: 5000)
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImage = (src, timeout = 2000) => {
  return new Promise((resolve, reject) => {
    let isResolved = false;
    
    const cleanup = () => {
      isResolved = true;
    };
    
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.warn(`Timeout na imagem após ${timeout}ms:`, src);
        reject(new Error(`Timeout loading image: ${src}`));
      }
    }, timeout);
    
    // Primeiro, tentar com CORS
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (!isResolved) {
        cleanup();
        clearTimeout(timeoutId);
        resolve(img);
      }
    };
    
    img.onerror = () => {
      if (isResolved) return;
      
      // Se CORS falhar, tentar sem CORS
      console.warn('CORS falhou, tentando sem CORS para:', src);
      const imgNoCors = new Image();
      
      imgNoCors.onload = () => {
        if (!isResolved) {
          cleanup();
          clearTimeout(timeoutId);
          resolve(imgNoCors);
        }
      };
      
      imgNoCors.onerror = (error) => {
        if (!isResolved) {
          cleanup();
          clearTimeout(timeoutId);
          console.error('Falha ao carregar imagem:', src, error);
          reject(error);
        }
      };
      
      imgNoCors.src = src;
    };
    
    img.src = src;
  });
};

/**
 * Configura opções do MediaRecorder para máxima compatibilidade
 * @param {number} videoBitsPerSecond - Taxa de bits do vídeo
 * @returns {Object} Opções do MediaRecorder
 */
export const getMediaRecorderOptions = (videoBitsPerSecond = 8000000) => {
  const options = {
    videoBitsPerSecond,
  };
  
  // Tentar codecs MP4 primeiro para compatibilidade móvel
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
    options.mimeType = 'video/mp4;codecs=h264,aac';
    console.log('✅ Usando codec MP4: h264,aac');
  } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
    options.mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    console.log('✅ Usando codec MP4: avc1.42E01E,mp4a.40.2');
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    options.mimeType = 'video/mp4';
    console.log('✅ Usando codec MP4 básico');
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    options.mimeType = 'video/webm;codecs=vp9,opus';
    console.log('⚠️ Fallback para WebM: vp9,opus');
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    options.mimeType = 'video/webm;codecs=vp8,opus';
    console.log('⚠️ Fallback para WebM: vp8,opus');
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    options.mimeType = 'video/webm';
    console.log('⚠️ Fallback para WebM básico');
  }
  
  return options;
};

/**
 * Inicializa FFmpeg para conversão de vídeo
 * @returns {Promise<FFmpeg>}
 */
export const initializeFFmpeg = async () => {
  const ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
  });
  
  console.log('FFmpeg loaded successfully');
  return ffmpeg;
};

/**
 * Converte WebM para MP4 usando FFmpeg
 * @param {Blob} webmBlob - Blob do vídeo WebM
 * @param {FFmpeg} ffmpeg - Instância do FFmpeg
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise<Blob>}
 */
export const convertWebMToMP4 = async (webmBlob, ffmpeg, onProgress) => {
  if (!ffmpeg) {
    console.log('FFmpeg not loaded, returning original WebM');
    return webmBlob;
  }

  try {
    console.log('📁 Escrevendo arquivo WebM para FFmpeg...');
    await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
    console.log('✅ Arquivo WebM escrito com sucesso');
    
    // Set up progress tracking
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.round(progress * 100);
        onProgress(percent);
        console.log('🔄 Progresso FFmpeg:', percent + '%');
      });
    }

    console.log('🎬 Iniciando conversão FFmpeg para MP4...');
    await ffmpeg.exec([
      '-i', 'input.webm',
      '-c:v', 'libx264',          // H.264 codec for maximum compatibility
      '-preset', 'medium',         // Balance between speed and compression
      '-crf', '23',               // Good quality setting
      '-c:a', 'aac',              // AAC audio codec
      '-b:a', '128k',             // Audio bitrate
      '-movflags', '+faststart',   // Optimize for web streaming
      '-pix_fmt', 'yuv420p',      // Pixel format compatible with older devices
      '-avoid_negative_ts', 'make_zero', // Evitar problemas de timestamp
      'output.mp4'
    ]);
    console.log('✅ Conversão FFmpeg concluída');

    // Read the converted file
    const mp4Data = await ffmpeg.readFile('output.mp4');
    const mp4Blob = new Blob([mp4Data], { type: 'video/mp4' });
    
    console.log('📊 Comparação de arquivos:', {
      webmSize: webmBlob.size,
      mp4Size: mp4Blob.size,
      webmSizeMB: (webmBlob.size / 1024 / 1024).toFixed(2) + ' MB',
      mp4SizeMB: (mp4Blob.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // Clean up
    await ffmpeg.deleteFile('input.webm');
    await ffmpeg.deleteFile('output.mp4');

    console.log('✅ Video converted to MP4 successfully');
    return mp4Blob;

  } catch (error) {
    console.error('Error converting video:', error);
    throw error;
  }
};

/**
 * Adiciona overlay de texto ao canvas
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLCanvasElement} canvas - Canvas
 * @param {string} year - Ano atual
 * @param {number} imageIndex - Índice da imagem atual
 * @param {number} totalImages - Total de imagens
 * @param {Object} settings - Configurações do texto
 */
export const addTextOverlay = async (ctx, canvas, year, imageIndex, totalImages, settings = {}) => {
  const {
    showYearText = true,
    showPhotoCount = true,
    showCountryName = true,
    textColor = 'white',
    fontSize = 'auto',
    position = 'bottom-left',
    countryId = null
  } = settings;
  
  ctx.save();
  
  // Logo removido - não é mais necessário
  
  // Determinar tamanho da fonte baseado no canvas - mais destaque
  const baseFontSize = fontSize === 'auto' ? Math.max(28, canvas.width / 45) : fontSize;
  const yearFontSize = baseFontSize * 3.0; // Ano com muito mais destaque
  const countryFontSize = baseFontSize * 2.0; // País com muito mais destaque
  const countFontSize = baseFontSize * 0.9; // Contador um pouco maior também
  
  // Configurar sombra para melhor legibilidade
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  
  // Determinar posição base
  const margin = 20;
  let x, y;
  
  switch (position) {
    case 'top-left':
      x = margin;
      y = margin + yearFontSize;
      break;
    case 'top-right':
      x = canvas.width - margin;
      y = margin + yearFontSize;
      ctx.textAlign = 'right';
      break;
    case 'bottom-right':
      x = canvas.width - margin;
      y = canvas.height - margin;
      ctx.textAlign = 'right';
      break;
    case 'bottom-left':
    default:
      x = margin;
      y = canvas.height - margin;
      break;
  }
  
  // Função para obter nome do país
  const getCountryName = (countryId) => {
    if (!countryId) return null;
    
    // Mapeamento de códigos de país comuns
    const countryMap = {
      'us': 'United States',
      'br': 'Brazil',
      'gb': 'United Kingdom',
      'fr': 'France',
      'de': 'Germany',
      'it': 'Italy',
      'es': 'Spain',
      'pt': 'Portugal',
      'ca': 'Canada',
      'au': 'Australia',
      'jp': 'Japan',
      'cn': 'China',
      'in': 'India',
      'mx': 'Mexico',
      'ar': 'Argentina',
      'cl': 'Chile',
      'co': 'Colombia',
      'pe': 'Peru',
      've': 'Venezuela',
      'ec': 'Ecuador',
      'uy': 'Uruguay',
      'py': 'Paraguay',
      'bo': 'Bolivia',
      'gy': 'Guyana',
      'sr': 'Suriname',
      'gf': 'French Guiana',
      'nl': 'Netherlands',
      'be': 'Belgium',
      'ch': 'Switzerland',
      'at': 'Austria',
      'se': 'Sweden',
      'no': 'Norway',
      'dk': 'Denmark',
      'fi': 'Finland',
      'pl': 'Poland',
      'cz': 'Czech Republic',
      'hu': 'Hungary',
      'ro': 'Romania',
      'bg': 'Bulgaria',
      'hr': 'Croatia',
      'si': 'Slovenia',
      'sk': 'Slovakia',
      'lt': 'Lithuania',
      'lv': 'Latvia',
      'ee': 'Estonia',
      'ie': 'Ireland',
      'is': 'Iceland',
      'lu': 'Luxembourg',
      'mt': 'Malta',
      'cy': 'Cyprus',
      'gr': 'Greece',
      'tr': 'Turkey',
      'ru': 'Russia',
      'ua': 'Ukraine',
      'by': 'Belarus',
      'md': 'Moldova',
      'ge': 'Georgia',
      'am': 'Armenia',
      'az': 'Azerbaijan',
      'kz': 'Kazakhstan',
      'uz': 'Uzbekistan',
      'tm': 'Turkmenistan',
      'tj': 'Tajikistan',
      'kg': 'Kyrgyzstan',
      'af': 'Afghanistan',
      'pk': 'Pakistan',
      'bd': 'Bangladesh',
      'lk': 'Sri Lanka',
      'mv': 'Maldives',
      'np': 'Nepal',
      'bt': 'Bhutan',
      'mm': 'Myanmar',
      'th': 'Thailand',
      'la': 'Laos',
      'kh': 'Cambodia',
      'vn': 'Vietnam',
      'my': 'Malaysia',
      'sg': 'Singapore',
      'id': 'Indonesia',
      'ph': 'Philippines',
      'tw': 'Taiwan',
      'hk': 'Hong Kong',
      'mo': 'Macau',
      'mn': 'Mongolia',
      'kp': 'North Korea',
      'kr': 'South Korea',
      'nz': 'New Zealand',
      'fj': 'Fiji',
      'pg': 'Papua New Guinea',
      'sb': 'Solomon Islands',
      'vu': 'Vanuatu',
      'nc': 'New Caledonia',
      'pf': 'French Polynesia',
      'ws': 'Samoa',
      'to': 'Tonga',
      'ki': 'Kiribati',
      'tv': 'Tuvalu',
      'nr': 'Nauru',
      'pw': 'Palau',
      'fm': 'Micronesia',
      'mh': 'Marshall Islands',
      'za': 'South Africa',
      'eg': 'Egypt',
      'ly': 'Libya',
      'tn': 'Tunisia',
      'dz': 'Algeria',
      'ma': 'Morocco',
      'sd': 'Sudan',
      'ss': 'South Sudan',
      'et': 'Ethiopia',
      'er': 'Eritrea',
      'dj': 'Djibouti',
      'so': 'Somalia',
      'ke': 'Kenya',
      'ug': 'Uganda',
      'tz': 'Tanzania',
      'rw': 'Rwanda',
      'bi': 'Burundi',
      'mw': 'Malawi',
      'zm': 'Zambia',
      'zw': 'Zimbabwe',
      'bw': 'Botswana',
      'na': 'Namibia',
      'sz': 'Eswatini',
      'ls': 'Lesotho',
      'mg': 'Madagascar',
      'mu': 'Mauritius',
      'sc': 'Seychelles',
      'km': 'Comoros',
      'yt': 'Mayotte',
      're': 'Réunion',
      'mz': 'Mozambique',
      'ao': 'Angola',
      'cd': 'Democratic Republic of the Congo',
      'cg': 'Republic of the Congo',
      'cm': 'Cameroon',
      'cf': 'Central African Republic',
      'td': 'Chad',
      'ne': 'Niger',
      'ng': 'Nigeria',
      'bj': 'Benin',
      'tg': 'Togo',
      'gh': 'Ghana',
      'bf': 'Burkina Faso',
      'ml': 'Mali',
      'sn': 'Senegal',
      'gm': 'Gambia',
      'gn': 'Guinea',
      'gw': 'Guinea-Bissau',
      'sl': 'Sierra Leone',
      'lr': 'Liberia',
      'ci': 'Ivory Coast',
      'gh': 'Ghana',
      'tg': 'Togo',
      'bj': 'Benin',
      'bf': 'Burkina Faso',
      'ml': 'Mali',
      'sn': 'Senegal',
      'gm': 'Gambia',
      'gn': 'Guinea',
      'gw': 'Guinea-Bissau',
      'sl': 'Sierra Leone',
      'lr': 'Liberia',
      'ci': 'Ivory Coast'
    };
    
    return countryMap[countryId.toLowerCase()] || countryId.toUpperCase();
  };

  // Desenhar ano com sigla do país integrada (canto superior direito)
  if (showYearText && year) {
    // Processar sigla do país primeiro para calcular dimensões
    let countryCode = null;
    if (showCountryName && countryId) {
      countryCode = String(countryId).toUpperCase().trim();
      const invalidValues = ['UNKNOWN', '', 'NULL', 'UNDEFINED', 'NONE'];
      if (invalidValues.includes(countryCode)) {
        countryCode = null;
      }
    }
    
    const yearText = year.toString();
    const spacing = 15; // Espaço entre sigla e ano
    
    // Calcular dimensões
    ctx.font = `bold ${countryFontSize}px Arial`;
    const countryWidth = countryCode ? ctx.measureText(countryCode).width : 0;
    
    ctx.font = `bold ${yearFontSize}px Arial`;
    const yearWidth = ctx.measureText(yearText).width;
    
    const totalWidth = (countryCode ? countryWidth + spacing : 0) + yearWidth;
    const boxHeight = Math.max(yearFontSize, countryFontSize) + 20;
    
    // Posicionamento (canto superior direito)
    const boxX = canvas.width - margin - totalWidth - 30;
    const boxY = margin;
    const boxWidth = totalWidth + 30;
    
    // Gradiente de fundo
    const gradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)'); // Dourado
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0.9)'); // Laranja
    
    ctx.fillStyle = gradient;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Borda destacada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Desenhar sigla do país (lado esquerdo)
    if (countryCode) {
      ctx.font = `bold ${countryFontSize}px Arial`;
      ctx.fillStyle = '#1E90FF'; // Azul para a sigla
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.textAlign = 'left';
      
      const countryX = boxX + 15;
      const countryY = boxY + (boxHeight / 2) + (countryFontSize / 3);
      ctx.fillText(countryCode, countryX, countryY);
    }
    
    // Desenhar ano (lado direito)
    ctx.font = `bold ${yearFontSize}px Arial`;
    ctx.fillStyle = '#000000'; // Texto preto para contrastar
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.textAlign = 'right';
    
    const yearX = boxX + boxWidth - 15;
    const yearY = boxY + (boxHeight / 2) + (yearFontSize / 3);
    ctx.fillText(yearText, yearX, yearY);
  }
  
  // A sigla do país agora está integrada com o ano no canto superior direito
  
  // Desenhar contador de fotos (canto superior esquerdo)
  if (showPhotoCount) {
    ctx.textAlign = 'left';
    const countX = margin;
    const countY = margin + countFontSize;
    
    // Fundo para o contador
    const countText = `${imageIndex + 1} / ${totalImages}`;
    const countWidth = countText.length * countFontSize * 0.6;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(countX - 5, countY - countFontSize - 3, countWidth + 10, countFontSize + 6);
    
    ctx.font = `bold ${countFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(countText, countX, countY);
  }
  
  // Detectar formato vertical para adicionar indicador
  const isVerticalFormat = canvas.height > canvas.width;
  if (isVerticalFormat) {
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const formatText = canvas.width === 1080 && canvas.height === 1920 ? '📱 Stories' : 
                      canvas.width === 1080 && canvas.height === 1350 ? '📱 Reel' : '📱 Vertical';
    ctx.textAlign = 'center';
    ctx.fillText(formatText, canvas.width / 2, 40);
  }
  
  ctx.restore();
};

/**
 * Calcula configurações de resolução
 * @returns {Object} Configurações de resolução disponíveis
 */
export const getResolutionSettings = () => ({
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  // Formatos verticais para Stories/Reels
  'stories-hd': { width: 1080, height: 1920 }, // 9:16 - Instagram Stories, TikTok
  'stories-4k': { width: 1440, height: 2560 }, // 9:16 - 4K vertical
  'reel-standard': { width: 1080, height: 1350 }, // 4:5 - Instagram Feed
});

/**
 * Cria nome de arquivo para download
 * @param {boolean} isMP4 - Se é arquivo MP4
 * @returns {string} Nome do arquivo
 */
export const generateFileName = (isMP4) => {
  const timestamp = new Date().getTime();
  const extension = isMP4 ? 'mp4' : 'webm';
  return `timeline-video-${timestamp}.${extension}`;
};

/**
 * Faz download de um blob
 * @param {Blob} blob - Blob para download
 * @param {string} filename - Nome do arquivo
 */
export const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar URL object
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
};
