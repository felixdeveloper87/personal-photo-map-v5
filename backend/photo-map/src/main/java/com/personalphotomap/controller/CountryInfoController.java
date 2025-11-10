package com.personalphotomap.controller;

import com.personalphotomap.model.CountryInfo;
import com.personalphotomap.service.CountryInfoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller responsible for handling country information operations.
 * 
 * Provides endpoints to:
 * - Retrieve cached country information (basic, economic, social data)
 * - Manage cache (evict specific entries)
 * 
 * All endpoints are publicly accessible as country information is not sensitive.
 */
@RestController
@RequestMapping("/api/countries")
public class CountryInfoController {
    
    private final CountryInfoService countryInfoService;
    
    public CountryInfoController(CountryInfoService countryInfoService) {
        this.countryInfoService = countryInfoService;
    }
    
    /**
     * Gets complete country information including basic info, economic and social data.
     * Uses cache when available, fetches from external APIs if cache is expired or missing.
     * Note: Translation is now handled in the frontend. This endpoint always returns English text.
     * 
     * @param countryId ISO2 country code (e.g., "US", "BR")
     * @param lang Language parameter (ignored - kept for backward compatibility, translation done in frontend)
     * @return ResponseEntity with CountryInfo object (curiosities always in English)
     */
    @GetMapping("/{countryId}/info")
    public ResponseEntity<?> getCountryInfo(
            @PathVariable String countryId,
            @RequestParam(required = false, defaultValue = "en") String lang) {
        try {
            if (countryId == null || countryId.length() != 2) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid country ID. Must be a 2-character ISO2 code."));
            }
            
            // Language parameter is ignored - translation is done in frontend
            // Always return English text
            CountryInfo info = countryInfoService.getCountryInfo(countryId, "en");
            
            if (info == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Country information not found for: " + countryId));
            }
            
            return ResponseEntity.ok(info);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch country information: " + e.getMessage()));
        }
    }
    
    /**
     * Gets only basic country information (capital, language, currency, coordinates).
     * Faster endpoint when only basic info is needed.
     * Returns the same CountryInfo object, but frontend can use only the basic fields.
     * 
     * @param countryId ISO2 country code
     * @return ResponseEntity with CountryInfo object (timestamps are hidden via @JsonIgnore)
     */
    @GetMapping("/{countryId}/info/basic")
    public ResponseEntity<?> getBasicCountryInfo(@PathVariable String countryId) {
        try {
            if (countryId == null || countryId.length() != 2) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid country ID. Must be a 2-character ISO2 code."));
            }
            
            CountryInfo info = countryInfoService.getCountryInfo(countryId);
            
            if (info == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Country information not found for: " + countryId));
            }
            
            // Retorna a entidade diretamente - campos de cache são ocultados via @JsonIgnore
            return ResponseEntity.ok(info);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch basic country information: " + e.getMessage()));
        }
    }
    
    /**
     * Evicts cache for a specific country.
     * Forces fresh data to be fetched on next request.
     * 
     * @param countryId ISO2 country code
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/{countryId}/cache")
    public ResponseEntity<?> evictCache(@PathVariable String countryId) {
        try {
            if (countryId == null || countryId.length() != 2) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid country ID. Must be a 2-character ISO2 code."));
            }
            
            countryInfoService.evictCache(countryId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Cache evicted successfully for country: " + countryId,
                "countryId", countryId
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to evict cache: " + e.getMessage()));
        }
    }
    
    /**
     * Clears only the curiosities for a specific country.
     * This will force regeneration of curiosities with the new prompt format on next request.
     * Other cached data (basic info, economic data, etc.) is preserved.
     * 
     * @param countryId ISO2 country code
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/{countryId}/curiosities")
    public ResponseEntity<?> clearCuriosities(@PathVariable String countryId) {
        try {
            if (countryId == null || countryId.length() != 2) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid country ID. Must be a 2-character ISO2 code."));
            }
            
            countryInfoService.clearCuriosities(countryId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Curiosities cleared successfully for country: " + countryId + ". They will be regenerated on next request.",
                "countryId", countryId
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to clear curiosities: " + e.getMessage()));
        }
    }
    
    /**
     * Clears curiosities for all countries.
     * This will force regeneration of all curiosities with the new prompt format.
     * 
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/curiosities/all")
    public ResponseEntity<?> clearAllCuriosities() {
        try {
            countryInfoService.clearAllCuriosities();
            
            return ResponseEntity.ok(Map.of(
                "message", "All curiosities cleared successfully. They will be regenerated on next request for each country."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to clear all curiosities: " + e.getMessage()));
        }
    }
    
    /**
     * Clears all Caffeine in-memory cache.
     * This does not delete data from the database, only clears the in-memory cache.
     * 
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/cache/caffeine/all")
    public ResponseEntity<?> clearAllCaffeineCache() {
        try {
            countryInfoService.clearAllCaffeineCache();
            
            return ResponseEntity.ok(Map.of(
                "message", "All Caffeine cache cleared successfully."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to clear Caffeine cache: " + e.getMessage()));
        }
    }
    
    /**
     * Gets information about the Caffeine cache including statistics and list of cached countries.
     * 
     * @return ResponseEntity with cache information
     */
    @GetMapping("/cache/caffeine/info")
    public ResponseEntity<?> getCaffeineCacheInfo() {
        try {
            Map<String, Object> cacheInfo = countryInfoService.getCaffeineCacheInfo();
            return ResponseEntity.ok(cacheInfo);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get cache info: " + e.getMessage()));
        }
    }
}