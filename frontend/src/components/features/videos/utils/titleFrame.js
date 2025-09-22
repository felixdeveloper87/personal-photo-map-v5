/**
 * Função para desenhar frame de título no vídeo
 */

/**
 * Desenha frame de título para o vídeo
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLCanvasElement} canvas - Canvas de destino
 * @param {string} title - Título a ser exibido
 */
export const drawTitleFrame = (ctx, canvas, title) => {
  ctx.save();
  
  // Fundo gradiente elegante
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(0.5, '#2d2d2d');
  gradient.addColorStop(1, '#1a1a1a');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Configurar fonte e estilo do texto
  const fontSize = Math.min(canvas.width * 0.08, canvas.height * 0.1, 80);
  ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Sombra do texto para melhor legibilidade
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Cor do texto principal
  ctx.fillStyle = '#ffffff';
  
  // Quebrar texto em linhas se necessário
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > canvas.width * 0.8) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        lines.push(words[i]);
      }
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Desenhar as linhas de texto
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalHeight) / 2;
  
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight);
    ctx.fillText(line, canvas.width / 2, y);
  });
  
  // Adicionar uma linha decorativa abaixo do título
  ctx.strokeStyle = '#4a9eff';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  const lineY = startY + totalHeight + 20;
  const lineWidth = Math.min(canvas.width * 0.3, 200);
  const lineX = (canvas.width - lineWidth) / 2;
  
  ctx.beginPath();
  ctx.moveTo(lineX, lineY);
  ctx.lineTo(lineX + lineWidth, lineY);
  ctx.stroke();
  
  ctx.restore();
};
