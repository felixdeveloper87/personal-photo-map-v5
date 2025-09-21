/**
 * Engine de transições para o gerador de vídeo timeline
 */

/**
 * Aplica efeito de partículas no canvas
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLCanvasElement} canvas - Elemento canvas
 * @param {number} progress - Progresso da transição (0-1)
 */
const applyParticleEffect = (ctx, canvas, progress) => {
  const particleCount = Math.floor(50 * progress);
  
  for (let i = 0; i < particleCount; i++) {
    ctx.save();
    ctx.globalAlpha = Math.random() * 0.5;
    ctx.fillStyle = `hsl(${Math.random() * 60 + 20}, 70%, 80%)`;
    
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 3 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

/**
 * Função de easing suave para transições profissionais
 */
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const easeInQuart = (t) => t * t * t * t;

/**
 * Desenha imagem no estilo Stories (limpo e simples)
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawStoriesStyle = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  ctx.save();
  
  // Estilo Stories: imagem limpa e simples
  ctx.globalAlpha = 1;
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição fade
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawFadeTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  ctx.save();
  
  // Easing suave para fade mais natural
  const easedProgress = easeInOutCubic(progress);
  ctx.globalAlpha = easedProgress;
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição slide
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawSlideTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  ctx.save();
  
  // Easing suave para slide mais natural
  const easedProgress = easeOutQuart(progress);
  
  // Slide da direita para a esquerda
  const slideOffset = (1 - easedProgress) * canvas.width;
  ctx.translate(slideOffset, 0);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição zoom
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawZoomTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  // Easing suave para zoom mais natural
  const easedProgress = easeInOutCubic(progress);
  
  // Zoom mais sutil e profissional
  const scale = 0.9 + (easedProgress * 0.15);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  
  // Adicionar rotação sutil para dinamismo
  const rotation = Math.sin(easedProgress * Math.PI) * 0.02;
  ctx.rotate(rotation);
  
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com efeito Ken Burns
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawKenBurnsTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  // Easing suave para movimento mais natural
  const easedProgress = easeInOutCubic(progress);
  
  // Movimento mais sutil e cinematográfico
  const scale = 1 + (easedProgress * 0.08);
  const offsetX = Math.sin(easedProgress * Math.PI) * 15;
  const offsetY = Math.cos(easedProgress * Math.PI * 0.7) * 10;
  
  ctx.save();
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.scale(scale, scale);
  
  // Adicionar rotação sutil
  const rotation = Math.sin(easedProgress * Math.PI * 0.5) * 0.01;
  ctx.rotate(rotation);
  
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição wipe
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawWipeTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  const wipeProgress = Math.min(progress * 1.3, 1);
  const wipeWidth = wipeProgress * canvas.width;
  
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, wipeWidth, canvas.height);
  ctx.clip();
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição spiral
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawSpiralTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  const spiralProgress = Math.min(progress * 1.2, 1);
  const rotation = spiralProgress * Math.PI * 0.5;
  const scale = 0.7 + (spiralProgress * 0.3);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição bounce
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawBounceTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  const bounceProgress = Math.min(progress * 1.1, 1);
  const bounce = Math.sin(bounceProgress * Math.PI) * 0.1;
  const scale = 0.9 + bounce;
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição flip 3D
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawFlip3DTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  const flipProgress = Math.min(progress * 1.3, 1);
  const perspective = Math.cos(flipProgress * Math.PI * 0.5);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(Math.abs(perspective), 1);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  if (perspective > 0) {
    const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
    ctx.drawImage(img, x, y, width, height);
  }
  
  ctx.restore();
};

/**
 * Calcula dimensões da imagem baseado no modo de ajuste
 * @param {HTMLImageElement} img - Imagem
 * @param {HTMLCanvasElement} canvas - Canvas
 * @param {string} fitMode - Modo de ajuste ('fill', 'fit', 'stretch')
 * @param {string} smartCrop - Tipo de crop inteligente (para fill mode)
 * @returns {Object} Coordenadas e dimensões
 */
const calculateImageDimensions = (img, canvas, fitMode = 'fill', smartCrop = 'center') => {
  const imgAspect = img.width / img.height;
  const canvasAspect = canvas.width / canvas.height;
  
  let width, height, x, y;
  
  switch (fitMode) {
    case 'stretch':
      // Esticar para preencher exatamente (pode distorcer)
      return {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
      };
      
    case 'fit':
      // Ajustar mantendo aspect ratio (pode ter barras pretas)
      if (imgAspect > canvasAspect) {
        // Imagem mais larga - ajustar pela largura
        width = canvas.width;
        height = width / imgAspect;
        x = 0;
        y = (canvas.height - height) / 2;
      } else {
        // Imagem mais alta - ajustar pela altura
        height = canvas.height;
        width = height * imgAspect;
        x = (canvas.width - width) / 2;
        y = 0;
      }
      return { x, y, width, height };
      
    case 'fill':
    default:
      // Preencher cortando se necessário (sem barras pretas)
      return calculateSmartCrop(img, canvas, smartCrop);
  }
};

/**
 * Calcula smart crop para imagens landscape em formato vertical
 * @param {HTMLImageElement} img - Imagem
 * @param {HTMLCanvasElement} canvas - Canvas
 * @param {string} cropType - Tipo de crop
 * @returns {Object} Coordenadas e dimensões
 */
const calculateSmartCrop = (img, canvas, cropType) => {
  const imgAspect = img.width / img.height;
  const canvasAspect = canvas.width / canvas.height;
  
  // Calcular dimensões para preencher o canvas mantendo aspect ratio
  let scaleX = canvas.width / img.width;
  let scaleY = canvas.height / img.height;
  let scale = Math.max(scaleX, scaleY); // Preencher completamente
  
  let width = img.width * scale;
  let height = img.height * scale;
  let x = (canvas.width - width) / 2;
  let y = (canvas.height - height) / 2;
  
  // Aplicar crop inteligente baseado no tipo
  switch (cropType) {
    case 'face-detection':
      // Simular detecção de rosto - focar no centro superior
      y = Math.max(0, y - height * 0.1);
      break;
      
    case 'object-detection':
      // Simular detecção de objeto - focar no centro
      // Manter posição central
      break;
      
    case 'rule-of-thirds':
      // Regra dos terços - focar no terço superior
      y = Math.max(0, y - height * 0.15);
      break;
      
    case 'top':
      // Focar na parte superior
      y = Math.max(-height * 0.3, -height + canvas.height);
      break;
      
    case 'bottom':
      // Focar na parte inferior
      y = Math.min(height * 0.3, 0);
      break;
      
    case 'left':
      // Focar na parte esquerda
      x = Math.max(-width * 0.3, -width + canvas.width);
      break;
      
    case 'right':
      // Focar na parte direita
      x = Math.min(width * 0.3, 0);
      break;
      
    case 'center':
    default:
      // Crop central - manter posição atual
      break;
  }
  
  return { x, y, width, height };
};

/**
 * Seleciona transição dinâmica baseada no contexto
 * @param {number} imageIndex - Índice da imagem atual
 * @param {number} totalImages - Total de imagens
 * @param {number} currentYear - Ano atual
 * @param {number} previousYear - Ano anterior
 * @param {string} mode - Modo dinâmico ('smart', 'random', 'sequential')
 * @returns {string} Nome da transição
 */
export const getDynamicTransition = (imageIndex, totalImages, currentYear, previousYear, mode = 'smart') => {
  const transitions = [
    'stories', 'fade', 'slide', 'zoom', 'kenBurns', 'wipe', 'spiral', 'bounce', 'flip3d',
    'dissolve', 'push', 'reveal', 'scale', 'rotate'
  ];
  
  if (mode === 'random') {
    return transitions[Math.floor(Math.random() * transitions.length)];
  }
  
  if (mode === 'sequential') {
    return transitions[imageIndex % transitions.length];
  }
  
  // Modo smart - baseado no contexto
  const isFirstImage = imageIndex === 0;
  const isLastImage = imageIndex === totalImages - 1;
  const isYearChange = previousYear !== null && currentYear !== previousYear;
  const progressPercent = imageIndex / totalImages;
  
  if (isFirstImage) {
    return 'fade'; // Entrada suave
  }
  
  if (isLastImage) {
    return 'kenBurns'; // Saída épica
  }
  
  if (isYearChange) {
    return Math.random() > 0.5 ? 'wipe' : 'flip3d'; // Mudança dramática para ano novo
  }
  
  if (progressPercent < 0.3) {
    // Início: transições suaves
    return ['fade', 'slide', 'zoom'][Math.floor(Math.random() * 3)];
  } else if (progressPercent < 0.7) {
    // Meio: transições dinâmicas
    return ['kenBurns', 'spiral', 'bounce'][Math.floor(Math.random() * 3)];
  } else {
    // Final: transições impactantes
    return ['wipe', 'flip3d', 'zoom'][Math.floor(Math.random() * 3)];
  }
};

/**
 * Desenha imagem com transição especificada
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {string} transition - Tipo de transição
 * @param {number} progress - Progresso da transição (0-1)
 * @param {boolean} enableParticles - Se deve aplicar efeito de partículas
 * @param {string} fitMode - Modo de ajuste da imagem ('fill', 'fit', 'stretch')
 * @param {string} smartCrop - Posicionamento do crop para fill mode
 */
export const drawImageWithTransition = (ctx, img, canvas, transition, progress, enableParticles = false, fitMode = 'fill', smartCrop = 'center') => {
  // Aplicar transição baseada no tipo
  switch (transition) {
    case 'stories':
      // Estilo Stories: imagem simples sem transições
      drawStoriesStyle(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'fade':
      drawFadeTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'slide':
      drawSlideTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'zoom':
      drawZoomTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'kenBurns':
      drawKenBurnsTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'wipe':
      drawWipeTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'spiral':
      drawSpiralTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'bounce':
      drawBounceTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'flip3d':
      drawFlip3DTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    // Novas transições cinematográficas
    case 'dissolve':
      drawDissolveTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'push':
      drawPushTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'reveal':
      drawRevealTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'scale':
      drawScaleTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    case 'rotate':
      drawRotateTransition(ctx, img, canvas, progress, fitMode, smartCrop);
      break;
    default:
      // Fallback para Stories
      drawStoriesStyle(ctx, img, canvas, progress, fitMode, smartCrop);
  }
  
  // Aplicar efeito de partículas se habilitado
  if (enableParticles && progress > 0.5) {
    applyParticleEffect(ctx, canvas, progress - 0.5);
  }
};

/**
 * Desenha imagem com transição dissolve cinematográfica
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawDissolveTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  ctx.save();
  
  // Easing suave para dissolve mais natural
  const easedProgress = easeInOutCubic(progress);
  ctx.globalAlpha = easedProgress;
  
  // Adicionar blur sutil durante a transição
  if (easedProgress < 0.5) {
    ctx.filter = `blur(${(0.5 - easedProgress) * 1}px)`;
  }
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição push cinematográfica
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawPushTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  // Easing suave para movimento mais natural
  const easedProgress = easeOutQuart(progress);
  const pushOffset = (1 - easedProgress) * canvas.width;
  
  ctx.save();
  
  // Adicionar escala sutil durante o push
  const scale = 0.95 + (easedProgress * 0.05);
  ctx.scale(scale, scale);
  ctx.translate(pushOffset, 0);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição reveal cinematográfica
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawRevealTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  ctx.save();
  
  // Easing suave para reveal mais natural
  const easedProgress = easeInQuart(progress);
  
  // Criar máscara de reveal
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width * easedProgress, canvas.height);
  ctx.clip();
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição scale cinematográfica
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawScaleTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  // Easing suave para scale mais natural
  const easedProgress = easeInOutCubic(progress);
  
  // Scale mais sutil e profissional
  const scale = 0.8 + (easedProgress * 0.25);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  
  // Adicionar rotação sutil
  const rotation = Math.sin(easedProgress * Math.PI) * 0.03;
  ctx.rotate(rotation);
  
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};

/**
 * Desenha imagem com transição rotate cinematográfica
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLImageElement} img - Imagem a ser desenhada
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {number} progress - Progresso da transição (0-1)
 */
const drawRotateTransition = (ctx, img, canvas, progress, fitMode = 'fill', smartCrop = 'center') => {
  // Easing suave para rotação mais natural
  const easedProgress = easeInOutCubic(progress);
  
  // Rotação sutil e profissional
  const rotation = easedProgress * Math.PI * 0.1;
  const scale = 0.9 + (easedProgress * 0.1);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  const { x, y, width, height } = calculateImageDimensions(img, canvas, fitMode, smartCrop);
  ctx.drawImage(img, x, y, width, height);
  
  ctx.restore();
};
