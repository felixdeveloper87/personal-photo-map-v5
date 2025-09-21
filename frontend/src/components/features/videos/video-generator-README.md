# Timeline Video Generator - Arquitetura Refatorada

## 📁 Estrutura de Arquivos

### Antes da Refatoração
```
TimelineVideoGenerator.jsx (1809 linhas) ❌
```

### Depois da Refatoração
```
📂 hooks/video/
├── useVideoGenerator.js          # Hook principal com lógica de geração

📂 services/video/
├── audioProcessor.js             # Processamento de áudio e música

📂 utils/video/
├── transitionEngine.js           # Engine de transições e efeitos
├── videoUtils.js                 # Utilitários de vídeo e FFmpeg

📂 components/features/
├── TimelineVideoGeneratorRefactored.jsx  # Componente principal (limpo)
├── VideoSettings.jsx             # Componente de configurações
└── TimelineVideoGenerator.jsx    # Original (manter como backup)
```

## 🔧 Separação por Responsabilidade

### 🎬 **hooks/video/useVideoGenerator.js**
**Responsabilidade:** Lógica principal de geração de vídeo
- State management (progress, URLs, flags)
- MediaRecorder setup e controle
- Loop de processamento de imagens
- Coordenação entre módulos
- Callbacks de eventos

### 🎵 **services/video/audioProcessor.js**
**Responsabilidade:** Processamento de áudio
- Geração de música preset usando Web Audio API
- Processamento de arquivos de áudio carregados
- Configuração de streams de áudio para MediaRecorder
- Ajuste de volume e duração

### 🎭 **utils/video/transitionEngine.js**
**Responsabilidade:** Transições e efeitos visuais
- Todas as transições (fade, slide, zoom, kenBurns, etc.)
- Lógica de seleção dinâmica de transições
- Efeitos de partículas
- Cálculos de dimensões de imagem

### 🛠️ **utils/video/videoUtils.js**
**Responsabilidade:** Utilitários de vídeo
- Carregamento de imagens
- Configuração do MediaRecorder
- Conversão FFmpeg (WebM → MP4)
- Overlay de texto
- Download de arquivos

### ⚙️ **components/features/VideoSettings.jsx**
**Responsabilidade:** Interface de configurações
- Formulário de configurações
- Controles de áudio
- Validação de entrada
- UI responsiva

### 🎬 **components/features/TimelineVideoGeneratorRefactored.jsx**
**Responsabilidade:** Componente principal (limpo)
- Interface do usuário
- Coordenação entre configurações e geração
- Estado da aplicação
- Renderização de progresso e resultados

## 📊 Benefícios da Refatoração

### ✅ **Manutenibilidade**
- Cada arquivo tem responsabilidade única
- Código organizado e legível
- Facilita debugging e testes

### ✅ **Reutilização**
- Hooks e utilitários podem ser reutilizados
- Componentes modulares
- Services independentes

### ✅ **Escalabilidade**
- Fácil adicionar novas transições
- Fácil adicionar novos formatos de export
- Fácil adicionar novos tipos de áudio

### ✅ **Performance**
- Imports mais eficientes
- Code splitting melhorado
- Bundle size otimizado

## 🔄 Como Migrar

### Para usar a versão refatorada:

1. **Substituir import:**
```jsx
// Antes
import TimelineVideoGenerator from './TimelineVideoGenerator';

// Depois
import TimelineVideoGenerator from './TimelineVideoGeneratorRefactored';
```

2. **API permanece a mesma:**
```jsx
<TimelineVideoGenerator 
  images={images} 
  onClose={onClose} 
/>
```

### Para adicionar novas transições:

1. **Adicionar em `transitionEngine.js`:**
```js
const drawMyNewTransition = (ctx, img, canvas, progress) => {
  // Implementar nova transição
};

// Adicionar no switch case de drawImageWithTransition
```

2. **Adicionar em `VideoSettings.jsx`:**
```jsx
<option value="myNewTransition">🆕 My New Transition</option>
```

### Para adicionar novos formatos de export:

1. **Adicionar em `videoUtils.js`:**
```js
export const convertToNewFormat = async (blob) => {
  // Implementar conversão
};
```

2. **Usar no hook `useVideoGenerator.js`**

## 🧪 Testes Recomendados

1. **Testes unitários** para cada utilitário
2. **Testes de integração** para o hook principal
3. **Testes de UI** para componentes
4. **Testes de performance** para geração de vídeo

## 📝 Próximos Passos

1. ✅ Refatoração concluída
2. 🔄 Migração gradual (manter original como backup)
3. 🧪 Implementar testes
4. 📚 Documentar APIs individuais
5. 🚀 Deploy e monitoramento
