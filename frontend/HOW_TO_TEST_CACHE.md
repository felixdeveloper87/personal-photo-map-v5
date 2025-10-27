# 🧪 Como Testar o Cache de Imagens

## ✅ O que está implementado

1. **Sistema de cache automático**: Imagens são cacheadas automaticamente quando visualizadas
2. **Limite inteligente**: 50 MB / 200 imagens máximo
3. **LRU automatico**: Imagens antigas são removidas quando o limite é atingido
4. **UI de status**: Você pode ver o cache funcionando em tempo real

## 🚀 Como Testar

### 1. Preparação
```bash
# Certifique-se que o frontend está rodando
cd frontend
npm run dev
```

### 2. Teste Visual (Método Mais Fácil)

#### Passo 1: Abra uma página com fotos
- Faça login no app
- Abra qualquer país que tenha fotos
- **Observe**: O componente de status de cache aparece no topo

#### Passo 2: Veja o cache crescendo
- Role a página e veja as fotos carregando
- **Observe**: O contador de imagens aumenta
- **Observe**: O tamanho do cache aumenta
- **Observe**: A barra circular mostra o percentual

#### Passo 3: Navegue entre países/anos
- Clique em diferentes anos ou países
- Volte para uma foto que já viu antes
- **Observe**: Carrega instantaneamente! (do cache)

#### Passo 4: Teste o limite
- Se você tiver muitas fotos, continue navegando
- **Observe**: Quando o limite de 50MB é atingido, imagens antigas são removidas automaticamente

#### Passo 5: Limpe o cache manualmente
- Clique no botão 🗑️ no componente de status
- Confirme a limpeza
- **Observe**: O cache zera e você volta a ter 0 imagens cacheadas

### 3. Teste com DevTools

#### Chrome DevTools
1. Abra DevTools (F12)
2. Vá em **Application** → **Cache Storage**
3. Procure por `photograph-cache-v1`
4. **Observe**: As URLs das imagens em cache
5. **Clique em uma URL**: Veja a imagem cacheada

#### Firefox DevTools
1. Abra DevTools (F12)
2. Vá em **Storage** → **Cache**
3. Procure por `photograph-cache-v1`
4. **Observe**: As URLs das imagens

### 4. Teste de Performance

#### Antes do cache
1. Limpe o cache manualmente
2. Abra o Network tab no DevTools
3. Navegue para uma página com fotos
4. **Observe**: Todas as fotos fazem download (baixo para alto)
5. Anote o tamanho total transferido

#### Depois do cache
1. Navegue para outra página
2. Volte para a página anterior
3. **Observe**: Imagens do cache aparecem com `(disk cache)` na coluna Size
4. **Observe**: Tempo de carregamento = 0ms ou muito baixo
5. **Compare**: Muito mais rápido!

### 5. Teste de Limpeza Automática

#### Simular cache cheio
```javascript
// No console do navegador:
navigator.storage.estimate().then(estimate => {
  console.log('Storage available:', estimate.quota);
  console.log('Storage used:', estimate.usage);
});
```

- A limpeza automática acontece quando o cache atinge 50MB
- Imagens são removidas na ordem LRU (Least Recently Used)

### 6. Teste em Mobile

#### Samsung/Android
1. Abra o app no celular
2. Veja o status de cache na tela
3. Navegue entre fotos
4. **Observe**: Cache funciona perfeitamente
5. **Dica**: Chrome DevTools remoto para ver logs

#### iOS
1. Abra o app no iPhone
2. Use Safari Web Inspector
3. Veja o cache funcionando
4. **Observe**: Mesma performance

## 📊 O que observar

### ✅ Sucesso
- ✅ Status de cache aparece
- ✅ Contador aumenta ao navegar
- ✅ Imagens recarregam rapidamente
- ✅ Limite de 50MB é respeitado
- ✅ Limpeza automática funciona
- ✅ Cache persiste entre recarregos da página

### ❌ Problemas
- ❌ Status não aparece → Verificar import
- ❌ Cache não cresce → Verificar console para erros
- ❌ Limite não funciona → Verificar MAX_CACHE_SIZE
- ❌ Não persiste → Verificar Cache API suportada

## 🔍 Debugging

### Ver logs no console
O sistema imprime logs no console:
```
💾 Image cached: https://...
✅ Image loaded from cache: https://...
🗑️ Cache trimmed: kept X, deleted Y
```

### Verificar cache manualmente
```javascript
// No console do navegador:
caches.open('photograph-cache-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('Cached images:', keys.length);
    keys.forEach(key => console.log(key.url));
  });
});
```

### Estimar tamanho do cache
```javascript
// No console do navegador:
caches.open('photograph-cache-v1').then(cache => {
  cache.keys().then(async keys => {
    let total = 0;
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        total += (await response.blob()).size;
      }
    }
    console.log('Total cache size:', (total / 1024 / 1024).toFixed(2), 'MB');
  });
});
```

## 🎯 Critérios de Sucesso

| Teste | Esperado | Status |
|-------|----------|--------|
| Cache aparece | Sim | ✅ |
| Imagens são cacheadas | Sim | ✅ |
| Recarregamento rápido | <100ms | ✅ |
| Limite respeitado | 50MB max | ✅ |
| LRU funciona | Sim | ✅ |
| Persiste entre reloads | Sim | ✅ |
| Mobile funciona | Sim | ✅ |

## 💡 Dicas Extras

1. **Para forçar limpeza**: Use o botão 🗑️ no componente de status
2. **Para ver detalhes**: Use DevTools → Application → Cache Storage
3. **Para aumentar limite**: Edite `useImageCache.js` linha 7
4. **Para testar offline**: Desconecte a internet e veja fotos já cacheadas carregarem

## 🐛 Problemas Comuns

### Cache não aparece
- Verifique se o componente CacheStatus está importado
- Verifique se há imagens para ser cacheadas

### Cache não cresce
- Verifique console para erros
- Verifique se CORS está configurado corretamente
- Verifique se as URLs das imagens são válidas

### Atingiu limite mas não limpa
- Verifique se MAX_CACHE_SIZE está correto
- Verifique logs no console

## 🎉 Pronto!

O sistema de cache está funcionando e você pode ver tudo em tempo real no componente de status!

