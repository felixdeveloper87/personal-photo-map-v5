import * as EXIF from 'exif-js';

/**
 * Extrai metadados de uma foto, incluindo data/ano e informações GPS
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<Object>} Objeto com metadados extraídos
 */
export const extractPhotoMetadata = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const exif = EXIF.readFromBinaryFile(e.target.result) || {};
        
        // Extrair data da foto
        const dateStr = exif.DateTimeOriginal || exif.DateTime || exif.DateTimeDigitized || null;
        let photoDate = null;
        let year = null;
        
        if (dateStr && typeof dateStr === 'string' && dateStr.includes(':')) {
          // Formato EXIF: "YYYY:MM:DD HH:mm:ss"
          try {
            const [datePart, timePart] = dateStr.split(' ');
            const [exifYear, exifMonth, exifDay] = datePart.split(':');
            photoDate = new Date(
              parseInt(exifYear, 10),
              parseInt(exifMonth, 10) - 1, // Mês em JS é 0-indexed
              parseInt(exifDay, 10)
            );
            year = parseInt(exifYear, 10);
          } catch (e) {
            console.warn('Erro ao parsear data EXIF:', e);
          }
        }
        
        // Se não conseguiu extrair do EXIF, usar data de modificação do arquivo
        if (!year || isNaN(year)) {
          const fileDate = new Date(file.lastModified);
          photoDate = fileDate;
          year = fileDate.getFullYear();
        }
        
        // Extrair informações de GPS
        const hasGPS = !!(exif.GPSLatitude && exif.GPSLongitude);
        let latitude = null;
        let longitude = null;
        
        if (hasGPS) {
          try {
            // Converter coordenadas GPS de DMS (graus, minutos, segundos) para decimal
            latitude = convertDMSToDD(
              exif.GPSLatitude, 
              exif.GPSLatitudeRef
            );
            longitude = convertDMSToDD(
              exif.GPSLongitude, 
              exif.GPSLongitudeRef
            );
          } catch (e) {
            console.warn('Erro ao converter coordenadas GPS:', e);
          }
        }
        
        // Extrair outras informações úteis
        const metadata = {
          // Data e ano
          year,
          photoDate: photoDate ? photoDate.toISOString() : null,
          dateSource: dateStr ? 'exif' : 'file',
          
          // GPS
          hasGPS,
          latitude,
          longitude,
          
          // Informações da câmera
          camera: {
            make: exif.Make || null,
            model: exif.Model || null,
            software: exif.Software || null,
          },
          
          // Configurações da foto
          settings: {
            iso: exif.ISOSpeedRatings || null,
            focalLength: exif.FocalLength || null,
            aperture: exif.FNumber || null,
            shutterSpeed: exif.ExposureTime || null,
            flash: exif.Flash || null,
          },
          
          // Informações técnicas
          dimensions: {
            width: exif.PixelXDimension || exif.ExifImageWidth || null,
            height: exif.PixelYDimension || exif.ExifImageHeight || null,
          },
          
          // Orientação
          orientation: exif.Orientation || 1,
          
          // EXIF completo para debugging
          originalExif: exif,
        };
        
        resolve(metadata);
        
      } catch (error) {
        console.error('Erro ao extrair metadados EXIF:', error);
        
        // Fallback: usar apenas data do arquivo
        const fileDate = new Date(file.lastModified);
        resolve({
          year: fileDate.getFullYear(),
          photoDate: fileDate.toISOString(),
          dateSource: 'file',
          hasGPS: false,
          latitude: null,
          longitude: null,
          camera: {},
          settings: {},
          dimensions: {},
          orientation: 1,
          originalExif: null,
        });
      }
    };
    
    reader.onerror = () => {
      console.error('Erro ao ler arquivo');
      // Fallback para erro de leitura
      const fileDate = new Date(file.lastModified);
      resolve({
        year: fileDate.getFullYear(),
        photoDate: fileDate.toISOString(),
        dateSource: 'file',
        hasGPS: false,
        latitude: null,
        longitude: null,
        camera: {},
        settings: {},
        dimensions: {},
        orientation: 1,
        originalExif: null,
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Converte coordenadas DMS (Degrees, Minutes, Seconds) para DD (Decimal Degrees)
 * @param {Array} dmsArray - Array com [graus, minutos, segundos]
 * @param {string} ref - Referência (N, S, E, W)
 * @returns {number} Coordenada em decimal
 */
const convertDMSToDD = (dmsArray, ref) => {
  if (!dmsArray || dmsArray.length !== 3) return null;
  
  const [degrees, minutes, seconds] = dmsArray;
  let dd = degrees + minutes / 60 + seconds / 3600;
  
  // Aplicar sinal baseado na referência
  if (ref === 'S' || ref === 'W') {
    dd = dd * -1;
  }
  
  return dd;
};

/**
 * Processa múltiplas fotos e extrai metadados de todas
 * @param {FileList|Array} files - Lista de arquivos
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @returns {Promise<Array>} Array com metadados de cada foto
 */
export const extractMetadataFromFiles = async (files, onProgress = null) => {
  const fileArray = Array.from(files);
  const results = [];
  
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    try {
      const metadata = await extractPhotoMetadata(file);
      results.push({
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ...metadata,
      });
      
      // Chamar callback de progresso se fornecido
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: fileArray.length,
          percentage: Math.round(((i + 1) / fileArray.length) * 100),
          currentFile: file.name,
        });
      }
      
    } catch (error) {
      console.error(`Erro ao processar arquivo ${file.name}:`, error);
      
      // Adicionar entrada com erro, mas continuar processamento
      const fileDate = new Date(file.lastModified);
      results.push({
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        year: fileDate.getFullYear(),
        photoDate: fileDate.toISOString(),
        dateSource: 'file',
        hasGPS: false,
        error: error.message,
      });
    }
  }
  
  return results;
};

/**
 * Detecta automaticamente o ano de uma foto usando múltiplas estratégias
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<number>} Ano detectado
 */
export const detectPhotoYear = async (file) => {
  try {
    const metadata = await extractPhotoMetadata(file);
    return metadata.year;
  } catch (error) {
    console.error('Erro ao detectar ano da foto:', error);
    // Fallback: usar ano de modificação do arquivo
    return new Date(file.lastModified).getFullYear();
  }
};

/**
 * Organiza fotos por ano baseado em seus metadados
 * @param {Array} photosWithMetadata - Array de fotos com metadados
 * @returns {Object} Objeto agrupado por ano
 */
export const groupPhotosByYear = (photosWithMetadata) => {
  return photosWithMetadata.reduce((acc, photo) => {
    const year = photo.year || new Date().getFullYear();
    
    if (!acc[year]) {
      acc[year] = [];
    }
    
    acc[year].push(photo);
    return acc;
  }, {});
};

/**
 * Valida se um arquivo é uma imagem suportada
 * @param {File} file - Arquivo para validar
 * @returns {boolean} True se for uma imagem suportada
 */
export const isValidImageFile = (file) => {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/tiff',
    'image/bmp',
  ];
  
  return supportedTypes.includes(file.type.toLowerCase());
};

/**
 * Cria um preview de uma imagem com orientação correta
 * @param {File} file - Arquivo de imagem
 * @param {number} maxSize - Tamanho máximo do preview (default: 200)
 * @returns {Promise<string>} URL do preview
 */
export const createImagePreview = (file, maxSize = 200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxSize;
          height = maxSize / aspectRatio;
        } else {
          height = maxSize;
          width = maxSize * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para URL
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Erro ao criar preview'));
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
};
