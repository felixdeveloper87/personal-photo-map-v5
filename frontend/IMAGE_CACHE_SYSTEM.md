# Sistema de Cache de Imagens

## 📊 Tamanho e Limitações

### Limites de Cache
- **Tamanho máximo**: 50 MB
- **Quantidade máxima**: 200 imagens
- **Limite do navegador**: O navegador limita automaticamente quando o disco está cheio

### Como Funciona

1. **Cache Inteligente**: Imagens são salvas no Cache API do navegador
2. **LRU (Least Recently Used)**: Imagens antigas são removidas automaticamente quando o limite é atingido
3. **Monitoramento**: O sistema monitora continuamente o tamanho do cache
4. **Limpeza Automática**: Quando o limite de 50MB é atingido, as imagens menos usadas são deletadas

## 🎯 Capacidade

### Com 50 MB de cache:
- **Fotos pequenas (200KB)**: ~250 fotos
- **Fotos médias (500KB)**: ~100 fotos  
- **Fotos grandes (1MB)**: ~50 fotos
- **Média (666KB)**: ~75 fotos

### Por que 50 MB?

- ✅ **Bom para dispositivos móveis**: Não consome muito espaço
- ✅ **Performance**: Cache suficiente para navegação rápida
- ✅ **Compatibilidade**: Funciona em dispositivos com pouco espaço
- ⚠️ **Limite flexível**: Pode ser ajustado facilmente se necessário

## 🔧 Como Aumentar/Diminuir o Cache

Para alterar o limite, edite `frontend/src/hooks/useImageCache.js`:

```javascript
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB (ajuste aqui)
const MAX_CACHE_ITEMS = 200; // máximo de imagens
```

### Recomendações:
- **Dispositivos móveis**: 30-50 MB
- **Tablets**: 50-100 MB
- **Desktop**: 100-200 MB

## 📱 Onde Aparece?

O status do cache pode ser adicionado em qualquer lugar do app:

```jsx
import CacheStatus from './components/ui/CacheStatus';

// No seu componente
<CacheStatus />
```

Mostra:
- Quantas imagens estão em cache
- Tamanho usado / Limite
- Percentual usado
- Botão para limpar cache

## 🚀 Benefícios

1. **Carregamento Rápido**: Imagens visualizadas antes carregam instantaneamente
2. **Economia de Dados**: Reduz consumo de internet
3. **Melhor UX**: Transições mais suaves
4. **Offline Ready**: Imagens podem ser vistas offline se já foram cacheadas

## 🛠️ Tecnologias Usadas

- **Cache API**: Armazenamento nativo do navegador
- **LRU Algorithm**: Remove automaticamente imagens antigas
- **Background Caching**: Não bloqueia a UI

## 💡 Dicas de Otimização

1. **Imagens grandes**: Considere resize no backend
2. **Lazy loading**: Já implementado no PhotoGallery
3. **Formato WebP**: Reduz tamanho em até 30%
4. **Limpeza periódica**: O usuário pode limpar manualmente

## ⚠️ Limitações

### Navegadores
- Chrome/Edge: Sem limite (usa até 50% do disco)
- Firefox: ~1GB por site
- Safari iOS: ~50 MB total (compartilhado entre sites)

### Dispositivos Android
- Depende do espaço disponível
- Sistema pode limpar cache quando necessário

### Evite
- Cachear vídeos (muito grandes)
- Muitas imagens de alta resolução simultaneamente
- Cache em produção muito maior que 200MB (pode causar problemas)

## 🎨 UI Component

O componente `CacheStatus` mostra:
- 🔵 **Verde**: < 50% usado
- 🟡 **Amarelo**: 50-80% usado  
- 🔴 **Vermelho**: > 80% usado
- 🗑️ **Botão limpar**: Permite limpar manualmente

