import { useState, useCallback, useEffect } from 'react';

const CACHE_NAME = 'photograph-cache-v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB em bytes
const MAX_CACHE_ITEMS = 200; // máximo de imagens em cache

/**
 * Hook para gerenciar cache de imagens usando Cache API
 */
export const useImageCache = () => {
  const [cacheSize, setCacheSize] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);

  // Verifica tamanho do cache
  const estimateCacheSize = useCallback(async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      setCacheSize(totalSize);
      setCacheCount(keys.length);
      
      return { size: totalSize, count: keys.length };
    } catch (error) {
      console.error('Error estimating cache size:', error);
      return { size: 0, count: 0 };
    }
  }, []);

  // Remove imagens antigas quando o cache fica grande
  const trimCache = useCallback(async (targetSize = MAX_CACHE_SIZE) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      // Ordenar por timestamp (LRU)
      const itemsWithTime = await Promise.all(
        keys.map(async (key) => {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.blob();
            return {
              key,
              url: key.url,
              size: blob.size,
            };
          }
          return null;
        })
      );
      
      const validItems = itemsWithTime.filter(Boolean);
      
      // Se excedeu o limite, remover as mais antigas
      let currentSize = 0;
      const toKeep = [];
      const toDelete = [];
      
      for (const item of validItems) {
        currentSize += item.size;
        if (currentSize <= targetSize) {
          toKeep.push(item);
        } else {
          toDelete.push(item);
        }
      }
      
      // Deletar itens excedentes
      for (const item of toDelete) {
        await cache.delete(item.key);
      }
      
      console.log(`🗑️ Cache trimmed: kept ${toKeep.length}, deleted ${toDelete.length}`);
      await estimateCacheSize();
      
    } catch (error) {
      console.error('Error trimming cache:', error);
    }
  }, [estimateCacheSize]);

  // Busca imagem do cache primeiro
  const getCachedImage = useCallback(async (url) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        console.log('✅ Image loaded from cache:', url);
        return cachedResponse.blob();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached image:', error);
      return null;
    }
  }, []);

  // Adiciona imagem ao cache
  const cacheImage = useCallback(async (url) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Verificar se já existe
      const existing = await cache.match(url);
      if (existing) {
        return;
      }
      
      // Buscar e cachear
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
        console.log('💾 Image cached:', url);
        
        // Verificar tamanho do cache
        const { size } = await estimateCacheSize();
        if (size > MAX_CACHE_SIZE) {
          console.log('⚠️ Cache exceeded limit, trimming...');
          await trimCache();
        }
      }
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }, [estimateCacheSize, trimCache]);

  // Limpa todo o cache
  const clearCache = useCallback(async () => {
    try {
      const deleted = await caches.delete(CACHE_NAME);
      if (deleted) {
        console.log('🗑️ Cache cleared');
        setCacheSize(0);
        setCacheCount(0);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  // Formata tamanho em MB
  const formatCacheSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }, []);

  // Carrega e cacheia imagem
  const loadImage = useCallback(async (url) => {
    // Primeiro tenta do cache
    const cached = await getCachedImage(url);
    if (cached) {
      return URL.createObjectURL(cached);
    }
    
    // Se não tem no cache, cacheia em background
    cacheImage(url);
    
    // Retorna URL original
    return url;
  }, [getCachedImage, cacheImage]);

  // Inicializa monitoramento
  useEffect(() => {
    estimateCacheSize();
    
    // Atualiza tamanho do cache a cada 10 segundos
    const interval = setInterval(estimateCacheSize, 10000);
    
    return () => clearInterval(interval);
  }, [estimateCacheSize]);

  return {
    loadImage,
    cacheImage,
    clearCache,
    cacheSize,
    cacheCount,
    formatCacheSize,
    estimateCacheSize,
    maxCacheSize: MAX_CACHE_SIZE,
    maxCacheItems: MAX_CACHE_ITEMS,
  };
};

