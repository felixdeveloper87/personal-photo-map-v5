package com.personalphotomap.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for the application.
 * Configures Caffeine cache for in-memory caching of country information.
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * Configures the cache manager for country information.
     * Uses Caffeine as the cache implementation with the following settings:
     * - Maximum 200 entries (countries)
     * - Expires after 24 hours of write
     * - Records statistics for monitoring
     * 
     * @return CacheManager instance configured for country info caching
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("countryInfo");
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(200) // Máximo 200 países em cache
            .expireAfterWrite(24, TimeUnit.HOURS) // Expira após 24h sem acesso
            .recordStats()); // Para monitoramento
        return cacheManager;
    }
}