# 🚩 Sistema de Normalização de Bandeiras

Este sistema resolve automaticamente problemas comuns com bandeiras de diferentes APIs, garantindo consistência visual e melhor experiência do usuário.

## ✨ Características Principais

### 1. **Opacidade 0.7 por padrão**
- Todas as bandeiras são exibidas com 70% de opacidade
- Hover aumenta para 90% de opacidade
- Transições suaves entre estados

### 2. **Normalização Automática de Códigos**
- Corrige códigos incorretos automaticamente (ex: `UK` → `GB`)
- Suporta mais de 200 códigos de país
- Mapeamento inteligente para ISO 3166-1 alpha-2

### 3. **Múltiplas Fontes de Bandeiras**
- **FlagCDN** - Alta qualidade (2560x1280, 512x384, 256x192)
- **RestCountries API** - Dados oficiais com múltiplos formatos
- **Fallbacks automáticos** - Se uma fonte falha, tenta outras

### 4. **Cache Inteligente**
- Bandeiras são armazenadas por 24 horas
- Reduz requisições desnecessárias
- Estatísticas de uso disponíveis

## 🚀 Como Usar

### Importação Básica
```jsx
import { getCachedFlag, normalizeCountryCode } from '../utils/flagNormalizer';
```

### Uso Simples
```jsx
// Normalizar código de país
const correctCode = normalizeCountryCode('UK'); // Retorna 'GB'

// Obter bandeira com cache
const flagUrl = await getCachedFlag('USA', {
  preferFormat: 'png',
  maxRetries: 3,
  timeout: 5000
});
```

### No Componente EnhancedFlag
```jsx
const EnhancedFlag = ({ countryCode }) => {
  const [flagError, setFlagError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(null);
  
  const correctedCode = normalizeCountryCode(countryCode);
  
  const handleFlagError = async () => {
    const altFlag = await getCachedFlag(countryCode, {
      preferFormat: 'png',
      maxRetries: 3
    });
    
    if (altFlag) {
      setFallbackImage(altFlag);
    }
  };
  
  // ... resto do componente
};
```

## ⚙️ Opções de Configuração

### getCachedFlag(options)
```jsx
const options = {
  preferFormat: 'png',        // Formato preferido: 'png', 'svg', 'jpg'
  maxRetries: 3,             // Máximo de tentativas
  timeout: 5000,             // Timeout em ms
  fallbackToLowerQuality: true // Usar qualidade menor se necessário
};
```

### generateFlagFallback(options)
```jsx
const fallbackData = generateFlagFallback('UK', {
  size: 'medium',            // 'small', 'medium', 'large'
  theme: 'light',            // 'light', 'dark'
  showCode: true,            // Mostrar código do país
  showText: true             // Mostrar texto explicativo
});
```

## 🔧 Funções Disponíveis

### Core Functions
- `normalizeCountryCode(code)` - Normaliza código de país
- `getFlagFromMultipleSources(code, options)` - Busca em múltiplas fontes
- `getCachedFlag(code, options)` - Busca com cache

### Utility Functions
- `validateFlagUrl(url, timeout)` - Valida se URL é acessível
- `generateFlagFallback(code, options)` - Gera fallback visual
- `clearFlagCache()` - Limpa cache
- `getFlagCacheStats()` - Estatísticas do cache

## 📱 Responsividade

O sistema funciona perfeitamente em todos os dispositivos:
- **Desktop**: Bandeiras em alta resolução
- **Tablet**: Resolução média otimizada
- **Mobile**: Resolução menor para performance

## 🎨 Estilos CSS

### Classes Principais
```css
.flag-container-with-border {
  /* Container com borda e fundo sutil */
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
}

.enhanced-flag {
  /* Bandeira com opacidade 0.7 */
  opacity: 0.7;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.flag-loading-overlay {
  /* Overlay de loading */
  background: rgba(0, 0, 0, 0.6);
  animation: pulse 1.5s ease-in-out infinite;
}
```

### Hover Effects
```css
.flag-container-with-border .enhanced-flag:hover {
  opacity: 0.9 !important;
  transform: scale(1.02);
}
```

## 🧪 Testando o Sistema

Use o componente `FlagDemo` para testar diferentes códigos:

```jsx
import FlagDemo from './components/FlagDemo';

// No seu app
<FlagDemo />
```

### Códigos de Teste
- `UK` → `GB` (Reino Unido)
- `USA` → `US` (Estados Unidos)
- `RUS` → `RU` (Rússia)
- `BRA` → `BR` (Brasil)
- `CHN` → `CN` (China)

## 🔍 Debug e Monitoramento

### Console Logs
```javascript
// Ativar logs de debug
console.debug('Flag source FlagCDN-High failed for US: Network error');

// Estatísticas do cache
const stats = getFlagCacheStats();
console.log('Cache size:', stats.size);
```

### Performance
- **Cache hit rate**: Monitora eficiência do cache
- **Fallback usage**: Quantas vezes o sistema usou fallbacks
- **Response times**: Tempo médio de resposta das APIs

## 🚨 Tratamento de Erros

### Cenários de Fallback
1. **Código incorreto** → Normalização automática
2. **API indisponível** → Tentativa em outras fontes
3. **Formato não suportado** → Conversão automática
4. **Timeout** → Retry com delay exponencial
5. **Sem internet** → Fallback visual com código do país

### Mensagens de Erro
```javascript
try {
  const flag = await getCachedFlag('INVALID');
} catch (error) {
  console.error('Flag error:', error.message);
  // Mostra fallback visual
}
```

## 🔄 Atualizações e Manutenção

### Adicionar Novos Códigos
```javascript
// Em flagNormalizer.js
const COUNTRY_CODE_CORRECTIONS = {
  // ... códigos existentes
  NEW_CODE: 'ISO_CODE',  // Adicione aqui
};
```

### Adicionar Novas Fontes
```javascript
const FLAG_SOURCES = [
  // ... fontes existentes
  {
    name: 'NovaFonte',
    url: (code) => `https://api.nova.com/flags/${code}.png`,
    check: 'HEAD',
    priority: 6
  }
];
```

## 📊 Métricas e Analytics

### Coletar Dados de Uso
```javascript
// Monitorar sucesso das fontes
const flagUrl = await getCachedFlag('US');
if (flagUrl) {
  // Log de sucesso
  analytics.track('flag_loaded', { 
    country: 'US', 
    source: 'FlagCDN-High' 
  });
}
```

### Cache Performance
```javascript
const stats = getFlagCacheStats();
const hitRate = stats.size / totalRequests;
console.log(`Cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
```

## 🌟 Benefícios

1. **Consistência Visual**: Todas as bandeiras têm aparência uniforme
2. **Performance**: Cache reduz tempo de carregamento
3. **Confiabilidade**: Múltiplas fontes garantem disponibilidade
4. **Manutenibilidade**: Código centralizado e reutilizável
5. **UX**: Fallbacks visuais quando bandeiras não estão disponíveis

## 🤝 Contribuindo

Para melhorar o sistema:

1. **Adicione novos códigos** de país em `COUNTRY_CODE_CORRECTIONS`
2. **Teste novas fontes** de bandeiras
3. **Otimize o cache** com estratégias mais avançadas
4. **Adicione testes** para garantir qualidade

---

**Desenvolvido para resolver problemas reais de inconsistência de bandeiras em aplicações web internacionais.** 🚀

