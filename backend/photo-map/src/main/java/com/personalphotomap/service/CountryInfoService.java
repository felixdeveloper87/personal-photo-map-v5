package com.personalphotomap.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalphotomap.model.CountryInfo;
import com.personalphotomap.repository.CountryInfoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.caffeine.CaffeineCache;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service responsible for managing country information caching.
 * Fetches data from external APIs (RestCountries, World Bank) and caches it
 * with different expiration times for different data types.
 */
@Service
@EnableScheduling
public class CountryInfoService {
    
    private static final Logger logger = LoggerFactory.getLogger(CountryInfoService.class);
    
    private final CountryInfoRepository repository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final CountryCuriositiesService curiositiesService;
    private final CacheManager cacheManager;
    
    // Tempos de cache (em horas)
    private static final int BASIC_INFO_CACHE_HOURS = 24 * 30; // 30 dias (capital, idioma mudam raramente)
    private static final int ECONOMIC_DATA_CACHE_HOURS = 24 * 7; // 7 dias (dados econômicos atualizam mensalmente)
    private static final int SOCIAL_DATA_CACHE_HOURS = 24 * 7; // 7 dias
    private static final int COORDINATES_CACHE_HOURS = 24 * 365; // 1 ano (coordenadas nunca mudam)
    
    // Mapeamento de HDI por país (ISO2) - dados do UNDP Human Development Report 2021/2022
    // Valores são de 0.0 a 1.0 - Lista completa de todos os países com dados disponíveis
    private static final Map<String, Double> HDI_DATA = new HashMap<>();
    
    static {
        // Inicializar o mapa com todos os países e seus valores de HDI
        // Dados baseados no UNDP Human Development Report 2021/2022
        
        // Países com HDI muito alto (>= 0.800)
        HDI_DATA.put("CH", 0.962); HDI_DATA.put("NO", 0.961); HDI_DATA.put("IS", 0.959); HDI_DATA.put("HK", 0.952);
        HDI_DATA.put("DK", 0.948); HDI_DATA.put("SE", 0.947); HDI_DATA.put("IE", 0.945); HDI_DATA.put("DE", 0.942);
        HDI_DATA.put("AU", 0.951); HDI_DATA.put("NL", 0.941); HDI_DATA.put("FI", 0.940); HDI_DATA.put("SG", 0.939);
        HDI_DATA.put("BE", 0.937); HDI_DATA.put("NZ", 0.937); HDI_DATA.put("CA", 0.936); HDI_DATA.put("LI", 0.935);
        HDI_DATA.put("LU", 0.930); HDI_DATA.put("GB", 0.929); HDI_DATA.put("JP", 0.925); HDI_DATA.put("KR", 0.925);
        HDI_DATA.put("US", 0.921); HDI_DATA.put("IL", 0.919); HDI_DATA.put("MT", 0.918); HDI_DATA.put("EE", 0.890);
        HDI_DATA.put("ES", 0.905); HDI_DATA.put("FR", 0.903); HDI_DATA.put("CY", 0.896); HDI_DATA.put("IT", 0.895);
        HDI_DATA.put("SI", 0.918); HDI_DATA.put("CZ", 0.889); HDI_DATA.put("GR", 0.887); HDI_DATA.put("PL", 0.876);
        HDI_DATA.put("LT", 0.875); HDI_DATA.put("PT", 0.866); HDI_DATA.put("SK", 0.848); HDI_DATA.put("HR", 0.858);
        HDI_DATA.put("HU", 0.846); HDI_DATA.put("RU", 0.822); HDI_DATA.put("RO", 0.821); HDI_DATA.put("BG", 0.816);
        HDI_DATA.put("TR", 0.838); HDI_DATA.put("AE", 0.911); HDI_DATA.put("SA", 0.875); HDI_DATA.put("QA", 0.855);
        HDI_DATA.put("BH", 0.875); HDI_DATA.put("KW", 0.831); HDI_DATA.put("OM", 0.816); HDI_DATA.put("KZ", 0.811);
        HDI_DATA.put("BY", 0.808); HDI_DATA.put("UY", 0.809); HDI_DATA.put("CR", 0.809); HDI_DATA.put("PA", 0.805);
        HDI_DATA.put("MY", 0.803); HDI_DATA.put("TH", 0.800); HDI_DATA.put("AT", 0.916); HDI_DATA.put("LV", 0.863);
        HDI_DATA.put("MC", 0.855); HDI_DATA.put("AD", 0.858); HDI_DATA.put("SM", 0.853); HDI_DATA.put("VA", 0.850);
        HDI_DATA.put("TW", 0.926); HDI_DATA.put("MO", 0.922); HDI_DATA.put("BS", 0.812); HDI_DATA.put("TT", 0.810);
        HDI_DATA.put("BN", 0.829); HDI_DATA.put("ME", 0.832); HDI_DATA.put("RS", 0.802); HDI_DATA.put("GE", 0.802);
        HDI_DATA.put("MU", 0.802); HDI_DATA.put("PR", 0.845); HDI_DATA.put("AG", 0.788); HDI_DATA.put("BB", 0.790);
        HDI_DATA.put("GD", 0.795); HDI_DATA.put("AL", 0.796); HDI_DATA.put("NC", 0.900); HDI_DATA.put("PF", 0.861);
        HDI_DATA.put("FK", 0.874); HDI_DATA.put("IM", 0.849); HDI_DATA.put("JE", 0.850); HDI_DATA.put("GG", 0.850);
        
        // Países com HDI alto (0.700 - 0.799)
        HDI_DATA.put("BR", 0.754); HDI_DATA.put("MX", 0.758); HDI_DATA.put("AR", 0.842); HDI_DATA.put("CL", 0.855);
        HDI_DATA.put("CO", 0.752); HDI_DATA.put("PE", 0.762); HDI_DATA.put("VE", 0.691); HDI_DATA.put("EC", 0.740);
        HDI_DATA.put("CN", 0.788); HDI_DATA.put("ID", 0.713); HDI_DATA.put("VN", 0.703); HDI_DATA.put("PH", 0.699);
        HDI_DATA.put("ZA", 0.713); HDI_DATA.put("EG", 0.731); HDI_DATA.put("DZ", 0.745); HDI_DATA.put("UA", 0.773);
        HDI_DATA.put("BA", 0.780); HDI_DATA.put("MK", 0.770); HDI_DATA.put("AM", 0.759); HDI_DATA.put("AZ", 0.745);
        HDI_DATA.put("LB", 0.706); HDI_DATA.put("JO", 0.720); HDI_DATA.put("IR", 0.774); HDI_DATA.put("IQ", 0.686);
        HDI_DATA.put("MA", 0.683); HDI_DATA.put("TN", 0.731); HDI_DATA.put("LY", 0.718); HDI_DATA.put("BO", 0.692);
        HDI_DATA.put("PY", 0.717); HDI_DATA.put("GT", 0.627); HDI_DATA.put("HN", 0.621); HDI_DATA.put("NI", 0.667);
        HDI_DATA.put("SV", 0.675); HDI_DATA.put("DO", 0.767); HDI_DATA.put("JM", 0.709); HDI_DATA.put("CU", 0.764);
        HDI_DATA.put("GY", 0.714); HDI_DATA.put("SR", 0.730); HDI_DATA.put("FJ", 0.730); HDI_DATA.put("WS", 0.707);
        HDI_DATA.put("TO", 0.745); HDI_DATA.put("VU", 0.607); HDI_DATA.put("PG", 0.558); HDI_DATA.put("SB", 0.567);
        HDI_DATA.put("KI", 0.630); HDI_DATA.put("TV", 0.641); HDI_DATA.put("NR", 0.667); HDI_DATA.put("MH", 0.639);
        HDI_DATA.put("FM", 0.628); HDI_DATA.put("PW", 0.767); HDI_DATA.put("BN", 0.829); HDI_DATA.put("MN", 0.739);
        HDI_DATA.put("LA", 0.607); HDI_DATA.put("KH", 0.593); HDI_DATA.put("MM", 0.585); HDI_DATA.put("LK", 0.782);
        HDI_DATA.put("BD", 0.661); HDI_DATA.put("BT", 0.666); HDI_DATA.put("NP", 0.602); HDI_DATA.put("MV", 0.747);
        HDI_DATA.put("AF", 0.478); HDI_DATA.put("PK", 0.540); HDI_DATA.put("TJ", 0.685); HDI_DATA.put("UZ", 0.727);
        HDI_DATA.put("TM", 0.745); HDI_DATA.put("KG", 0.692); HDI_DATA.put("MD", 0.767); HDI_DATA.put("XK", 0.762);
        HDI_DATA.put("BW", 0.693); HDI_DATA.put("NA", 0.615); HDI_DATA.put("ZW", 0.593); HDI_DATA.put("ZM", 0.565);
        HDI_DATA.put("MW", 0.512); HDI_DATA.put("MZ", 0.446); HDI_DATA.put("MG", 0.501); HDI_DATA.put("SC", 0.785);
        HDI_DATA.put("KM", 0.558); HDI_DATA.put("DJ", 0.509); HDI_DATA.put("ET", 0.498); HDI_DATA.put("ER", 0.492);
        HDI_DATA.put("SD", 0.516); HDI_DATA.put("SS", 0.385); HDI_DATA.put("UG", 0.525); HDI_DATA.put("RW", 0.534);
        HDI_DATA.put("BI", 0.426); HDI_DATA.put("TZ", 0.549); HDI_DATA.put("KE", 0.575); HDI_DATA.put("SO", 0.361);
        HDI_DATA.put("GH", 0.632); HDI_DATA.put("TG", 0.539); HDI_DATA.put("BJ", 0.525); HDI_DATA.put("BF", 0.449);
        HDI_DATA.put("ML", 0.410); HDI_DATA.put("NE", 0.400); HDI_DATA.put("NG", 0.535); HDI_DATA.put("TD", 0.394);
        HDI_DATA.put("CF", 0.387); HDI_DATA.put("CM", 0.587); HDI_DATA.put("GQ", 0.596); HDI_DATA.put("GA", 0.706);
        HDI_DATA.put("CG", 0.571); HDI_DATA.put("CD", 0.479); HDI_DATA.put("AO", 0.586); HDI_DATA.put("ST", 0.618);
        HDI_DATA.put("GW", 0.483); HDI_DATA.put("GN", 0.465); HDI_DATA.put("SL", 0.477); HDI_DATA.put("LR", 0.481);
        HDI_DATA.put("CI", 0.550); HDI_DATA.put("SN", 0.511); HDI_DATA.put("GM", 0.500); HDI_DATA.put("MR", 0.556);
        HDI_DATA.put("YE", 0.455); HDI_DATA.put("SY", 0.577); HDI_DATA.put("PS", 0.715); HDI_DATA.put("BZ", 0.683);
        HDI_DATA.put("LC", 0.715); HDI_DATA.put("VC", 0.738); HDI_DATA.put("DM", 0.742); HDI_DATA.put("KN", 0.777);
        HDI_DATA.put("GF", 0.850); HDI_DATA.put("HT", 0.535); HDI_DATA.put("TL", 0.607); HDI_DATA.put("KP", 0.733);
        HDI_DATA.put("IN", 0.633);
    }
    
    // Ano dos dados de HDI (geralmente atualizado anualmente pelo UNDP)
    private static final String HDI_YEAR = "2022";
    
    // Ano dos dados de religião e grupos étnicos (CIA World Factbook)
    private static final String DEMOGRAPHICS_YEAR = "2023";
    
    // Mapeamento de religião por país (JSON format)
    // Dados baseados no CIA World Factbook e censos nacionais
    private static final Map<String, String> RELIGION_DATA = new HashMap<>();
    
    static {
        // Formato: JSON string com distribuição religiosa em percentuais
        RELIGION_DATA.put("US", "{\"Protestant\": 46.5, \"Catholic\": 20.8, \"Mormon\": 1.6, \"Other Christian\": 0.9, \"Jewish\": 1.9, \"Muslim\": 0.9, \"Buddhist\": 0.7, \"Hindu\": 0.7, \"Other\": 1.8, \"None\": 24.2}");
        RELIGION_DATA.put("BR", "{\"Catholic\": 64.6, \"Protestant\": 22.2, \"Spiritist\": 2.2, \"Other\": 3.2, \"None\": 8.0}");
        RELIGION_DATA.put("MX", "{\"Catholic\": 77.7, \"Protestant\": 11.2, \"Other\": 2.9, \"None\": 8.1}");
        RELIGION_DATA.put("AR", "{\"Catholic\": 62.9, \"Protestant\": 15.3, \"Jewish\": 1.0, \"Other\": 2.3, \"None\": 18.9}");
        RELIGION_DATA.put("GB", "{\"Christian\": 59.5, \"Muslim\": 4.4, \"Hindu\": 1.3, \"Sikh\": 0.7, \"Jewish\": 0.5, \"Buddhist\": 0.5, \"Other\": 0.4, \"None\": 32.7}");
        RELIGION_DATA.put("FR", "{\"Catholic\": 47.4, \"Protestant\": 2.3, \"Muslim\": 4.9, \"Jewish\": 0.7, \"Buddhist\": 0.5, \"Other\": 0.5, \"None\": 43.7}");
        RELIGION_DATA.put("DE", "{\"Catholic\": 26.7, \"Protestant\": 24.3, \"Muslim\": 3.7, \"Other\": 1.1, \"None\": 44.2}");
        RELIGION_DATA.put("IT", "{\"Catholic\": 74.4, \"Protestant\": 3.6, \"Muslim\": 3.7, \"Other\": 1.5, \"None\": 16.8}");
        RELIGION_DATA.put("ES", "{\"Catholic\": 58.2, \"Atheist\": 16.8, \"Agnostic\": 10.8, \"Other\": 2.7, \"None\": 11.5}");
        RELIGION_DATA.put("PT", "{\"Catholic\": 80.2, \"Protestant\": 2.1, \"Other\": 0.9, \"None\": 16.8}");
        RELIGION_DATA.put("CA", "{\"Catholic\": 38.7, \"Protestant\": 29.2, \"Other Christian\": 6.3, \"Muslim\": 3.2, \"Hindu\": 1.5, \"Sikh\": 1.4, \"Buddhist\": 1.1, \"Jewish\": 1.0, \"Other\": 0.6, \"None\": 16.0}");
        RELIGION_DATA.put("AU", "{\"Catholic\": 22.6, \"Anglican\": 13.3, \"Other Christian\": 16.3, \"Muslim\": 2.6, \"Buddhist\": 2.4, \"Hindu\": 1.9, \"Sikh\": 0.5, \"Jewish\": 0.4, \"Other\": 0.8, \"None\": 38.9}");
        RELIGION_DATA.put("IN", "{\"Hindu\": 79.8, \"Muslim\": 14.2, \"Christian\": 2.3, \"Sikh\": 1.7, \"Buddhist\": 0.7, \"Jain\": 0.4, \"Other\": 0.9}");
        RELIGION_DATA.put("CN", "{\"Buddhist\": 18.2, \"Christian\": 5.1, \"Muslim\": 1.8, \"Folk religion\": 21.9, \"Hindu\": 0.1, \"Jewish\": 0.1, \"Other\": 0.7, \"None\": 52.1}");
        RELIGION_DATA.put("JP", "{\"Shinto\": 70.4, \"Buddhist\": 69.8, \"Christian\": 1.5, \"Other\": 6.9, \"None\": 7.0}");
        RELIGION_DATA.put("KR", "{\"Protestant\": 19.7, \"Buddhist\": 15.5, \"Catholic\": 7.9, \"Other\": 0.9, \"None\": 56.1}");
        RELIGION_DATA.put("RU", "{\"Russian Orthodox\": 15.2, \"Muslim\": 10.0, \"Other Christian\": 2.0, \"Buddhist\": 0.5, \"Jewish\": 0.1, \"Other\": 0.2, \"None\": 72.0}");
        RELIGION_DATA.put("TR", "{\"Muslim\": 99.8, \"Other\": 0.2}");
        RELIGION_DATA.put("SA", "{\"Muslim\": 99.0, \"Other\": 1.0}");
        RELIGION_DATA.put("EG", "{\"Muslim\": 90.0, \"Christian\": 10.0}");
        RELIGION_DATA.put("IR", "{\"Muslim\": 99.4, \"Other\": 0.6}");
        RELIGION_DATA.put("PK", "{\"Muslim\": 96.4, \"Hindu\": 1.9, \"Christian\": 1.6, \"Other\": 0.1}");
        RELIGION_DATA.put("ID", "{\"Muslim\": 87.2, \"Protestant\": 7.0, \"Catholic\": 2.9, \"Hindu\": 1.7, \"Buddhist\": 0.7, \"Other\": 0.5}");
        RELIGION_DATA.put("PH", "{\"Catholic\": 78.8, \"Muslim\": 6.4, \"Protestant\": 2.8, \"Other Christian\": 4.5, \"Other\": 1.8, \"None\": 5.7}");
        RELIGION_DATA.put("TH", "{\"Buddhist\": 92.5, \"Muslim\": 5.4, \"Christian\": 1.2, \"Other\": 0.9}");
        RELIGION_DATA.put("VN", "{\"Buddhist\": 14.9, \"Catholic\": 7.4, \"Cao Dai\": 1.1, \"Hoa Hao\": 1.5, \"Protestant\": 0.9, \"Muslim\": 0.1, \"None\": 73.7}");
        RELIGION_DATA.put("ZA", "{\"Protestant\": 36.6, \"Catholic\": 7.1, \"Anglican\": 6.8, \"Other Christian\": 36.0, \"Muslim\": 1.5, \"Hindu\": 1.2, \"Other\": 2.3, \"None\": 8.5}");
        RELIGION_DATA.put("NG", "{\"Muslim\": 53.5, \"Protestant\": 35.3, \"Catholic\": 10.6, \"Other\": 0.6}");
        RELIGION_DATA.put("KE", "{\"Protestant\": 47.4, \"Catholic\": 23.3, \"Muslim\": 11.2, \"Other Christian\": 11.8, \"Other\": 1.7, \"None\": 4.6}");
        RELIGION_DATA.put("IL", "{\"Jewish\": 73.5, \"Muslim\": 18.1, \"Christian\": 1.9, \"Druze\": 1.6, \"Other\": 4.9}");
        RELIGION_DATA.put("GR", "{\"Greek Orthodox\": 81.0, \"Muslim\": 1.3, \"Other\": 0.7, \"None\": 17.0}");
        RELIGION_DATA.put("PL", "{\"Catholic\": 85.8, \"Orthodox\": 1.3, \"Protestant\": 0.4, \"Other\": 0.4, \"None\": 12.1}");
        RELIGION_DATA.put("NL", "{\"Catholic\": 20.1, \"Protestant\": 14.8, \"Muslim\": 5.0, \"Other\": 5.9, \"None\": 54.2}");
        RELIGION_DATA.put("BE", "{\"Catholic\": 57.1, \"Protestant\": 2.3, \"Muslim\": 6.8, \"Other\": 2.8, \"None\": 31.0}");
        RELIGION_DATA.put("CH", "{\"Catholic\": 35.2, \"Protestant\": 23.8, \"Muslim\": 5.4, \"Other\": 5.7, \"None\": 29.9}");
        RELIGION_DATA.put("SE", "{\"Lutheran\": 57.6, \"Other Christian\": 8.6, \"Muslim\": 5.0, \"Other\": 1.2, \"None\": 27.6}");
        RELIGION_DATA.put("NO", "{\"Lutheran\": 68.7, \"Other Christian\": 7.9, \"Muslim\": 3.2, \"Other\": 1.0, \"None\": 19.2}");
        RELIGION_DATA.put("DK", "{\"Lutheran\": 74.7, \"Muslim\": 5.5, \"Other\": 4.0, \"None\": 15.8}");
        RELIGION_DATA.put("FI", "{\"Lutheran\": 67.8, \"Orthodox\": 1.1, \"Other Christian\": 1.1, \"Other\": 1.7, \"None\": 28.3}");
        RELIGION_DATA.put("IE", "{\"Catholic\": 78.3, \"Anglican\": 2.6, \"Other Christian\": 1.3, \"Muslim\": 1.3, \"Other\": 1.5, \"None\": 15.0}");
        RELIGION_DATA.put("NZ", "{\"Anglican\": 10.8, \"Catholic\": 12.6, \"Presbyterian\": 7.8, \"Other Christian\": 15.0, \"Hindu\": 2.1, \"Buddhist\": 1.3, \"Muslim\": 1.3, \"Other\": 1.6, \"None\": 47.5}");
        RELIGION_DATA.put("CL", "{\"Catholic\": 66.7, \"Protestant\": 16.4, \"Other\": 2.2, \"None\": 14.7}");
        RELIGION_DATA.put("CO", "{\"Catholic\": 79.0, \"Protestant\": 13.0, \"Other\": 1.0, \"None\": 7.0}");
        RELIGION_DATA.put("PE", "{\"Catholic\": 76.0, \"Protestant\": 14.1, \"Other\": 4.8, \"None\": 5.1}");
        RELIGION_DATA.put("EC", "{\"Catholic\": 68.8, \"Protestant\": 15.4, \"Other\": 1.3, \"None\": 14.5}");
        RELIGION_DATA.put("UY", "{\"Catholic\": 41.5, \"Protestant\": 11.1, \"Other\": 1.2, \"None\": 46.2}");
        RELIGION_DATA.put("VE", "{\"Catholic\": 71.0, \"Protestant\": 17.0, \"Other\": 3.0, \"None\": 9.0}");
        RELIGION_DATA.put("ML", "{\"Muslim\": 95.0, \"Christian\": 2.5, \"Indigenous\": 2.0, \"Other\": 0.5}");
        RELIGION_DATA.put("SD", "{\"Muslim\": 97.0, \"Christian\": 2.5, \"Other\": 0.5}");
        RELIGION_DATA.put("SN", "{\"Muslim\": 96.1, \"Christian\": 3.6, \"Indigenous\": 0.3}");
        RELIGION_DATA.put("MR", "{\"Muslim\": 100.0}");
        RELIGION_DATA.put("NE", "{\"Muslim\": 99.3, \"Christian\": 0.3, \"Indigenous\": 0.2, \"Other\": 0.2}");
        RELIGION_DATA.put("TD", "{\"Muslim\": 52.1, \"Christian\": 44.1, \"Indigenous\": 0.3, \"Other\": 3.5}");
        RELIGION_DATA.put("BF", "{\"Muslim\": 63.8, \"Catholic\": 19.7, \"Protestant\": 6.5, \"Indigenous\": 9.0, \"Other\": 1.0}");
        RELIGION_DATA.put("BJ", "{\"Muslim\": 27.7, \"Catholic\": 25.5, \"Protestant\": 13.5, \"Vodoun\": 11.6, \"Other\": 21.7}");
        RELIGION_DATA.put("TG", "{\"Christian\": 43.7, \"Muslim\": 18.0, \"Indigenous\": 5.0, \"Other\": 33.3}");
        RELIGION_DATA.put("GH", "{\"Protestant\": 52.8, \"Catholic\": 13.1, \"Muslim\": 17.6, \"Indigenous\": 5.2, \"Other\": 11.3}");
        RELIGION_DATA.put("CI", "{\"Muslim\": 42.9, \"Catholic\": 17.2, \"Protestant\": 11.8, \"Indigenous\": 3.6, \"Other\": 24.5}");
        RELIGION_DATA.put("GN", "{\"Muslim\": 89.1, \"Christian\": 6.8, \"Indigenous\": 1.6, \"Other\": 2.5}");
        RELIGION_DATA.put("SL", "{\"Muslim\": 78.6, \"Christian\": 20.8, \"Indigenous\": 0.3, \"Other\": 0.3}");
        RELIGION_DATA.put("LR", "{\"Christian\": 85.6, \"Muslim\": 12.2, \"Indigenous\": 0.6, \"Other\": 1.6}");
        RELIGION_DATA.put("CM", "{\"Catholic\": 38.4, \"Protestant\": 26.3, \"Muslim\": 20.9, \"Indigenous\": 5.6, \"Other\": 8.8}");
        RELIGION_DATA.put("CG", "{\"Catholic\": 33.1, \"Protestant\": 19.9, \"Muslim\": 1.6, \"Indigenous\": 8.1, \"Other\": 37.3}");
        RELIGION_DATA.put("CD", "{\"Catholic\": 29.9, \"Protestant\": 26.7, \"Muslim\": 1.3, \"Indigenous\": 2.8, \"Other\": 39.3}");
        RELIGION_DATA.put("AO", "{\"Catholic\": 41.1, \"Protestant\": 38.1, \"Indigenous\": 12.3, \"Other\": 8.5}");
        RELIGION_DATA.put("ZM", "{\"Protestant\": 75.3, \"Catholic\": 20.2, \"Muslim\": 0.5, \"Indigenous\": 0.5, \"Other\": 3.5}");
        RELIGION_DATA.put("ZW", "{\"Protestant\": 74.8, \"Catholic\": 7.3, \"Indigenous\": 4.5, \"Other\": 13.4}");
        RELIGION_DATA.put("BW", "{\"Protestant\": 66.1, \"Catholic\": 7.0, \"Indigenous\": 6.0, \"Other\": 20.9}");
        RELIGION_DATA.put("NA", "{\"Protestant\": 75.0, \"Catholic\": 10.0, \"Indigenous\": 5.0, \"Other\": 10.0}");
        RELIGION_DATA.put("ET", "{\"Ethiopian Orthodox\": 43.5, \"Muslim\": 33.9, \"Protestant\": 18.5, \"Catholic\": 0.7, \"Indigenous\": 2.7, \"Other\": 0.7}");
        RELIGION_DATA.put("ER", "{\"Muslim\": 36.6, \"Orthodox\": 30.0, \"Catholic\": 12.7, \"Protestant\": 5.0, \"Indigenous\": 2.4, \"Other\": 13.3}");
        RELIGION_DATA.put("DJ", "{\"Muslim\": 94.0, \"Christian\": 6.0}");
        RELIGION_DATA.put("SO", "{\"Muslim\": 99.8, \"Christian\": 0.1, \"Other\": 0.1}");
        RELIGION_DATA.put("SS", "{\"Christian\": 60.5, \"Indigenous\": 32.9, \"Muslim\": 6.2, \"Other\": 0.4}");
        RELIGION_DATA.put("UG", "{\"Protestant\": 45.1, \"Catholic\": 39.3, \"Muslim\": 13.7, \"Indigenous\": 1.1, \"Other\": 0.8}");
        RELIGION_DATA.put("RW", "{\"Catholic\": 49.5, \"Protestant\": 39.4, \"Muslim\": 1.8, \"Indigenous\": 0.1, \"Other\": 9.2}");
        RELIGION_DATA.put("BI", "{\"Catholic\": 62.1, \"Protestant\": 23.9, \"Muslim\": 2.5, \"Indigenous\": 2.3, \"Other\": 9.2}");
        RELIGION_DATA.put("TZ", "{\"Christian\": 61.4, \"Muslim\": 35.2, \"Indigenous\": 1.8, \"Other\": 1.6}");
        RELIGION_DATA.put("MW", "{\"Protestant\": 27.2, \"Catholic\": 18.4, \"Muslim\": 12.8, \"Indigenous\": 5.4, \"Other\": 36.2}");
        RELIGION_DATA.put("MZ", "{\"Catholic\": 30.3, \"Muslim\": 19.2, \"Protestant\": 15.1, \"Indigenous\": 12.2, \"Other\": 23.2}");
        RELIGION_DATA.put("MG", "{\"Indigenous\": 52.0, \"Protestant\": 23.1, \"Catholic\": 21.0, \"Muslim\": 1.7, \"Other\": 2.2}");
        RELIGION_DATA.put("MU", "{\"Hindu\": 48.5, \"Catholic\": 26.3, \"Muslim\": 17.3, \"Protestant\": 6.4, \"Other\": 1.5}");
        RELIGION_DATA.put("LA", "{\"Buddhist\": 64.7, \"Christian\": 1.7, \"Indigenous\": 31.4, \"Other\": 2.2}");
        RELIGION_DATA.put("KH", "{\"Buddhist\": 97.1, \"Muslim\": 2.0, \"Christian\": 0.3, \"Other\": 0.6}");
        RELIGION_DATA.put("MM", "{\"Buddhist\": 87.9, \"Christian\": 6.2, \"Muslim\": 4.3, \"Indigenous\": 0.8, \"Other\": 0.8}");
        RELIGION_DATA.put("LK", "{\"Buddhist\": 70.2, \"Hindu\": 12.6, \"Muslim\": 9.7, \"Christian\": 7.4, \"Other\": 0.1}");
        RELIGION_DATA.put("BT", "{\"Buddhist\": 75.3, \"Hindu\": 22.1, \"Christian\": 0.5, \"Other\": 2.1}");
        RELIGION_DATA.put("NP", "{\"Hindu\": 81.3, \"Buddhist\": 9.0, \"Muslim\": 4.4, \"Christian\": 1.4, \"Indigenous\": 3.0, \"Other\": 0.9}");
        RELIGION_DATA.put("MV", "{\"Muslim\": 100.0}");
        RELIGION_DATA.put("AF", "{\"Muslim\": 99.7, \"Other\": 0.3}");
        RELIGION_DATA.put("TJ", "{\"Muslim\": 98.0, \"Christian\": 1.0, \"Other\": 1.0}");
        RELIGION_DATA.put("UZ", "{\"Muslim\": 88.0, \"Orthodox\": 9.0, \"Other\": 3.0}");
        RELIGION_DATA.put("TM", "{\"Muslim\": 93.0, \"Orthodox\": 6.0, \"Other\": 1.0}");
        RELIGION_DATA.put("KG", "{\"Muslim\": 90.0, \"Christian\": 7.0, \"Other\": 3.0}");
        RELIGION_DATA.put("MD", "{\"Orthodox\": 90.1, \"Protestant\": 2.2, \"Catholic\": 0.9, \"Other\": 6.8}");
        RELIGION_DATA.put("BA", "{\"Muslim\": 50.7, \"Orthodox\": 30.7, \"Catholic\": 15.2, \"Other\": 3.4}");
        RELIGION_DATA.put("MK", "{\"Orthodox\": 46.1, \"Muslim\": 32.2, \"Catholic\": 0.4, \"Other\": 21.3}");
        RELIGION_DATA.put("AM", "{\"Armenian Apostolic\": 92.6, \"Other Christian\": 2.0, \"Yezidi\": 1.0, \"Other\": 4.4}");
        RELIGION_DATA.put("AZ", "{\"Muslim\": 96.9, \"Orthodox\": 2.5, \"Other\": 0.6}");
        RELIGION_DATA.put("GE", "{\"Orthodox\": 83.4, \"Muslim\": 10.7, \"Armenian Apostolic\": 2.9, \"Catholic\": 0.5, \"Other\": 2.5}");
        RELIGION_DATA.put("LB", "{\"Muslim\": 61.1, \"Christian\": 33.7, \"Druze\": 5.2}");
        RELIGION_DATA.put("JO", "{\"Muslim\": 97.2, \"Christian\": 2.2, \"Other\": 0.6}");
        RELIGION_DATA.put("IQ", "{\"Muslim\": 95.0, \"Christian\": 1.0, \"Other\": 4.0}");
        RELIGION_DATA.put("YE", "{\"Muslim\": 99.1, \"Other\": 0.9}");
        RELIGION_DATA.put("SY", "{\"Muslim\": 87.0, \"Christian\": 10.0, \"Druze\": 3.0}");
        RELIGION_DATA.put("PS", "{\"Muslim\": 98.0, \"Christian\": 1.0, \"Other\": 1.0}");
        // Europa
        RELIGION_DATA.put("AD", "{\"Catholic\": 89.5, \"Other Christian\": 6.0, \"Other\": 4.5}");
        RELIGION_DATA.put("AL", "{\"Muslim\": 56.7, \"Catholic\": 10.0, \"Orthodox\": 6.8, \"Other\": 26.5}");
        RELIGION_DATA.put("AT", "{\"Catholic\": 55.2, \"Orthodox\": 8.9, \"Muslim\": 8.3, \"Protestant\": 3.8, \"Other\": 1.0, \"None\": 22.8}");
        RELIGION_DATA.put("BG", "{\"Orthodox\": 59.4, \"Muslim\": 7.8, \"Catholic\": 0.8, \"Protestant\": 0.9, \"Other\": 0.7, \"None\": 30.4}");
        RELIGION_DATA.put("BY", "{\"Orthodox\": 48.3, \"Catholic\": 7.1, \"Other\": 3.5, \"None\": 41.1}");
        RELIGION_DATA.put("CY", "{\"Orthodox\": 89.1, \"Muslim\": 1.8, \"Catholic\": 2.9, \"Other\": 6.2}");
        RELIGION_DATA.put("CZ", "{\"Catholic\": 21.3, \"Protestant\": 1.0, \"Other\": 3.2, \"None\": 74.5}");
        RELIGION_DATA.put("EE", "{\"Orthodox\": 16.2, \"Lutheran\": 9.9, \"Catholic\": 0.8, \"Other\": 2.2, \"None\": 70.9}");
        RELIGION_DATA.put("GG", "{\"Anglican\": 31.0, \"Catholic\": 2.0, \"Other Christian\": 3.0, \"Other\": 1.0, \"None\": 63.0}");
        RELIGION_DATA.put("HR", "{\"Catholic\": 86.3, \"Orthodox\": 4.4, \"Muslim\": 1.5, \"Protestant\": 0.3, \"Other\": 0.9, \"None\": 6.6}");
        RELIGION_DATA.put("HU", "{\"Catholic\": 37.2, \"Calvinist\": 11.6, \"Lutheran\": 2.2, \"Orthodox\": 1.9, \"Other\": 1.7, \"None\": 45.4}");
        RELIGION_DATA.put("IM", "{\"Anglican\": 35.0, \"Catholic\": 10.0, \"Other Christian\": 5.0, \"Other\": 2.0, \"None\": 48.0}");
        RELIGION_DATA.put("IS", "{\"Lutheran\": 62.3, \"Catholic\": 3.8, \"Other Christian\": 5.0, \"Other\": 1.5, \"None\": 27.4}");
        RELIGION_DATA.put("JE", "{\"Anglican\": 32.0, \"Catholic\": 2.0, \"Other Christian\": 3.0, \"Other\": 1.0, \"None\": 62.0}");
        RELIGION_DATA.put("LI", "{\"Catholic\": 73.4, \"Protestant\": 8.2, \"Muslim\": 5.9, \"Other\": 1.3, \"None\": 11.2}");
        RELIGION_DATA.put("LT", "{\"Catholic\": 74.2, \"Orthodox\": 4.1, \"Protestant\": 0.8, \"Other\": 0.8, \"None\": 20.1}");
        RELIGION_DATA.put("LU", "{\"Catholic\": 70.4, \"Protestant\": 2.3, \"Orthodox\": 1.1, \"Muslim\": 2.3, \"Other\": 0.6, \"None\": 23.3}");
        RELIGION_DATA.put("LV", "{\"Lutheran\": 19.6, \"Orthodox\": 15.3, \"Catholic\": 1.0, \"Other Christian\": 1.0, \"Other\": 0.4, \"None\": 62.7}");
        RELIGION_DATA.put("MC", "{\"Catholic\": 82.2, \"Anglican\": 2.1, \"Orthodox\": 1.7, \"Jewish\": 0.2, \"Muslim\": 0.8, \"Other\": 0.3, \"None\": 12.7}");
        RELIGION_DATA.put("ME", "{\"Orthodox\": 72.1, \"Muslim\": 19.1, \"Catholic\": 3.4, \"Other\": 5.4}");
        RELIGION_DATA.put("MT", "{\"Catholic\": 82.6, \"Anglican\": 1.2, \"Other Christian\": 1.0, \"Muslim\": 0.2, \"Other\": 0.1, \"None\": 14.9}");
        RELIGION_DATA.put("RO", "{\"Orthodox\": 81.9, \"Protestant\": 6.2, \"Catholic\": 4.3, \"Other\": 0.9, \"None\": 6.7}");
        RELIGION_DATA.put("RS", "{\"Orthodox\": 84.6, \"Catholic\": 5.0, \"Muslim\": 3.1, \"Protestant\": 1.0, \"Other\": 6.3}");
        RELIGION_DATA.put("SI", "{\"Catholic\": 57.8, \"Muslim\": 2.4, \"Orthodox\": 2.3, \"Protestant\": 0.9, \"Other\": 1.0, \"None\": 35.6}");
        RELIGION_DATA.put("SK", "{\"Catholic\": 62.0, \"Protestant\": 8.2, \"Orthodox\": 0.9, \"Other\": 1.1, \"None\": 27.8}");
        RELIGION_DATA.put("SM", "{\"Catholic\": 97.0, \"Other\": 3.0}");
        RELIGION_DATA.put("UA", "{\"Orthodox\": 67.3, \"Catholic\": 10.2, \"Protestant\": 2.2, \"Muslim\": 1.0, \"Jewish\": 0.2, \"Other\": 0.9, \"None\": 18.2}");
        RELIGION_DATA.put("VA", "{\"Catholic\": 100.0}");
        RELIGION_DATA.put("XK", "{\"Muslim\": 95.6, \"Catholic\": 2.2, \"Orthodox\": 1.5, \"Other\": 0.7}");
        // Ásia
        RELIGION_DATA.put("AE", "{\"Muslim\": 76.0, \"Christian\": 12.6, \"Hindu\": 6.6, \"Buddhist\": 2.0, \"Other\": 2.8}");
        RELIGION_DATA.put("BD", "{\"Muslim\": 90.4, \"Hindu\": 8.5, \"Buddhist\": 0.6, \"Christian\": 0.4, \"Other\": 0.1}");
        RELIGION_DATA.put("BH", "{\"Muslim\": 73.7, \"Christian\": 9.3, \"Hindu\": 7.7, \"Buddhist\": 2.5, \"Jewish\": 0.1, \"Other\": 6.7}");
        RELIGION_DATA.put("BN", "{\"Muslim\": 82.1, \"Christian\": 6.7, \"Buddhist\": 7.0, \"Other\": 4.2}");
        RELIGION_DATA.put("HK", "{\"Buddhist\": 15.3, \"Taoist\": 14.2, \"Christian\": 11.8, \"Catholic\": 5.0, \"Muslim\": 4.2, \"Hindu\": 1.4, \"Sikh\": 0.2, \"Other\": 0.5, \"None\": 47.4}");
        RELIGION_DATA.put("KP", "{\"Buddhist\": 0.5, \"Christian\": 1.7, \"Chondogyo\": 0.3, \"Other\": 0.1, \"None\": 97.4}");
        RELIGION_DATA.put("KW", "{\"Muslim\": 74.6, \"Christian\": 18.2, \"Hindu\": 3.0, \"Buddhist\": 1.0, \"Other\": 3.2}");
        RELIGION_DATA.put("KZ", "{\"Muslim\": 70.2, \"Orthodox\": 26.2, \"Catholic\": 0.6, \"Protestant\": 0.9, \"Other\": 2.1}");
        RELIGION_DATA.put("MN", "{\"Buddhist\": 53.0, \"Muslim\": 3.0, \"Shamanist\": 2.9, \"Christian\": 2.2, \"Other\": 0.4, \"None\": 38.5}");
        RELIGION_DATA.put("MO", "{\"Buddhist\": 17.3, \"Catholic\": 5.3, \"Protestant\": 1.8, \"Other\": 1.0, \"None\": 74.6}");
        RELIGION_DATA.put("MY", "{\"Muslim\": 61.3, \"Buddhist\": 19.8, \"Christian\": 9.2, \"Hindu\": 6.3, \"Other\": 1.3, \"None\": 2.1}");
        RELIGION_DATA.put("OM", "{\"Muslim\": 85.9, \"Christian\": 6.5, \"Hindu\": 5.5, \"Buddhist\": 0.8, \"Other\": 1.3}");
        RELIGION_DATA.put("QA", "{\"Muslim\": 65.2, \"Christian\": 13.7, \"Hindu\": 15.9, \"Buddhist\": 3.1, \"Other\": 2.1}");
        RELIGION_DATA.put("SG", "{\"Buddhist\": 31.1, \"Christian\": 18.9, \"Muslim\": 15.6, \"Taoist\": 8.8, \"Hindu\": 5.0, \"Catholic\": 7.0, \"Other\": 1.0, \"None\": 12.6}");
        RELIGION_DATA.put("TW", "{\"Buddhist\": 35.1, \"Taoist\": 33.0, \"Christian\": 3.9, \"Catholic\": 1.3, \"Other\": 0.8, \"None\": 25.9}");
        // Américas
        RELIGION_DATA.put("AG", "{\"Protestant\": 68.3, \"Catholic\": 8.2, \"Other Christian\": 5.9, \"Other\": 1.0, \"None\": 16.6}");
        RELIGION_DATA.put("BB", "{\"Protestant\": 66.4, \"Catholic\": 3.8, \"Other Christian\": 5.4, \"Other\": 1.0, \"None\": 23.4}");
        RELIGION_DATA.put("BO", "{\"Catholic\": 70.0, \"Protestant\": 17.2, \"Indigenous\": 1.0, \"Other\": 1.0, \"None\": 10.8}");
        RELIGION_DATA.put("BS", "{\"Protestant\": 69.9, \"Catholic\": 12.0, \"Other Christian\": 13.0, \"Other\": 1.0, \"None\": 4.1}");
        RELIGION_DATA.put("BZ", "{\"Catholic\": 40.1, \"Protestant\": 31.8, \"Anglican\": 4.6, \"Mennonite\": 3.6, \"Other Christian\": 9.7, \"Other\": 1.4, \"None\": 8.8}");
        RELIGION_DATA.put("CR", "{\"Catholic\": 52.0, \"Protestant\": 22.5, \"Other Christian\": 4.0, \"Other\": 1.0, \"None\": 20.5}");
        RELIGION_DATA.put("CU", "{\"Catholic\": 58.9, \"Protestant\": 5.0, \"Santeria\": 1.7, \"Other\": 1.0, \"None\": 33.4}");
        RELIGION_DATA.put("DM", "{\"Catholic\": 52.7, \"Protestant\": 18.6, \"Other Christian\": 9.1, \"Other\": 1.0, \"None\": 18.6}");
        RELIGION_DATA.put("DO", "{\"Catholic\": 44.3, \"Protestant\": 21.3, \"Other Christian\": 1.8, \"Other\": 0.9, \"None\": 31.7}");
        RELIGION_DATA.put("GD", "{\"Catholic\": 44.6, \"Protestant\": 43.5, \"Anglican\": 11.5, \"Other\": 0.4}");
        RELIGION_DATA.put("GF", "{\"Catholic\": 75.0, \"Protestant\": 4.0, \"Other\": 2.0, \"None\": 19.0}");
        RELIGION_DATA.put("GT", "{\"Catholic\": 45.0, \"Protestant\": 42.0, \"Indigenous\": 1.0, \"Other\": 1.0, \"None\": 11.0}");
        RELIGION_DATA.put("GY", "{\"Protestant\": 34.8, \"Hindu\": 24.8, \"Catholic\": 7.1, \"Muslim\": 6.8, \"Anglican\": 5.2, \"Other Christian\": 20.8, \"Other\": 0.5}");
        RELIGION_DATA.put("HN", "{\"Catholic\": 46.0, \"Protestant\": 41.0, \"Other\": 2.0, \"None\": 11.0}");
        RELIGION_DATA.put("HT", "{\"Catholic\": 55.0, \"Protestant\": 28.5, \"Vodou\": 2.1, \"Other\": 4.6, \"None\": 9.8}");
        RELIGION_DATA.put("JM", "{\"Protestant\": 64.8, \"Catholic\": 2.2, \"Rastafarian\": 1.1, \"Other\": 6.5, \"None\": 25.4}");
        RELIGION_DATA.put("KN", "{\"Anglican\": 50.0, \"Protestant\": 25.0, \"Catholic\": 6.0, \"Other\": 19.0}");
        RELIGION_DATA.put("LC", "{\"Catholic\": 61.5, \"Protestant\": 25.5, \"Rastafarian\": 1.9, \"Other\": 2.0, \"None\": 9.1}");
        RELIGION_DATA.put("NI", "{\"Catholic\": 50.0, \"Protestant\": 33.2, \"Other\": 2.5, \"None\": 14.3}");
        RELIGION_DATA.put("PA", "{\"Catholic\": 48.6, \"Protestant\": 25.4, \"Other Christian\": 1.2, \"Other\": 1.0, \"None\": 23.8}");
        RELIGION_DATA.put("PR", "{\"Catholic\": 56.0, \"Protestant\": 33.0, \"Other\": 1.0, \"None\": 10.0}");
        RELIGION_DATA.put("PY", "{\"Catholic\": 88.3, \"Protestant\": 6.8, \"Other Christian\": 0.9, \"Other\": 0.3, \"None\": 3.7}");
        RELIGION_DATA.put("SR", "{\"Protestant\": 23.6, \"Hindu\": 22.3, \"Catholic\": 21.6, \"Muslim\": 13.9, \"Other\": 18.6}");
        RELIGION_DATA.put("SV", "{\"Catholic\": 50.0, \"Protestant\": 36.0, \"Other\": 2.0, \"None\": 12.0}");
        RELIGION_DATA.put("TT", "{\"Protestant\": 32.1, \"Catholic\": 21.6, \"Hindu\": 18.2, \"Muslim\": 5.0, \"Anglican\": 12.3, \"Other\": 10.8}");
        RELIGION_DATA.put("VC", "{\"Anglican\": 47.0, \"Methodist\": 28.0, \"Catholic\": 13.0, \"Other\": 12.0}");
        // África
        RELIGION_DATA.put("CF", "{\"Protestant\": 51.4, \"Catholic\": 28.9, \"Muslim\": 8.5, \"Indigenous\": 5.0, \"Other\": 6.2}");
        RELIGION_DATA.put("DZ", "{\"Muslim\": 99.0, \"Christian\": 0.5, \"Jewish\": 0.1, \"Other\": 0.4}");
        RELIGION_DATA.put("GA", "{\"Catholic\": 42.3, \"Protestant\": 12.3, \"Muslim\": 9.8, \"Indigenous\": 0.6, \"Other\": 35.0}");
        RELIGION_DATA.put("GM", "{\"Muslim\": 95.7, \"Christian\": 4.2, \"Indigenous\": 0.1}");
        RELIGION_DATA.put("GQ", "{\"Catholic\": 88.7, \"Protestant\": 5.0, \"Muslim\": 4.0, \"Indigenous\": 1.0, \"Other\": 1.3}");
        RELIGION_DATA.put("GW", "{\"Muslim\": 46.1, \"Catholic\": 10.0, \"Protestant\": 13.9, \"Indigenous\": 30.0}");
        RELIGION_DATA.put("KM", "{\"Muslim\": 98.0, \"Catholic\": 1.0, \"Other\": 1.0}");
        RELIGION_DATA.put("LY", "{\"Muslim\": 96.6, \"Christian\": 2.7, \"Other\": 0.7}");
        RELIGION_DATA.put("MA", "{\"Muslim\": 99.0, \"Christian\": 0.2, \"Jewish\": 0.1, \"Other\": 0.7}");
        RELIGION_DATA.put("SC", "{\"Catholic\": 76.2, \"Anglican\": 10.6, \"Protestant\": 2.4, \"Hindu\": 2.4, \"Muslim\": 1.6, \"Other\": 6.8}");
        RELIGION_DATA.put("ST", "{\"Catholic\": 55.7, \"Protestant\": 14.0, \"Adventist\": 4.1, \"Other\": 26.2}");
        RELIGION_DATA.put("TN", "{\"Muslim\": 99.0, \"Christian\": 0.2, \"Jewish\": 0.1, \"Other\": 0.7}");
        // Oceania
        RELIGION_DATA.put("FJ", "{\"Protestant\": 45.0, \"Hindu\": 27.9, \"Catholic\": 9.1, \"Muslim\": 6.3, \"Sikh\": 0.3, \"Other\": 11.4}");
        RELIGION_DATA.put("FK", "{\"Anglican\": 41.9, \"Catholic\": 10.1, \"Other Christian\": 7.1, \"Other\": 1.0, \"None\": 39.9}");
        RELIGION_DATA.put("KI", "{\"Catholic\": 57.3, \"Protestant\": 31.3, \"Mormon\": 4.7, \"Baha'i\": 2.1, \"Other\": 4.6}");
        RELIGION_DATA.put("MH", "{\"Protestant\": 54.8, \"Catholic\": 8.4, \"Mormon\": 2.1, \"Other\": 34.7}");
        RELIGION_DATA.put("NC", "{\"Catholic\": 60.0, \"Protestant\": 30.0, \"Other\": 10.0}");
        RELIGION_DATA.put("NR", "{\"Protestant\": 60.4, \"Catholic\": 33.0, \"Other\": 6.6}");
        RELIGION_DATA.put("PF", "{\"Protestant\": 54.0, \"Catholic\": 30.0, \"Other\": 16.0}");
        RELIGION_DATA.put("PG", "{\"Protestant\": 69.4, \"Catholic\": 27.0, \"Indigenous\": 1.4, \"Other\": 2.2}");
        RELIGION_DATA.put("PW", "{\"Catholic\": 45.3, \"Protestant\": 34.9, \"Modekngei\": 5.7, \"Mormon\": 1.5, \"Other\": 12.6}");
        RELIGION_DATA.put("SB", "{\"Protestant\": 73.4, \"Catholic\": 19.6, \"Anglican\": 2.9, \"Other\": 4.1}");
        RELIGION_DATA.put("TO", "{\"Protestant\": 64.1, \"Catholic\": 18.6, \"Mormon\": 14.2, \"Other\": 3.1}");
        RELIGION_DATA.put("TV", "{\"Protestant\": 86.0, \"Catholic\": 3.0, \"Baha'i\": 3.0, \"Other\": 8.0}");
        RELIGION_DATA.put("VU", "{\"Protestant\": 70.0, \"Catholic\": 12.4, \"Indigenous\": 3.7, \"Other\": 13.9}");
        RELIGION_DATA.put("WS", "{\"Protestant\": 54.9, \"Catholic\": 18.8, \"Mormon\": 16.9, \"Other\": 9.4}");
        // Outros
        RELIGION_DATA.put("FM", "{\"Catholic\": 52.7, \"Protestant\": 41.7, \"Other\": 5.6}");
        RELIGION_DATA.put("TL", "{\"Catholic\": 97.6, \"Protestant\": 1.0, \"Muslim\": 0.3, \"Other\": 1.1}");
    }
    
    // Mapeamento de grupos étnicos por país (JSON format)
    // Dados baseados no CIA World Factbook e censos nacionais
    private static final Map<String, String> ETHNIC_GROUPS_DATA = new HashMap<>();
    
    static {
        // Formato: JSON string com distribuição étnica em percentuais
        ETHNIC_GROUPS_DATA.put("US", "{\"White\": 61.6, \"Hispanic\": 18.7, \"Black\": 12.4, \"Asian\": 6.0, \"Native American\": 1.1, \"Pacific Islander\": 0.2}");
        ETHNIC_GROUPS_DATA.put("BR", "{\"White\": 47.7, \"Mixed\": 43.1, \"Black\": 7.6, \"Asian\": 1.1, \"Indigenous\": 0.4, \"Other\": 0.1}");
        ETHNIC_GROUPS_DATA.put("MX", "{\"Mestizo\": 62.0, \"Amerindian\": 21.0, \"White\": 10.0, \"Other\": 7.0}");
        ETHNIC_GROUPS_DATA.put("AR", "{\"White\": 97.0, \"Mestizo\": 2.0, \"Amerindian\": 0.5, \"Other\": 0.5}");
        ETHNIC_GROUPS_DATA.put("GB", "{\"White\": 87.2, \"Asian\": 6.2, \"Black\": 3.0, \"Mixed\": 2.0, \"Other\": 1.6}");
        ETHNIC_GROUPS_DATA.put("FR", "{\"White\": 85.0, \"North African\": 10.0, \"Black\": 3.0, \"Asian\": 2.0}");
        ETHNIC_GROUPS_DATA.put("DE", "{\"German\": 86.3, \"Turkish\": 1.8, \"Polish\": 1.0, \"Syrian\": 1.0, \"Other\": 9.9}");
        ETHNIC_GROUPS_DATA.put("IT", "{\"Italian\": 91.5, \"Romanian\": 1.8, \"North African\": 1.1, \"Albanian\": 0.8, \"Other\": 4.8}");
        ETHNIC_GROUPS_DATA.put("ES", "{\"Spanish\": 84.8, \"Moroccan\": 1.7, \"Romanian\": 1.2, \"Other\": 12.3}");
        ETHNIC_GROUPS_DATA.put("PT", "{\"Portuguese\": 95.0, \"African\": 2.0, \"Other European\": 1.0, \"Other\": 2.0}");
        ETHNIC_GROUPS_DATA.put("CA", "{\"White\": 72.9, \"Asian\": 17.7, \"Indigenous\": 4.9, \"Black\": 3.1, \"Latin American\": 1.3, \"Other\": 0.1}");
        ETHNIC_GROUPS_DATA.put("AU", "{\"White\": 76.0, \"Asian\": 17.0, \"Aboriginal\": 3.2, \"Other\": 3.8}");
        ETHNIC_GROUPS_DATA.put("IN", "{\"Indo-Aryan\": 72.0, \"Dravidian\": 25.0, \"Mongoloid\": 3.0}");
        ETHNIC_GROUPS_DATA.put("CN", "{\"Han\": 91.6, \"Zhuang\": 1.3, \"Hui\": 0.8, \"Manchu\": 0.8, \"Uyghur\": 0.8, \"Miao\": 0.7, \"Yi\": 0.7, \"Tujia\": 0.5, \"Tibetan\": 0.5, \"Mongol\": 0.4, \"Other\": 2.5}");
        ETHNIC_GROUPS_DATA.put("JP", "{\"Japanese\": 97.9, \"Chinese\": 0.6, \"Korean\": 0.4, \"Other\": 1.1}");
        ETHNIC_GROUPS_DATA.put("KR", "{\"Korean\": 95.1, \"Chinese\": 0.6, \"Other\": 4.3}");
        ETHNIC_GROUPS_DATA.put("RU", "{\"Russian\": 77.7, \"Tatar\": 3.7, \"Ukrainian\": 1.4, \"Bashkir\": 1.1, \"Chuvash\": 1.0, \"Chechen\": 1.0, \"Armenian\": 0.9, \"Other\": 13.2}");
        ETHNIC_GROUPS_DATA.put("TR", "{\"Turkish\": 70.0, \"Kurdish\": 19.0, \"Other\": 11.0}");
        ETHNIC_GROUPS_DATA.put("SA", "{\"Arab\": 90.0, \"Afro-Asian\": 10.0}");
        ETHNIC_GROUPS_DATA.put("EG", "{\"Egyptian\": 99.6, \"Other\": 0.4}");
        ETHNIC_GROUPS_DATA.put("IR", "{\"Persian\": 61.0, \"Azerbaijani\": 16.0, \"Kurd\": 10.0, \"Lur\": 6.0, \"Arab\": 2.0, \"Baloch\": 2.0, \"Turkmen\": 2.0, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("PK", "{\"Punjabi\": 44.7, \"Pashtun\": 15.4, \"Sindhi\": 14.1, \"Saraiki\": 8.4, \"Muhajir\": 7.6, \"Baloch\": 3.6, \"Other\": 6.2}");
        ETHNIC_GROUPS_DATA.put("ID", "{\"Javanese\": 40.1, \"Sundanese\": 15.5, \"Malay\": 3.7, \"Batak\": 3.6, \"Madurese\": 3.0, \"Betawi\": 2.9, \"Minangkabau\": 2.7, \"Buginese\": 2.7, \"Bantenese\": 2.0, \"Banjarese\": 1.7, \"Other\": 22.1}");
        ETHNIC_GROUPS_DATA.put("PH", "{\"Tagalog\": 24.4, \"Cebuano\": 9.9, \"Ilocano\": 8.8, \"Bisaya\": 7.8, \"Hiligaynon\": 7.7, \"Bikol\": 3.8, \"Waray\": 3.4, \"Other\": 34.2}");
        ETHNIC_GROUPS_DATA.put("TH", "{\"Thai\": 97.5, \"Burmese\": 1.3, \"Other\": 1.2}");
        ETHNIC_GROUPS_DATA.put("VN", "{\"Kinh\": 85.3, \"Tay\": 1.9, \"Thai\": 1.8, \"Muong\": 1.5, \"Khmer\": 1.5, \"Mong\": 1.2, \"Nung\": 1.1, \"Other\": 5.7}");
        ETHNIC_GROUPS_DATA.put("ZA", "{\"Black African\": 80.7, \"Colored\": 8.8, \"White\": 7.9, \"Indian/Asian\": 2.6}");
        ETHNIC_GROUPS_DATA.put("NG", "{\"Hausa\": 30.0, \"Yoruba\": 15.5, \"Igbo\": 15.2, \"Fulani\": 6.0, \"Tiv\": 2.4, \"Kanuri\": 2.4, \"Ibibio\": 1.8, \"Other\": 26.7}");
        ETHNIC_GROUPS_DATA.put("KE", "{\"Kikuyu\": 17.1, \"Luhya\": 14.3, \"Kalenjin\": 13.4, \"Luo\": 10.7, \"Kamba\": 10.1, \"Somali\": 6.2, \"Kisii\": 5.7, \"Mijikenda\": 5.1, \"Meru\": 4.3, \"Turkana\": 2.5, \"Other\": 10.6}");
        ETHNIC_GROUPS_DATA.put("IL", "{\"Jewish\": 73.5, \"Arab\": 21.0, \"Other\": 5.5}");
        ETHNIC_GROUPS_DATA.put("GR", "{\"Greek\": 91.6, \"Albanian\": 4.4, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("PL", "{\"Polish\": 96.9, \"Silesian\": 1.1, \"German\": 0.2, \"Ukrainian\": 0.1, \"Other\": 1.7}");
        ETHNIC_GROUPS_DATA.put("NL", "{\"Dutch\": 75.4, \"Turkish\": 2.4, \"Moroccan\": 2.4, \"Surinamese\": 2.1, \"Indonesian\": 2.0, \"Other\": 15.7}");
        ETHNIC_GROUPS_DATA.put("BE", "{\"Belgian\": 75.0, \"Italian\": 4.1, \"Moroccan\": 3.7, \"French\": 2.4, \"Turkish\": 2.0, \"Dutch\": 2.0, \"Other\": 10.8}");
        ETHNIC_GROUPS_DATA.put("CH", "{\"Swiss\": 69.3, \"German\": 4.2, \"Italian\": 3.2, \"Portuguese\": 2.6, \"French\": 2.0, \"Kosovar\": 1.1, \"Other\": 17.6}");
        ETHNIC_GROUPS_DATA.put("SE", "{\"Swedish\": 80.3, \"Syrian\": 1.9, \"Finnish\": 1.4, \"Iraqi\": 1.4, \"Polish\": 1.2, \"Other\": 13.8}");
        ETHNIC_GROUPS_DATA.put("NO", "{\"Norwegian\": 83.2, \"Polish\": 1.1, \"Lithuanian\": 0.6, \"Somali\": 0.6, \"Other\": 14.5}");
        ETHNIC_GROUPS_DATA.put("DK", "{\"Danish\": 86.1, \"Turkish\": 1.1, \"Polish\": 0.8, \"Syrian\": 0.6, \"German\": 0.5, \"Other\": 10.9}");
        ETHNIC_GROUPS_DATA.put("FI", "{\"Finnish\": 87.3, \"Swedish\": 5.2, \"Russian\": 1.4, \"Estonian\": 0.9, \"Other\": 5.2}");
        ETHNIC_GROUPS_DATA.put("IE", "{\"Irish\": 82.2, \"Polish\": 2.7, \"Other White\": 9.5, \"Asian\": 2.1, \"Black\": 1.4, \"Other\": 2.1}");
        ETHNIC_GROUPS_DATA.put("NZ", "{\"European\": 70.2, \"Maori\": 16.5, \"Asian\": 15.1, \"Pacific Islander\": 8.1, \"Middle Eastern/Latin American/African\": 1.5, \"Other\": 1.2}");
        ETHNIC_GROUPS_DATA.put("CL", "{\"White and Mestizo\": 88.9, \"Mapuche\": 9.1, \"Aymara\": 0.7, \"Other\": 1.3}");
        ETHNIC_GROUPS_DATA.put("CO", "{\"Mestizo\": 49.0, \"White\": 37.0, \"Afro-Colombian\": 10.6, \"Indigenous\": 3.4}");
        ETHNIC_GROUPS_DATA.put("PE", "{\"Mestizo\": 60.2, \"Quechua\": 22.3, \"White\": 5.9, \"Aymara\": 2.4, \"Afro-Peruvian\": 3.6, \"Other\": 5.6}");
        ETHNIC_GROUPS_DATA.put("EC", "{\"Mestizo\": 71.9, \"Montubio\": 7.4, \"Afro-Ecuadorian\": 7.2, \"Indigenous\": 7.0, \"White\": 6.1, \"Other\": 0.4}");
        ETHNIC_GROUPS_DATA.put("UY", "{\"White\": 87.7, \"Mestizo\": 4.6, \"Black\": 4.6, \"Amerindian\": 2.4, \"Other\": 0.7}");
        ETHNIC_GROUPS_DATA.put("VE", "{\"Mestizo\": 51.6, \"White\": 43.6, \"Black\": 3.6, \"Indigenous\": 1.2}");
        ETHNIC_GROUPS_DATA.put("ML", "{\"Bambara\": 33.3, \"Fulani\": 13.3, \"Sarakole\": 9.8, \"Senufo\": 9.6, \"Malinke\": 8.8, \"Songhai\": 7.2, \"Tuareg\": 5.5, \"Dogon\": 4.3, \"Other\": 8.2}");
        ETHNIC_GROUPS_DATA.put("SD", "{\"Arab\": 70.0, \"Fur\": 2.0, \"Beja\": 2.0, \"Nuba\": 2.0, \"Fallata\": 2.0, \"Other\": 22.0}");
        ETHNIC_GROUPS_DATA.put("SN", "{\"Wolof\": 39.7, \"Fulani\": 24.2, \"Serer\": 14.9, \"Mandinka\": 4.6, \"Jola\": 4.2, \"Soninke\": 2.3, \"Other\": 10.1}");
        ETHNIC_GROUPS_DATA.put("MR", "{\"Arab-Berber\": 30.0, \"Haratin\": 40.0, \"Sub-Saharan Mauritanian\": 30.0}");
        ETHNIC_GROUPS_DATA.put("NE", "{\"Hausa\": 53.1, \"Zarma/Songhai\": 21.2, \"Tuareg\": 11.0, \"Fulani\": 6.5, \"Kanuri\": 5.9, \"Other\": 2.3}");
        ETHNIC_GROUPS_DATA.put("TD", "{\"Sara\": 30.5, \"Arab\": 12.3, \"Mayo-Kebbi\": 11.5, \"Kanem-Bornou\": 9.0, \"Ouaddai\": 8.7, \"Hadjerai\": 6.7, \"Tandjile\": 6.5, \"Gorane\": 6.3, \"Fulani\": 2.0, \"Other\": 6.5}");
        ETHNIC_GROUPS_DATA.put("BF", "{\"Mossi\": 52.0, \"Fulani\": 8.4, \"Gurma\": 7.0, \"Bobo\": 4.9, \"Gurunsi\": 4.6, \"Senufo\": 4.5, \"Other\": 18.6}");
        ETHNIC_GROUPS_DATA.put("BJ", "{\"Fon\": 38.4, \"Adja\": 15.1, \"Yoruba\": 12.0, \"Bariba\": 9.6, \"Fulani\": 8.6, \"Ottamari\": 6.1, \"Yoa-Lokpa\": 4.3, \"Dendi\": 2.6, \"Other\": 3.3}");
        ETHNIC_GROUPS_DATA.put("TG", "{\"Ewe\": 21.2, \"Kabye\": 13.8, \"Watyi\": 10.1, \"Mina\": 5.7, \"Moba\": 5.4, \"Other\": 43.8}");
        ETHNIC_GROUPS_DATA.put("GH", "{\"Akan\": 47.5, \"Mole-Dagbon\": 16.6, \"Ewe\": 13.9, \"Ga-Dangme\": 7.4, \"Gurma\": 5.7, \"Guan\": 3.7, \"Grusi\": 2.5, \"Mande\": 1.1, \"Other\": 1.6}");
        ETHNIC_GROUPS_DATA.put("CI", "{\"Akan\": 28.9, \"Voltaique\": 16.1, \"Northern Mande\": 14.5, \"Krou\": 8.5, \"Southern Mande\": 6.9, \"Other\": 25.1}");
        ETHNIC_GROUPS_DATA.put("GN", "{\"Fulani\": 33.4, \"Malinke\": 29.4, \"Susu\": 21.2, \"Kissi\": 6.2, \"Kpelle\": 4.7, \"Other\": 5.1}");
        ETHNIC_GROUPS_DATA.put("SL", "{\"Temne\": 35.5, \"Mende\": 33.2, \"Limba\": 8.4, \"Kono\": 5.2, \"Kuranko\": 4.4, \"Fulani\": 3.4, \"Other\": 9.9}");
        ETHNIC_GROUPS_DATA.put("LR", "{\"Kpelle\": 20.3, \"Bassa\": 13.4, \"Grebo\": 10.0, \"Gio\": 8.0, \"Mano\": 7.9, \"Kru\": 6.0, \"Loma\": 5.1, \"Kissi\": 4.8, \"Gola\": 4.4, \"Krahn\": 4.0, \"Vai\": 4.0, \"Manding\": 3.2, \"Gbandi\": 3.0, \"Mende\": 1.3, \"Sapo\": 1.3, \"Belle\": 1.0, \"Dey\": 0.6, \"Other\": 1.7}");
        ETHNIC_GROUPS_DATA.put("CM", "{\"Bamileke-Bamu\": 24.3, \"Beti/Bassa\": 21.6, \"Biu-Mandara\": 14.6, \"Fulani\": 11.0, \"Adamawa-Ubangi\": 9.6, \"Grassfield\": 7.7, \"Kotoko\": 2.7, \"Arab-Choa\": 2.0, \"Maka\": 1.9, \"Other\": 4.6}");
        ETHNIC_GROUPS_DATA.put("CG", "{\"Kongo\": 40.5, \"Teke\": 16.9, \"Mbochi\": 13.1, \"Sangha\": 5.6, \"Mbere\": 4.4, \"Punu\": 4.3, \"Pygmy\": 1.6, \"Other\": 13.6}");
        ETHNIC_GROUPS_DATA.put("CD", "{\"Kongo\": 16.0, \"Luba\": 13.2, \"Mongo\": 10.1, \"Mangbetu-Azande\": 9.4, \"Rwanda\": 10.1, \"Other\": 41.2}");
        ETHNIC_GROUPS_DATA.put("AO", "{\"Ovimbundu\": 37.0, \"Kimbundu\": 25.0, \"Bakongo\": 13.0, \"Mestico\": 2.0, \"European\": 1.0, \"Other\": 22.0}");
        ETHNIC_GROUPS_DATA.put("ZM", "{\"Bemba\": 21.0, \"Tonga\": 13.6, \"Chewa\": 7.4, \"Lozi\": 5.7, \"Nsenga\": 5.3, \"Tumbuka\": 4.4, \"Ngoni\": 4.0, \"Lala\": 3.1, \"Kaonde\": 2.9, \"Namwanga\": 2.8, \"Lunda\": 2.6, \"Mambwe\": 2.5, \"Luvale\": 2.2, \"Lamba\": 2.1, \"Ushi\": 1.9, \"Lenje\": 1.6, \"Bisa\": 1.6, \"Mbunda\": 1.2, \"Other\": 12.1}");
        ETHNIC_GROUPS_DATA.put("ZW", "{\"Shona\": 82.0, \"Ndebele\": 14.0, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("BW", "{\"Tswana\": 79.0, \"Kalanga\": 11.0, \"Basarwa\": 3.0, \"Other\": 7.0}");
        ETHNIC_GROUPS_DATA.put("NA", "{\"Ovambo\": 50.0, \"Kavango\": 9.0, \"Herero\": 7.0, \"Damara\": 7.0, \"White\": 6.0, \"Nama\": 5.0, \"Other\": 16.0}");
        ETHNIC_GROUPS_DATA.put("ET", "{\"Oromo\": 34.4, \"Amhara\": 27.0, \"Somali\": 6.2, \"Tigray\": 6.1, \"Sidama\": 4.0, \"Gurage\": 2.5, \"Welaita\": 2.3, \"Hadiya\": 1.7, \"Afar\": 1.7, \"Gamo\": 1.5, \"Gedeo\": 1.3, \"Silte\": 1.3, \"Other\": 10.6}");
        ETHNIC_GROUPS_DATA.put("ER", "{\"Tigrinya\": 55.0, \"Tigre\": 30.0, \"Saho\": 4.0, \"Kunama\": 2.0, \"Rashaida\": 2.0, \"Bilen\": 2.0, \"Other\": 5.0}");
        ETHNIC_GROUPS_DATA.put("DJ", "{\"Somali\": 60.0, \"Afar\": 35.0, \"Other\": 5.0}");
        ETHNIC_GROUPS_DATA.put("SO", "{\"Somali\": 85.0, \"Bantu\": 15.0}");
        ETHNIC_GROUPS_DATA.put("SS", "{\"Dinka\": 35.8, \"Nuer\": 15.6, \"Shilluk\": 8.0, \"Azande\": 2.7, \"Bari\": 2.5, \"Other\": 35.4}");
        ETHNIC_GROUPS_DATA.put("UG", "{\"Baganda\": 16.9, \"Banyankole\": 9.5, \"Basoga\": 8.4, \"Bakiga\": 6.9, \"Iteso\": 6.4, \"Langi\": 6.1, \"Acholi\": 4.7, \"Bagisu\": 4.6, \"Lugbara\": 4.2, \"Banyoro\": 2.7, \"Other\": 29.6}");
        ETHNIC_GROUPS_DATA.put("RW", "{\"Hutu\": 84.0, \"Tutsi\": 15.0, \"Twa\": 1.0}");
        ETHNIC_GROUPS_DATA.put("BI", "{\"Hutu\": 85.0, \"Tutsi\": 14.0, \"Twa\": 1.0}");
        ETHNIC_GROUPS_DATA.put("TZ", "{\"Sukuma\": 16.0, \"Nyamwezi\": 5.0, \"Chagga\": 4.7, \"Haya\": 3.7, \"Zaramo\": 3.1, \"Other\": 67.5}");
        ETHNIC_GROUPS_DATA.put("MW", "{\"Chewa\": 34.3, \"Lomwe\": 18.8, \"Yao\": 13.2, \"Ngoni\": 10.4, \"Tumbuka\": 9.2, \"Sena\": 3.8, \"Mang'anja\": 3.2, \"Nyanja\": 1.8, \"Tonga\": 1.8, \"Ngonde\": 1.0, \"Lambya\": 0.9, \"Sukwa\": 0.8, \"Other\": 0.8}");
        ETHNIC_GROUPS_DATA.put("MZ", "{\"Makhuwa\": 26.1, \"Tsonga\": 11.3, \"Lomwe\": 7.8, \"Sena\": 6.6, \"Shona\": 6.5, \"Chopi\": 5.1, \"Ngoni\": 5.0, \"Chwabo\": 4.8, \"Nyanja\": 3.8, \"Tswa\": 3.8, \"Other\": 19.2}");
        ETHNIC_GROUPS_DATA.put("MG", "{\"Malagasy\": 99.0, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("MU", "{\"Indo-Mauritian\": 68.0, \"Creole\": 27.0, \"Sino-Mauritian\": 3.0, \"Franco-Mauritian\": 2.0}");
        ETHNIC_GROUPS_DATA.put("LA", "{\"Lao\": 53.2, \"Khmou\": 11.0, \"Hmong\": 9.2, \"Tai\": 3.4, \"Phouthai\": 3.1, \"Lum\": 2.5, \"Katang\": 2.3, \"Makong\": 2.1, \"Akha\": 1.8, \"Other\": 11.4}");
        ETHNIC_GROUPS_DATA.put("KH", "{\"Khmer\": 97.6, \"Cham\": 1.2, \"Chinese\": 0.1, \"Vietnamese\": 0.1, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("MM", "{\"Burman\": 68.0, \"Shan\": 9.0, \"Karen\": 7.0, \"Rakhine\": 3.5, \"Chinese\": 2.5, \"Mon\": 2.0, \"Kachin\": 1.5, \"Other\": 6.5}");
        ETHNIC_GROUPS_DATA.put("LK", "{\"Sinhalese\": 74.9, \"Sri Lankan Tamil\": 11.2, \"Sri Lankan Moors\": 9.2, \"Indian Tamil\": 4.2, \"Other\": 0.5}");
        ETHNIC_GROUPS_DATA.put("BT", "{\"Ngalop\": 50.0, \"Sharchop\": 15.0, \"Lhotshampa\": 35.0}");
        ETHNIC_GROUPS_DATA.put("NP", "{\"Chhettri\": 16.6, \"Brahman\": 12.2, \"Magar\": 7.1, \"Tharu\": 6.6, \"Tamang\": 5.8, \"Newar\": 5.0, \"Kami\": 4.8, \"Muslim\": 4.4, \"Yadav\": 4.0, \"Rai\": 2.3, \"Gurung\": 2.0, \"Damai\": 1.8, \"Thakuri\": 1.6, \"Limbu\": 1.5, \"Sarki\": 1.4, \"Teli\": 1.4, \"Chamar\": 1.3, \"Koiri\": 1.2, \"Kurmi\": 1.1, \"Other\": 20.1}");
        ETHNIC_GROUPS_DATA.put("MV", "{\"Maldivian\": 100.0}");
        ETHNIC_GROUPS_DATA.put("AF", "{\"Pashtun\": 42.0, \"Tajik\": 27.0, \"Hazara\": 9.0, \"Uzbek\": 9.0, \"Aimak\": 4.0, \"Turkmen\": 3.0, \"Baloch\": 2.0, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("TJ", "{\"Tajik\": 84.3, \"Uzbek\": 13.8, \"Kyrgyz\": 0.8, \"Russian\": 0.5, \"Other\": 0.6}");
        ETHNIC_GROUPS_DATA.put("UZ", "{\"Uzbek\": 83.8, \"Tajik\": 4.8, \"Kazakh\": 2.5, \"Russian\": 2.3, \"Karakalpak\": 2.2, \"Tatar\": 1.5, \"Other\": 2.9}");
        ETHNIC_GROUPS_DATA.put("TM", "{\"Turkmen\": 85.0, \"Uzbek\": 5.0, \"Russian\": 4.0, \"Kazakh\": 2.0, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("KG", "{\"Kyrgyz\": 73.3, \"Uzbek\": 14.6, \"Russian\": 5.6, \"Dungan\": 1.1, \"Uyghur\": 0.9, \"Tajik\": 0.9, \"Turkmen\": 0.7, \"Kazakh\": 0.6, \"Other\": 2.3}");
        ETHNIC_GROUPS_DATA.put("MD", "{\"Moldovan\": 75.1, \"Ukrainian\": 6.6, \"Gagauz\": 4.6, \"Russian\": 4.1, \"Romanian\": 2.7, \"Bulgarian\": 1.9, \"Other\": 5.0}");
        ETHNIC_GROUPS_DATA.put("BA", "{\"Bosniak\": 50.1, \"Serb\": 30.8, \"Croat\": 15.4, \"Other\": 3.7}");
        ETHNIC_GROUPS_DATA.put("MK", "{\"Macedonian\": 58.4, \"Albanian\": 24.3, \"Turkish\": 3.9, \"Roma\": 2.5, \"Serb\": 1.8, \"Bosniak\": 1.0, \"Other\": 8.1}");
        ETHNIC_GROUPS_DATA.put("AM", "{\"Armenian\": 98.1, \"Yezidi\": 1.2, \"Other\": 0.7}");
        ETHNIC_GROUPS_DATA.put("AZ", "{\"Azerbaijani\": 91.6, \"Lezgian\": 2.0, \"Armenian\": 1.3, \"Russian\": 1.3, \"Talysh\": 1.3, \"Other\": 2.5}");
        ETHNIC_GROUPS_DATA.put("GE", "{\"Georgian\": 86.8, \"Azerbaijani\": 6.3, \"Armenian\": 4.5, \"Russian\": 0.7, \"Ossetian\": 0.4, \"Other\": 1.3}");
        ETHNIC_GROUPS_DATA.put("LB", "{\"Arab\": 95.0, \"Armenian\": 4.0, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("JO", "{\"Arab\": 98.0, \"Circassian\": 1.0, \"Armenian\": 1.0}");
        ETHNIC_GROUPS_DATA.put("IQ", "{\"Arab\": 75.0, \"Kurdish\": 15.0, \"Turkmen\": 4.0, \"Assyrian\": 2.0, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("YE", "{\"Arab\": 92.8, \"Somali\": 3.7, \"Other\": 3.5}");
        ETHNIC_GROUPS_DATA.put("SY", "{\"Arab\": 90.3, \"Kurdish\": 9.0, \"Other\": 0.7}");
        ETHNIC_GROUPS_DATA.put("PS", "{\"Arab\": 83.0, \"Jewish\": 17.0}");
        // Europa
        ETHNIC_GROUPS_DATA.put("AD", "{\"Andorran\": 48.8, \"Spanish\": 25.1, \"Portuguese\": 12.0, \"French\": 4.4, \"Other\": 9.7}");
        ETHNIC_GROUPS_DATA.put("AL", "{\"Albanian\": 82.6, \"Greek\": 0.9, \"Other\": 16.5}");
        ETHNIC_GROUPS_DATA.put("AT", "{\"Austrian\": 80.8, \"German\": 2.6, \"Turkish\": 2.3, \"Serbian\": 2.2, \"Other\": 12.1}");
        ETHNIC_GROUPS_DATA.put("BG", "{\"Bulgarian\": 84.8, \"Turkish\": 8.8, \"Roma\": 4.9, \"Other\": 1.5}");
        ETHNIC_GROUPS_DATA.put("BY", "{\"Belarusian\": 83.7, \"Russian\": 8.3, \"Polish\": 3.1, \"Ukrainian\": 1.7, \"Other\": 3.2}");
        ETHNIC_GROUPS_DATA.put("CY", "{\"Greek\": 98.8, \"Other\": 1.2}");
        ETHNIC_GROUPS_DATA.put("CZ", "{\"Czech\": 64.3, \"Moravian\": 5.0, \"Slovak\": 1.4, \"Other\": 29.3}");
        ETHNIC_GROUPS_DATA.put("EE", "{\"Estonian\": 68.7, \"Russian\": 24.8, \"Ukrainian\": 1.7, \"Belarusian\": 0.9, \"Finnish\": 0.6, \"Other\": 3.3}");
        ETHNIC_GROUPS_DATA.put("GG", "{\"British\": 53.1, \"Guernsey\": 31.0, \"Portuguese\": 2.1, \"Other\": 13.8}");
        ETHNIC_GROUPS_DATA.put("HR", "{\"Croat\": 90.4, \"Serb\": 4.4, \"Bosniak\": 0.7, \"Italian\": 0.4, \"Other\": 4.1}");
        ETHNIC_GROUPS_DATA.put("HU", "{\"Hungarian\": 83.7, \"Roma\": 3.1, \"German\": 1.3, \"Other\": 11.9}");
        ETHNIC_GROUPS_DATA.put("IM", "{\"British\": 33.1, \"Manx\": 48.1, \"Irish\": 7.7, \"Other\": 11.1}");
        ETHNIC_GROUPS_DATA.put("IS", "{\"Icelandic\": 81.3, \"Polish\": 5.6, \"Lithuanian\": 1.3, \"Other\": 11.8}");
        ETHNIC_GROUPS_DATA.put("JE", "{\"British\": 46.4, \"Jersey\": 32.7, \"Portuguese\": 8.2, \"Irish\": 3.3, \"Other\": 9.4}");
        ETHNIC_GROUPS_DATA.put("LI", "{\"Liechtensteiner\": 65.6, \"Swiss\": 9.6, \"Austrian\": 5.8, \"German\": 4.5, \"Italian\": 3.1, \"Other\": 11.4}");
        ETHNIC_GROUPS_DATA.put("LT", "{\"Lithuanian\": 84.1, \"Polish\": 6.6, \"Russian\": 5.8, \"Belarusian\": 1.2, \"Other\": 2.3}");
        ETHNIC_GROUPS_DATA.put("LU", "{\"Luxembourger\": 51.1, \"Portuguese\": 15.7, \"French\": 7.5, \"Italian\": 3.6, \"Belgian\": 3.3, \"German\": 2.1, \"Other\": 16.7}");
        ETHNIC_GROUPS_DATA.put("LV", "{\"Latvian\": 62.7, \"Russian\": 25.4, \"Belarusian\": 3.3, \"Ukrainian\": 2.2, \"Polish\": 2.1, \"Other\": 4.3}");
        ETHNIC_GROUPS_DATA.put("MC", "{\"French\": 28.4, \"Monegasque\": 21.6, \"Italian\": 18.7, \"British\": 7.5, \"Belgian\": 2.8, \"Swiss\": 2.5, \"German\": 2.5, \"Other\": 16.0}");
        ETHNIC_GROUPS_DATA.put("ME", "{\"Montenegrin\": 45.0, \"Serb\": 28.7, \"Bosniak\": 8.6, \"Albanian\": 4.9, \"Other\": 12.8}");
        ETHNIC_GROUPS_DATA.put("MT", "{\"Maltese\": 95.3, \"British\": 1.6, \"Other\": 3.1}");
        ETHNIC_GROUPS_DATA.put("RO", "{\"Romanian\": 83.4, \"Hungarian\": 6.1, \"Roma\": 3.1, \"Ukrainian\": 0.3, \"German\": 0.2, \"Other\": 6.9}");
        ETHNIC_GROUPS_DATA.put("RS", "{\"Serb\": 83.3, \"Hungarian\": 3.5, \"Roma\": 2.1, \"Bosniak\": 2.0, \"Other\": 9.1}");
        ETHNIC_GROUPS_DATA.put("SI", "{\"Slovene\": 83.1, \"Serb\": 2.0, \"Croat\": 1.8, \"Bosniak\": 1.6, \"Other\": 11.5}");
        ETHNIC_GROUPS_DATA.put("SK", "{\"Slovak\": 83.8, \"Hungarian\": 7.7, \"Roma\": 2.0, \"Czech\": 0.6, \"Other\": 5.9}");
        ETHNIC_GROUPS_DATA.put("SM", "{\"Sammarinese\": 84.1, \"Italian\": 14.6, \"Other\": 1.3}");
        ETHNIC_GROUPS_DATA.put("UA", "{\"Ukrainian\": 77.8, \"Russian\": 17.3, \"Belarusian\": 0.6, \"Moldovan\": 0.5, \"Crimean Tatar\": 0.5, \"Bulgarian\": 0.4, \"Hungarian\": 0.3, \"Roma\": 0.3, \"Polish\": 0.3, \"Other\": 2.0}");
        ETHNIC_GROUPS_DATA.put("VA", "{\"Italian\": 50.0, \"Swiss\": 20.0, \"Other\": 30.0}");
        ETHNIC_GROUPS_DATA.put("XK", "{\"Albanian\": 92.9, \"Serb\": 1.5, \"Bosniak\": 1.6, \"Turk\": 1.1, \"Roma\": 0.3, \"Other\": 2.6}");
        // Ásia
        ETHNIC_GROUPS_DATA.put("AE", "{\"Emirati\": 11.6, \"South Asian\": 59.4, \"Egyptian\": 10.2, \"Filipino\": 6.1, \"Other\": 12.7}");
        ETHNIC_GROUPS_DATA.put("BD", "{\"Bengali\": 98.0, \"Other\": 2.0}");
        ETHNIC_GROUPS_DATA.put("BH", "{\"Bahraini\": 46.0, \"Asian\": 45.5, \"Other Arab\": 4.7, \"African\": 1.6, \"European\": 1.0, \"Other\": 1.2}");
        ETHNIC_GROUPS_DATA.put("BN", "{\"Malay\": 65.7, \"Chinese\": 10.3, \"Other\": 24.0}");
        ETHNIC_GROUPS_DATA.put("HK", "{\"Chinese\": 91.6, \"Filipino\": 2.7, \"Indonesian\": 1.9, \"Other\": 3.8}");
        ETHNIC_GROUPS_DATA.put("KP", "{\"Korean\": 99.8, \"Other\": 0.2}");
        ETHNIC_GROUPS_DATA.put("KW", "{\"Kuwaiti\": 30.4, \"Other Arab\": 27.4, \"Asian\": 40.3, \"African\": 1.0, \"Other\": 0.9}");
        ETHNIC_GROUPS_DATA.put("KZ", "{\"Kazakh\": 68.0, \"Russian\": 19.3, \"Uzbek\": 3.2, \"Ukrainian\": 1.5, \"Uyghur\": 1.5, \"Tatar\": 1.1, \"German\": 1.0, \"Other\": 4.4}");
        ETHNIC_GROUPS_DATA.put("MN", "{\"Mongol\": 94.9, \"Kazakh\": 5.0, \"Other\": 0.1}");
        ETHNIC_GROUPS_DATA.put("MO", "{\"Chinese\": 88.7, \"Portuguese\": 1.1, \"Other\": 10.2}");
        ETHNIC_GROUPS_DATA.put("MY", "{\"Bumiputera\": 69.8, \"Chinese\": 22.4, \"Indian\": 6.8, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("OM", "{\"Arab\": 56.4, \"Baluchi\": 3.0, \"African\": 4.2, \"South Asian\": 36.4}");
        ETHNIC_GROUPS_DATA.put("QA", "{\"Qatari\": 11.6, \"Other Arab\": 13.0, \"South Asian\": 40.0, \"Filipino\": 18.0, \"Other\": 17.4}");
        ETHNIC_GROUPS_DATA.put("SG", "{\"Chinese\": 74.3, \"Malay\": 13.5, \"Indian\": 9.0, \"Other\": 3.2}");
        ETHNIC_GROUPS_DATA.put("TW", "{\"Han\": 95.0, \"Indigenous\": 2.3, \"Other\": 2.7}");
        // Américas
        ETHNIC_GROUPS_DATA.put("AG", "{\"African descent\": 87.3, \"Mixed\": 4.7, \"Hispanic\": 2.7, \"White\": 1.6, \"Other\": 3.7}");
        ETHNIC_GROUPS_DATA.put("BB", "{\"African descent\": 92.4, \"Mixed\": 3.1, \"White\": 2.7, \"East Indian\": 1.3, \"Other\": 0.5}");
        ETHNIC_GROUPS_DATA.put("BO", "{\"Mestizo\": 68.0, \"Indigenous\": 20.0, \"White\": 5.0, \"Cholo\": 2.0, \"Black\": 1.0, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("BS", "{\"African descent\": 90.6, \"White\": 4.7, \"Mixed\": 2.1, \"Other\": 2.6}");
        ETHNIC_GROUPS_DATA.put("BZ", "{\"Mestizo\": 52.9, \"Creole\": 25.9, \"Maya\": 11.3, \"Garifuna\": 6.1, \"East Indian\": 3.9, \"Other\": 0.9}");
        ETHNIC_GROUPS_DATA.put("CR", "{\"White or Mestizo\": 83.6, \"Mulatto\": 6.7, \"Indigenous\": 2.4, \"Black\": 1.1, \"Other\": 6.2}");
        ETHNIC_GROUPS_DATA.put("CU", "{\"White\": 64.1, \"Mixed\": 26.6, \"Black\": 9.3}");
        ETHNIC_GROUPS_DATA.put("DM", "{\"African descent\": 84.5, \"Mixed\": 9.0, \"Indigenous\": 3.8, \"Other\": 2.7}");
        ETHNIC_GROUPS_DATA.put("DO", "{\"Mixed\": 70.4, \"Black\": 15.8, \"White\": 13.5, \"Other\": 0.3}");
        ETHNIC_GROUPS_DATA.put("GD", "{\"African descent\": 82.4, \"Mixed\": 13.3, \"East Indian\": 2.2, \"Other\": 2.1}");
        ETHNIC_GROUPS_DATA.put("GF", "{\"Creole\": 40.0, \"French\": 14.0, \"Guianese\": 9.0, \"Haitian\": 7.0, \"Other\": 30.0}");
        ETHNIC_GROUPS_DATA.put("GT", "{\"Mestizo\": 56.0, \"Indigenous\": 41.7, \"White\": 1.8, \"Other\": 0.5}");
        ETHNIC_GROUPS_DATA.put("GY", "{\"East Indian\": 39.8, \"African descent\": 29.3, \"Mixed\": 19.9, \"Indigenous\": 10.5, \"Other\": 0.5}");
        ETHNIC_GROUPS_DATA.put("HN", "{\"Mestizo\": 90.0, \"Indigenous\": 7.0, \"Black\": 2.0, \"White\": 1.0}");
        ETHNIC_GROUPS_DATA.put("HT", "{\"Black\": 95.0, \"Mixed\": 5.0}");
        ETHNIC_GROUPS_DATA.put("JM", "{\"African descent\": 92.1, \"Mixed\": 6.1, \"East Indian\": 0.8, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("KN", "{\"African descent\": 92.5, \"Mixed\": 3.0, \"White\": 2.1, \"East Indian\": 1.5, \"Other\": 0.9}");
        ETHNIC_GROUPS_DATA.put("LC", "{\"African descent\": 85.3, \"Mixed\": 10.9, \"East Indian\": 2.2, \"Other\": 1.6}");
        ETHNIC_GROUPS_DATA.put("NI", "{\"Mestizo\": 69.0, \"White\": 17.0, \"Black\": 9.0, \"Indigenous\": 5.0}");
        ETHNIC_GROUPS_DATA.put("PA", "{\"Mestizo\": 65.0, \"Indigenous\": 12.3, \"African descent\": 9.2, \"Mulatto\": 6.8, \"White\": 6.7}");
        ETHNIC_GROUPS_DATA.put("PR", "{\"White\": 75.8, \"Black\": 12.4, \"Other\": 8.5, \"Mixed\": 3.3}");
        ETHNIC_GROUPS_DATA.put("PY", "{\"Mestizo\": 95.0, \"White\": 3.0, \"Indigenous\": 1.8, \"Other\": 0.2}");
        ETHNIC_GROUPS_DATA.put("SR", "{\"East Indian\": 27.4, \"Maroon\": 21.7, \"Creole\": 15.7, \"Javanese\": 13.7, \"Mixed\": 13.4, \"Other\": 8.1}");
        ETHNIC_GROUPS_DATA.put("SV", "{\"Mestizo\": 86.3, \"White\": 12.7, \"Indigenous\": 0.2, \"Black\": 0.1, \"Other\": 0.7}");
        ETHNIC_GROUPS_DATA.put("TT", "{\"East Indian\": 35.4, \"African descent\": 34.2, \"Mixed\": 23.0, \"Other\": 7.4}");
        ETHNIC_GROUPS_DATA.put("VC", "{\"African descent\": 71.2, \"Mixed\": 23.0, \"East Indian\": 3.0, \"European\": 1.0, \"Carib Amerindian\": 1.8}");
        // África
        ETHNIC_GROUPS_DATA.put("CF", "{\"Baya\": 28.8, \"Banda\": 22.9, \"Mandjia\": 9.9, \"Sara\": 7.9, \"M'Baka\": 7.9, \"Fulani\": 6.0, \"Mboum\": 4.2, \"Yakoma\": 4.0, \"Other\": 8.4}");
        ETHNIC_GROUPS_DATA.put("DZ", "{\"Arab-Berber\": 99.0, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("GA", "{\"Fang\": 85.7, \"Nzebi\": 4.2, \"Obamba\": 3.4, \"Punu\": 2.3, \"Other\": 4.4}");
        ETHNIC_GROUPS_DATA.put("GM", "{\"Mandinka\": 34.0, \"Fulani\": 24.0, \"Wolof\": 14.0, \"Jola\": 10.0, \"Serahule\": 8.0, \"Other\": 10.0}");
        ETHNIC_GROUPS_DATA.put("GQ", "{\"Fang\": 85.7, \"Bubi\": 6.5, \"Ndowe\": 3.6, \"Annobon\": 1.6, \"Bujeba\": 1.1, \"Other\": 1.5}");
        ETHNIC_GROUPS_DATA.put("GW", "{\"Fulani\": 28.5, \"Balanta\": 22.5, \"Mandinka\": 14.7, \"Papel\": 9.1, \"Manjaco\": 8.3, \"Other\": 16.9}");
        ETHNIC_GROUPS_DATA.put("KM", "{\"Antalote\": 0.3, \"Cafre\": 0.2, \"Makoa\": 0.2, \"Oimatsaha\": 0.1, \"Sakalava\": 0.1, \"Other\": 99.1}");
        ETHNIC_GROUPS_DATA.put("LY", "{\"Arab-Berber\": 97.0, \"Other\": 3.0}");
        ETHNIC_GROUPS_DATA.put("MA", "{\"Arab-Berber\": 99.0, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("SC", "{\"Creole\": 89.1, \"French\": 0.5, \"Indian\": 4.7, \"Malagasy\": 1.6, \"Chinese\": 0.3, \"Other\": 3.8}");
        ETHNIC_GROUPS_DATA.put("ST", "{\"Mestico\": 71.9, \"Angolares\": 9.7, \"Forros\": 6.6, \"Europeans\": 1.0, \"Tongas\": 1.0, \"Other\": 9.8}");
        ETHNIC_GROUPS_DATA.put("TN", "{\"Arab\": 98.0, \"European\": 1.0, \"Jewish\": 1.0}");
        // Oceania
        ETHNIC_GROUPS_DATA.put("FJ", "{\"iTaukei\": 56.8, \"Indo-Fijian\": 37.5, \"Rotuman\": 1.2, \"Other\": 4.5}");
        ETHNIC_GROUPS_DATA.put("FK", "{\"Falkland Islander\": 48.3, \"British\": 23.1, \"St. Helenian\": 7.5, \"Chilean\": 4.6, \"Other\": 16.5}");
        ETHNIC_GROUPS_DATA.put("KI", "{\"I-Kiribati\": 96.2, \"I-Kiribati/Mixed\": 1.8, \"Tuvaluan\": 0.2, \"Other\": 1.8}");
        ETHNIC_GROUPS_DATA.put("MH", "{\"Marshallese\": 92.1, \"Mixed Marshallese\": 5.9, \"Other\": 2.0}");
        ETHNIC_GROUPS_DATA.put("NC", "{\"Kanak\": 39.1, \"European\": 27.2, \"Wallisian\": 8.2, \"Tahitian\": 2.1, \"Indonesian\": 1.4, \"Vietnamese\": 0.9, \"Other\": 21.1}");
        ETHNIC_GROUPS_DATA.put("NR", "{\"Nauruan\": 88.9, \"Other Pacific Islander\": 6.6, \"Chinese\": 1.5, \"European\": 1.0, \"Other\": 2.0}");
        ETHNIC_GROUPS_DATA.put("PF", "{\"Polynesian\": 78.0, \"Chinese\": 12.0, \"French\": 6.0, \"Other\": 4.0}");
        ETHNIC_GROUPS_DATA.put("PG", "{\"Melanesian\": 99.0, \"Other\": 1.0}");
        ETHNIC_GROUPS_DATA.put("PW", "{\"Palauan\": 73.0, \"Filipino\": 21.2, \"Chinese\": 1.2, \"Other Asian\": 2.0, \"White\": 0.9, \"Other\": 1.7}");
        ETHNIC_GROUPS_DATA.put("SB", "{\"Melanesian\": 95.3, \"Polynesian\": 3.1, \"Micronesian\": 1.2, \"Other\": 0.4}");
        ETHNIC_GROUPS_DATA.put("TO", "{\"Tongan\": 96.6, \"Mixed\": 1.7, \"Other\": 1.7}");
        ETHNIC_GROUPS_DATA.put("TV", "{\"Tuvaluan\": 96.0, \"Tuvaluan/I-Kiribati\": 1.6, \"Other\": 2.4}");
        ETHNIC_GROUPS_DATA.put("VU", "{\"Ni-Vanuatu\": 98.5, \"Other\": 1.5}");
        ETHNIC_GROUPS_DATA.put("WS", "{\"Samoan\": 96.0, \"Euronesian\": 2.0, \"European\": 1.0, \"Other\": 1.0}");
        // Outros
        ETHNIC_GROUPS_DATA.put("FM", "{\"Chuukese\": 48.8, \"Pohnpeian\": 24.2, \"Kosraean\": 6.2, \"Yapese\": 5.2, \"Yap outer island\": 4.5, \"Asian\": 1.8, \"Polynesian\": 1.5, \"Other\": 7.8}");
        ETHNIC_GROUPS_DATA.put("TL", "{\"Tetun\": 26.0, \"Mambai\": 12.0, \"Makasae\": 10.0, \"Fataluku\": 9.0, \"Bunak\": 8.0, \"Kemak\": 5.0, \"Baikeno\": 4.0, \"Other\": 26.0}");
    }
    
    // Mapeamento de códigos ISO2 para nomes de países em inglês
    private static final Map<String, String> COUNTRY_NAMES_EN = new HashMap<>();
    
    static {
        COUNTRY_NAMES_EN.put("CH", "Switzerland"); COUNTRY_NAMES_EN.put("NO", "Norway"); COUNTRY_NAMES_EN.put("IS", "Iceland"); COUNTRY_NAMES_EN.put("HK", "Hong Kong");
        COUNTRY_NAMES_EN.put("DK", "Denmark"); COUNTRY_NAMES_EN.put("SE", "Sweden"); COUNTRY_NAMES_EN.put("IE", "Ireland"); COUNTRY_NAMES_EN.put("DE", "Germany");
        COUNTRY_NAMES_EN.put("AU", "Australia"); COUNTRY_NAMES_EN.put("NL", "Netherlands"); COUNTRY_NAMES_EN.put("FI", "Finland"); COUNTRY_NAMES_EN.put("SG", "Singapore");
        COUNTRY_NAMES_EN.put("BE", "Belgium"); COUNTRY_NAMES_EN.put("NZ", "New Zealand"); COUNTRY_NAMES_EN.put("CA", "Canada"); COUNTRY_NAMES_EN.put("LI", "Liechtenstein");
        COUNTRY_NAMES_EN.put("LU", "Luxembourg"); COUNTRY_NAMES_EN.put("GB", "United Kingdom"); COUNTRY_NAMES_EN.put("JP", "Japan"); COUNTRY_NAMES_EN.put("KR", "South Korea");
        COUNTRY_NAMES_EN.put("US", "United States"); COUNTRY_NAMES_EN.put("IL", "Israel"); COUNTRY_NAMES_EN.put("MT", "Malta"); COUNTRY_NAMES_EN.put("EE", "Estonia");
        COUNTRY_NAMES_EN.put("ES", "Spain"); COUNTRY_NAMES_EN.put("FR", "France"); COUNTRY_NAMES_EN.put("CY", "Cyprus"); COUNTRY_NAMES_EN.put("IT", "Italy");
        COUNTRY_NAMES_EN.put("SI", "Slovenia"); COUNTRY_NAMES_EN.put("CZ", "Czech Republic"); COUNTRY_NAMES_EN.put("GR", "Greece"); COUNTRY_NAMES_EN.put("PL", "Poland");
        COUNTRY_NAMES_EN.put("LT", "Lithuania"); COUNTRY_NAMES_EN.put("PT", "Portugal"); COUNTRY_NAMES_EN.put("SK", "Slovakia"); COUNTRY_NAMES_EN.put("HR", "Croatia");
        COUNTRY_NAMES_EN.put("HU", "Hungary"); COUNTRY_NAMES_EN.put("RU", "Russia"); COUNTRY_NAMES_EN.put("RO", "Romania"); COUNTRY_NAMES_EN.put("BG", "Bulgaria");
        COUNTRY_NAMES_EN.put("TR", "Turkey"); COUNTRY_NAMES_EN.put("AE", "United Arab Emirates"); COUNTRY_NAMES_EN.put("SA", "Saudi Arabia"); COUNTRY_NAMES_EN.put("QA", "Qatar");
        COUNTRY_NAMES_EN.put("BH", "Bahrain"); COUNTRY_NAMES_EN.put("KW", "Kuwait"); COUNTRY_NAMES_EN.put("OM", "Oman"); COUNTRY_NAMES_EN.put("KZ", "Kazakhstan");
        COUNTRY_NAMES_EN.put("BY", "Belarus"); COUNTRY_NAMES_EN.put("UY", "Uruguay"); COUNTRY_NAMES_EN.put("CR", "Costa Rica"); COUNTRY_NAMES_EN.put("PA", "Panama");
        COUNTRY_NAMES_EN.put("MY", "Malaysia"); COUNTRY_NAMES_EN.put("TH", "Thailand"); COUNTRY_NAMES_EN.put("AT", "Austria"); COUNTRY_NAMES_EN.put("LV", "Latvia");
        COUNTRY_NAMES_EN.put("MC", "Monaco"); COUNTRY_NAMES_EN.put("AD", "Andorra"); COUNTRY_NAMES_EN.put("SM", "San Marino"); COUNTRY_NAMES_EN.put("VA", "Vatican City");
        COUNTRY_NAMES_EN.put("TW", "Taiwan"); COUNTRY_NAMES_EN.put("MO", "Macao"); COUNTRY_NAMES_EN.put("BS", "Bahamas"); COUNTRY_NAMES_EN.put("TT", "Trinidad and Tobago");
        COUNTRY_NAMES_EN.put("BN", "Brunei"); COUNTRY_NAMES_EN.put("ME", "Montenegro"); COUNTRY_NAMES_EN.put("RS", "Serbia"); COUNTRY_NAMES_EN.put("GE", "Georgia");
        COUNTRY_NAMES_EN.put("MU", "Mauritius"); COUNTRY_NAMES_EN.put("PR", "Puerto Rico"); COUNTRY_NAMES_EN.put("AG", "Antigua and Barbuda"); COUNTRY_NAMES_EN.put("BB", "Barbados");
        COUNTRY_NAMES_EN.put("GD", "Grenada"); COUNTRY_NAMES_EN.put("AL", "Albania"); COUNTRY_NAMES_EN.put("NC", "New Caledonia"); COUNTRY_NAMES_EN.put("PF", "French Polynesia");
        COUNTRY_NAMES_EN.put("FK", "Falkland Islands"); COUNTRY_NAMES_EN.put("IM", "Isle of Man"); COUNTRY_NAMES_EN.put("JE", "Jersey"); COUNTRY_NAMES_EN.put("GG", "Guernsey");
        COUNTRY_NAMES_EN.put("BR", "Brazil"); COUNTRY_NAMES_EN.put("MX", "Mexico"); COUNTRY_NAMES_EN.put("AR", "Argentina"); COUNTRY_NAMES_EN.put("CL", "Chile");
        COUNTRY_NAMES_EN.put("CO", "Colombia"); COUNTRY_NAMES_EN.put("PE", "Peru"); COUNTRY_NAMES_EN.put("VE", "Venezuela"); COUNTRY_NAMES_EN.put("EC", "Ecuador");
        COUNTRY_NAMES_EN.put("CN", "China"); COUNTRY_NAMES_EN.put("ID", "Indonesia"); COUNTRY_NAMES_EN.put("VN", "Vietnam"); COUNTRY_NAMES_EN.put("PH", "Philippines");
        COUNTRY_NAMES_EN.put("ZA", "South Africa"); COUNTRY_NAMES_EN.put("EG", "Egypt"); COUNTRY_NAMES_EN.put("DZ", "Algeria"); COUNTRY_NAMES_EN.put("UA", "Ukraine");
        COUNTRY_NAMES_EN.put("BA", "Bosnia and Herzegovina"); COUNTRY_NAMES_EN.put("MK", "North Macedonia"); COUNTRY_NAMES_EN.put("AM", "Armenia"); COUNTRY_NAMES_EN.put("AZ", "Azerbaijan");
        COUNTRY_NAMES_EN.put("LB", "Lebanon"); COUNTRY_NAMES_EN.put("JO", "Jordan"); COUNTRY_NAMES_EN.put("IR", "Iran"); COUNTRY_NAMES_EN.put("IQ", "Iraq");
        COUNTRY_NAMES_EN.put("MA", "Morocco"); COUNTRY_NAMES_EN.put("TN", "Tunisia"); COUNTRY_NAMES_EN.put("LY", "Libya"); COUNTRY_NAMES_EN.put("BO", "Bolivia");
        COUNTRY_NAMES_EN.put("PY", "Paraguay"); COUNTRY_NAMES_EN.put("GT", "Guatemala"); COUNTRY_NAMES_EN.put("HN", "Honduras"); COUNTRY_NAMES_EN.put("NI", "Nicaragua");
        COUNTRY_NAMES_EN.put("SV", "El Salvador"); COUNTRY_NAMES_EN.put("DO", "Dominican Republic"); COUNTRY_NAMES_EN.put("JM", "Jamaica"); COUNTRY_NAMES_EN.put("CU", "Cuba");
        COUNTRY_NAMES_EN.put("GY", "Guyana"); COUNTRY_NAMES_EN.put("SR", "Suriname"); COUNTRY_NAMES_EN.put("FJ", "Fiji"); COUNTRY_NAMES_EN.put("WS", "Samoa");
        COUNTRY_NAMES_EN.put("TO", "Tonga"); COUNTRY_NAMES_EN.put("VU", "Vanuatu"); COUNTRY_NAMES_EN.put("PG", "Papua New Guinea"); COUNTRY_NAMES_EN.put("SB", "Solomon Islands");
        COUNTRY_NAMES_EN.put("KI", "Kiribati"); COUNTRY_NAMES_EN.put("TV", "Tuvalu"); COUNTRY_NAMES_EN.put("NR", "Nauru"); COUNTRY_NAMES_EN.put("MH", "Marshall Islands");
        COUNTRY_NAMES_EN.put("FM", "Micronesia"); COUNTRY_NAMES_EN.put("PW", "Palau"); COUNTRY_NAMES_EN.put("MN", "Mongolia"); COUNTRY_NAMES_EN.put("LA", "Laos");
        COUNTRY_NAMES_EN.put("KH", "Cambodia"); COUNTRY_NAMES_EN.put("MM", "Myanmar"); COUNTRY_NAMES_EN.put("LK", "Sri Lanka"); COUNTRY_NAMES_EN.put("BD", "Bangladesh");
        COUNTRY_NAMES_EN.put("BT", "Bhutan"); COUNTRY_NAMES_EN.put("NP", "Nepal"); COUNTRY_NAMES_EN.put("MV", "Maldives"); COUNTRY_NAMES_EN.put("AF", "Afghanistan");
        COUNTRY_NAMES_EN.put("PK", "Pakistan"); COUNTRY_NAMES_EN.put("TJ", "Tajikistan"); COUNTRY_NAMES_EN.put("UZ", "Uzbekistan"); COUNTRY_NAMES_EN.put("TM", "Turkmenistan");
        COUNTRY_NAMES_EN.put("KG", "Kyrgyzstan"); COUNTRY_NAMES_EN.put("MD", "Moldova"); COUNTRY_NAMES_EN.put("XK", "Kosovo"); COUNTRY_NAMES_EN.put("BW", "Botswana");
        COUNTRY_NAMES_EN.put("NA", "Namibia"); COUNTRY_NAMES_EN.put("ZW", "Zimbabwe"); COUNTRY_NAMES_EN.put("ZM", "Zambia"); COUNTRY_NAMES_EN.put("MW", "Malawi");
        COUNTRY_NAMES_EN.put("MZ", "Mozambique"); COUNTRY_NAMES_EN.put("MG", "Madagascar"); COUNTRY_NAMES_EN.put("SC", "Seychelles"); COUNTRY_NAMES_EN.put("KM", "Comoros");
        COUNTRY_NAMES_EN.put("DJ", "Djibouti"); COUNTRY_NAMES_EN.put("ET", "Ethiopia"); COUNTRY_NAMES_EN.put("ER", "Eritrea"); COUNTRY_NAMES_EN.put("SD", "Sudan");
        COUNTRY_NAMES_EN.put("SS", "South Sudan"); COUNTRY_NAMES_EN.put("UG", "Uganda"); COUNTRY_NAMES_EN.put("RW", "Rwanda"); COUNTRY_NAMES_EN.put("BI", "Burundi");
        COUNTRY_NAMES_EN.put("TZ", "Tanzania"); COUNTRY_NAMES_EN.put("KE", "Kenya"); COUNTRY_NAMES_EN.put("SO", "Somalia"); COUNTRY_NAMES_EN.put("GH", "Ghana");
        COUNTRY_NAMES_EN.put("TG", "Togo"); COUNTRY_NAMES_EN.put("BJ", "Benin"); COUNTRY_NAMES_EN.put("BF", "Burkina Faso"); COUNTRY_NAMES_EN.put("ML", "Mali");
        COUNTRY_NAMES_EN.put("NE", "Niger"); COUNTRY_NAMES_EN.put("NG", "Nigeria"); COUNTRY_NAMES_EN.put("TD", "Chad"); COUNTRY_NAMES_EN.put("CF", "Central African Republic");
        COUNTRY_NAMES_EN.put("CM", "Cameroon"); COUNTRY_NAMES_EN.put("GQ", "Equatorial Guinea"); COUNTRY_NAMES_EN.put("GA", "Gabon"); COUNTRY_NAMES_EN.put("CG", "Congo");
        COUNTRY_NAMES_EN.put("CD", "DR Congo"); COUNTRY_NAMES_EN.put("AO", "Angola"); COUNTRY_NAMES_EN.put("ST", "São Tomé and Príncipe"); COUNTRY_NAMES_EN.put("GW", "Guinea-Bissau");
        COUNTRY_NAMES_EN.put("GN", "Guinea"); COUNTRY_NAMES_EN.put("SL", "Sierra Leone"); COUNTRY_NAMES_EN.put("LR", "Liberia"); COUNTRY_NAMES_EN.put("CI", "Ivory Coast");
        COUNTRY_NAMES_EN.put("SN", "Senegal"); COUNTRY_NAMES_EN.put("GM", "Gambia"); COUNTRY_NAMES_EN.put("MR", "Mauritania"); COUNTRY_NAMES_EN.put("YE", "Yemen");
        COUNTRY_NAMES_EN.put("SY", "Syria"); COUNTRY_NAMES_EN.put("PS", "Palestine"); COUNTRY_NAMES_EN.put("BZ", "Belize"); COUNTRY_NAMES_EN.put("LC", "Saint Lucia");
        COUNTRY_NAMES_EN.put("VC", "Saint Vincent and the Grenadines"); COUNTRY_NAMES_EN.put("DM", "Dominica"); COUNTRY_NAMES_EN.put("KN", "Saint Kitts and Nevis");
        COUNTRY_NAMES_EN.put("GF", "French Guiana"); COUNTRY_NAMES_EN.put("HT", "Haiti"); COUNTRY_NAMES_EN.put("TL", "East Timor"); COUNTRY_NAMES_EN.put("KP", "North Korea");
        COUNTRY_NAMES_EN.put("IN", "India");
    }
    
    // Mapeamento ISO2 -> ISO3 para World Bank API
    private static final Map<String, String> ISO2_TO_ISO3 = Map.ofEntries(
        Map.entry("US", "USA"), Map.entry("GB", "GBR"), Map.entry("CA", "CAN"), Map.entry("BR", "BRA"),
        Map.entry("FR", "FRA"), Map.entry("DE", "DEU"), Map.entry("IT", "ITA"), Map.entry("ES", "ESP"),
        Map.entry("NL", "NLD"), Map.entry("BE", "BEL"), Map.entry("CH", "CHE"), Map.entry("AT", "AUT"),
        Map.entry("SE", "SWE"), Map.entry("NO", "NOR"), Map.entry("DK", "DNK"), Map.entry("FI", "FIN"),
        Map.entry("PL", "POL"), Map.entry("CZ", "CZE"), Map.entry("HU", "HUN"), Map.entry("GR", "GRC"),
        Map.entry("PT", "PRT"), Map.entry("IE", "IRL"), Map.entry("AU", "AUS"), Map.entry("NZ", "NZL"),
        Map.entry("JP", "JPN"), Map.entry("CN", "CHN"), Map.entry("IN", "IND"), Map.entry("KR", "KOR"),
        Map.entry("SG", "SGP"), Map.entry("MY", "MYS"), Map.entry("TH", "THA"), Map.entry("VN", "VNM"),
        Map.entry("ID", "IDN"), Map.entry("PH", "PHL"), Map.entry("MX", "MEX"), Map.entry("AR", "ARG"),
        Map.entry("CL", "CHL"), Map.entry("CO", "COL"), Map.entry("PE", "PER"), Map.entry("ZA", "ZAF"),
        Map.entry("EG", "EGY"), Map.entry("NG", "NGA"), Map.entry("KE", "KEN"), Map.entry("MA", "MAR"),
        Map.entry("DZ", "DZA"), Map.entry("TR", "TUR"), Map.entry("SA", "SAU"), Map.entry("AE", "ARE"),
        Map.entry("IL", "ISR"), Map.entry("PK", "PAK"), Map.entry("BD", "BGD"), Map.entry("RU", "RUS"),
        Map.entry("UA", "UKR"), Map.entry("RO", "ROU"), Map.entry("BG", "BGR"), Map.entry("HR", "HRV"),
        Map.entry("SI", "SVN"), Map.entry("SK", "SVK"), Map.entry("LT", "LTU"), Map.entry("LV", "LVA"),
        Map.entry("EE", "EST"), Map.entry("IS", "ISL"), Map.entry("LU", "LUX"), Map.entry("MT", "MLT"),
        Map.entry("CY", "CYP"),
        // Países africanos adicionais
        Map.entry("ML", "MLI"), Map.entry("SD", "SDN"), Map.entry("SN", "SEN"), Map.entry("MR", "MRT"),
        Map.entry("NE", "NER"), Map.entry("TD", "TCD"), Map.entry("BF", "BFA"), Map.entry("BJ", "BEN"),
        Map.entry("TG", "TGO"), Map.entry("GH", "GHA"), Map.entry("CI", "CIV"), Map.entry("GN", "GIN"),
        Map.entry("SL", "SLE"), Map.entry("LR", "LBR"), Map.entry("CM", "CMR"), Map.entry("CG", "COG"),
        Map.entry("CD", "COD"), Map.entry("AO", "AGO"), Map.entry("ZM", "ZMB"), Map.entry("ZW", "ZWE"),
        Map.entry("BW", "BWA"), Map.entry("NA", "NAM"), Map.entry("ET", "ETH"), Map.entry("ER", "ERI"),
        Map.entry("DJ", "DJI"), Map.entry("SO", "SOM"), Map.entry("SS", "SSD"), Map.entry("UG", "UGA"),
        Map.entry("RW", "RWA"), Map.entry("BI", "BDI"), Map.entry("TZ", "TZA"), Map.entry("MW", "MWI"),
        Map.entry("MZ", "MOZ"), Map.entry("MG", "MDG"), Map.entry("MU", "MUS"), Map.entry("SC", "SYC"),
        Map.entry("KM", "COM"), Map.entry("LY", "LBY"), Map.entry("TN", "TUN"), Map.entry("VE", "VEN"),
        Map.entry("EC", "ECU"), Map.entry("UY", "URY"), Map.entry("PY", "PRY"), Map.entry("BO", "BOL"),
        Map.entry("GT", "GTM"), Map.entry("HN", "HND"), Map.entry("NI", "NIC"), Map.entry("SV", "SLV"),
        Map.entry("CR", "CRI"), Map.entry("PA", "PAN"), Map.entry("DO", "DOM"), Map.entry("JM", "JAM"),
        Map.entry("CU", "CUB"), Map.entry("GY", "GUY"), Map.entry("SR", "SUR"), Map.entry("FJ", "FJI"),
        Map.entry("WS", "WSM"), Map.entry("TO", "TON"), Map.entry("VU", "VUT"), Map.entry("PG", "PNG"),
        Map.entry("SB", "SLB"), Map.entry("KI", "KIR"), Map.entry("TV", "TUV"), Map.entry("NR", "NRU"),
        Map.entry("MH", "MHL"), Map.entry("FM", "FSM"), Map.entry("PW", "PLW"), Map.entry("BN", "BRN"),
        Map.entry("MN", "MNG"), Map.entry("LA", "LAO"), Map.entry("KH", "KHM"), Map.entry("MM", "MMR"),
        Map.entry("LK", "LKA"), Map.entry("BT", "BTN"), Map.entry("NP", "NPL"), Map.entry("MV", "MDV"),
        Map.entry("AF", "AFG"), Map.entry("TJ", "TJK"), Map.entry("UZ", "UZB"), Map.entry("TM", "TKM"),
        Map.entry("KG", "KGZ"), Map.entry("MD", "MDA"), Map.entry("XK", "XKX"), Map.entry("BA", "BIH"),
        Map.entry("MK", "MKD"), Map.entry("AM", "ARM"), Map.entry("AZ", "AZE"), Map.entry("GE", "GEO"),
        Map.entry("LB", "LBN"), Map.entry("JO", "JOR"), Map.entry("IR", "IRN"), Map.entry("IQ", "IRQ"),
        Map.entry("YE", "YEM"), Map.entry("SY", "SYR"), Map.entry("PS", "PSE"), Map.entry("BZ", "BLZ"),
        Map.entry("LC", "LCA"), Map.entry("VC", "VCT"), Map.entry("DM", "DMA"), Map.entry("KN", "KNA"),
        Map.entry("AG", "ATG"), Map.entry("BB", "BRB"), Map.entry("GD", "GRD"), Map.entry("AL", "ALB"),
        Map.entry("ME", "MNE"), Map.entry("RS", "SRB"), Map.entry("BY", "BLR"), Map.entry("KZ", "KAZ"),
        Map.entry("TW", "TWN"), Map.entry("MO", "MAC"), Map.entry("HK", "HKG"), Map.entry("KP", "PRK"),
        Map.entry("TL", "TLS"), Map.entry("HT", "HTI"), Map.entry("GF", "GUF"), Map.entry("NC", "NCL"),
        Map.entry("PF", "PYF"), Map.entry("FK", "FLK"), Map.entry("IM", "IMN"), Map.entry("JE", "JEY"),
        Map.entry("GG", "GGY"), Map.entry("PR", "PRI")
    );
    
    // Indicadores do World Bank
    private static final Map<String, String> WORLD_BANK_INDICATORS = Map.ofEntries(
        Map.entry("gdp", "NY.GDP.MKTP.CD"),
        Map.entry("lifeExpectancy", "SP.DYN.LE00.IN"),
        Map.entry("gniPerCapita", "NY.GNP.PCAP.CD"),
        Map.entry("gdpGrowth", "NY.GDP.MKTP.KD.ZG"),
        Map.entry("internetUsers", "IT.NET.USER.ZS"),
        Map.entry("urbanPopulation", "SP.URB.TOTL.IN.ZS"),
        Map.entry("unemployment", "SL.UEM.TOTL.ZS"),
        Map.entry("gniPerCapitaPPP", "NY.GNP.PCAP.PP.CD"),
        Map.entry("fertilityRate", "SP.DYN.TFRT.IN"),
        Map.entry("accessToEletricity", "EG.ELC.ACCS.ZS"),
        Map.entry("education", "SE.ADT.LITR.ZS"),
        Map.entry("healthExpenses", "SH.XPD.CHEX.GD.ZS"),
        Map.entry("netMigration", "SM.POP.NETM"),
        Map.entry("gdpPerCapitaCurrent", "NY.GDP.PCAP.CD"),
        Map.entry("inflationCPI", "FP.CPI.TOTL.ZG"),
        Map.entry("debtToGDP", "GC.DOD.TOTL.GD.ZS")
    );
    
    // Códigos de regiões agregadas que devem ser excluídos do ranking
    private static final Set<String> AGGREGATE_REGIONS = Set.of(
        "1W", "1A", "1E", "1G", "1Q", "1R", "1S", "1T", "1U", "1V", "1X", "1Y", "1Z",
        "S1", "S2", "S3", "S4", "S5", "S6", "S7",
        "B8", "T2", "T3", "T4", "T5", "T6", "T7",
        "XC", "XD", "XE", "XF", "XG", "XH", "XI", "XJ", "XL", "XM", "XN", "XO", "XP", "XQ", "XR", "XS", "XT", "XU", "XV", "XW", "XY", "XZ",
        "OE", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"
    );
    
    // Padrões de nomes que indicam regiões agregadas
    private static final List<Pattern> AGGREGATE_NAME_PATTERNS = List.of(
        Pattern.compile("^world$", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^oecd", Pattern.CASE_INSENSITIVE),
        Pattern.compile("post-demographic", Pattern.CASE_INSENSITIVE),
        Pattern.compile("demographic dividend", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^ida", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^ibrd", Pattern.CASE_INSENSITIVE),
        Pattern.compile("low.*income", Pattern.CASE_INSENSITIVE),
        Pattern.compile("middle.*income", Pattern.CASE_INSENSITIVE),
        Pattern.compile("high.*income", Pattern.CASE_INSENSITIVE),
        Pattern.compile("upper.*income", Pattern.CASE_INSENSITIVE),
        Pattern.compile("lower.*income", Pattern.CASE_INSENSITIVE),
        Pattern.compile("east asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("west asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("south asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("central asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("southeast asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("middle east", Pattern.CASE_INSENSITIVE),
        Pattern.compile("north africa", Pattern.CASE_INSENSITIVE),
        Pattern.compile("sub-saharan africa", Pattern.CASE_INSENSITIVE),
        Pattern.compile("europe.*central asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("europe.*asia", Pattern.CASE_INSENSITIVE),
        Pattern.compile("latin america", Pattern.CASE_INSENSITIVE),
        Pattern.compile("caribbean", Pattern.CASE_INSENSITIVE),
        Pattern.compile("pacific", Pattern.CASE_INSENSITIVE),
        Pattern.compile("european union", Pattern.CASE_INSENSITIVE),
        Pattern.compile("euro area", Pattern.CASE_INSENSITIVE),
        Pattern.compile("eurozone", Pattern.CASE_INSENSITIVE),
        Pattern.compile("north america", Pattern.CASE_INSENSITIVE),
        Pattern.compile("south america", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\(excluding", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\(ida", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\(ibrd", Pattern.CASE_INSENSITIVE),
        Pattern.compile("countries\\)$", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^arab world$", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^small island", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^fragile", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^heavily", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^least developed", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^other small", Pattern.CASE_INSENSITIVE),
        Pattern.compile("^pre-demographic", Pattern.CASE_INSENSITIVE)
    );
    
    // Indicadores onde valores maiores são melhores (para ordenação)
    private static final Set<String> HIGHER_BETTER_INDICATORS = Set.of(
        "gdp", "gdpPerCapitaCurrent", "gniPerCapita", "gniPerCapitaPPP",
        "lifeExpectancy", "internetUsers", "urbanPopulation", "education",
        "accessToEletricity", "healthExpenses", "netMigration"
    );
    
    public CountryInfoService(CountryInfoRepository repository, CountryCuriositiesService curiositiesService, CacheManager cacheManager) {
        this.repository = repository;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(requestFactory);
        this.objectMapper = new ObjectMapper();
        this.curiositiesService = curiositiesService;
        this.cacheManager = cacheManager;
    }
    
    /**
     * Gets country information, using cache when available.
     * If cache is expired or missing, fetches fresh data from external APIs.
     * 
     * @param countryId ISO2 country code (e.g., "US", "BR")
     * @return CountryInfo object with all available data
     */
    @Cacheable(value = "countryInfo", key = "#countryId", unless = "#result == null")
    public CountryInfo getCountryInfo(String countryId) {
        return getCountryInfo(countryId, "en");
    }

    /**
     * Gets only basic country information for the fast page shell.
     * This intentionally avoids World Bank rankings, demographics, and AI curiosities.
     */
    public CountryInfo getBasicCountryInfo(String countryId) {
        String upperCountryId = countryId.toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        Optional<CountryInfo> cached = repository.findByCountryId(upperCountryId);
        if (cached.isPresent()) {
            CountryInfo info = cached.get();
            if (hasBasicInfo(info)
                    && info.getBasicInfoExpiresAt() != null
                    && info.getBasicInfoExpiresAt().isAfter(now)) {
                logger.info("Returning basic country info from cache for: {}", upperCountryId);
                return info;
            }
        }

        CountryInfo info = cached.orElseGet(CountryInfo::new);
        info.setCountryId(upperCountryId);

        try {
            fetchBasicInfoFromRestCountries(upperCountryId, info);
        } catch (Exception e) {
            logger.warn("Failed to fetch basic country info for {}: {}", upperCountryId, e.getMessage());
        }

        if (info.getLastUpdated() == null) {
            info.setLastUpdated(now);
        }
        info.setBasicInfoExpiresAt(now.plusHours(BASIC_INFO_CACHE_HOURS));

        // If this is a basic-only cache row, keep the full-cache expiry in the past
        // so /info can still populate World Bank, demographics, and curiosities later.
        if (info.getExpiresAt() == null) {
            info.setExpiresAt(now.minusSeconds(1));
        }
        if (info.getEconomicDataExpiresAt() == null) {
            info.setEconomicDataExpiresAt(now.minusSeconds(1));
        }
        if (info.getSocialDataExpiresAt() == null) {
            info.setSocialDataExpiresAt(now.minusSeconds(1));
        }

        try {
            repository.save(info);
        } catch (Exception e) {
            logger.warn("Failed to save basic country info for {}: {}", upperCountryId, e.getMessage());
        }

        return info;
    }
    
    /**
     * Gets country information (always returns English text - translation is done in frontend).
     * Uses cache when available, fetches fresh data from external APIs if cache is expired or missing.
     * 
     * @param countryId ISO2 country code (e.g., "US", "BR")
     * @param lang Language parameter (ignored - translation is done in frontend)
     * @return CountryInfo object with all available data (curiosities always in English)
     */
    public CountryInfo getCountryInfo(String countryId, String lang) {
        String upperCountryId = countryId.toUpperCase();
        logger.info("Fetching country info for: {}", upperCountryId);
        
        // 1. Verificar cache no banco
        Optional<CountryInfo> cached = repository.findByCountryId(upperCountryId);
        
        if (cached.isPresent()) {
            CountryInfo info = cached.get();
            LocalDateTime now = LocalDateTime.now();
            
            // Verificar se ainda não expirou
            if (info.getExpiresAt() != null && info.getExpiresAt().isAfter(now)) {
                boolean needsSave = false;
                
                // Se não tem curiosidades, tenta gerar em inglês
                if (info.getCuriosities() == null || info.getCuriosities().isEmpty()) {
                    logger.info("Cache valid but no curiosities found for: {}, attempting to generate in English...", upperCountryId);
                    try {
                        String curiosities = curiositiesService.generateCuriosities(info);
                        if (curiosities != null && !curiosities.trim().isEmpty()) {
                            info.setCuriosities(curiosities);
                            info.setCuriositiesLastUpdated(LocalDateTime.now());
                            needsSave = true;
                            logger.info("✅ Curiosities generated and saved for cached country: {} (English)", upperCountryId);
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to generate curiosities for cached country {}: {}", upperCountryId, e.getMessage());
                    }
                }
                
                // Se não tem dados demográficos (religião/grupos étnicos), tenta buscar
                if (info.getReligion() == null || info.getEthnicGroups() == null) {
                    logger.debug("Cache valid but missing demographics data for: {}, attempting to fetch...", upperCountryId);
                    try {
                        fetchDemographicsData(upperCountryId, info);
                        if (info.getReligion() != null || info.getEthnicGroups() != null) {
                            needsSave = true;
                            logger.info("✅ Demographics data added to cached country: {}", upperCountryId);
                        }
                    } catch (Exception e) {
                        logger.debug("Failed to fetch demographics for cached country {}: {}", upperCountryId, e.getMessage());
                    }
                }
                
                // Se não tem HDI, tenta buscar
                if (info.getHdi() == null) {
                    logger.debug("Cache valid but missing HDI data for: {}, attempting to fetch...", upperCountryId);
                    try {
                        fetchHDIData(upperCountryId, info);
                        if (info.getHdi() != null) {
                            needsSave = true;
                            logger.info("✅ HDI data added to cached country: {}", upperCountryId);
                        }
                    } catch (Exception e) {
                        logger.debug("Failed to fetch HDI for cached country {}: {}", upperCountryId, e.getMessage());
                    }
                }
                
                // Salvar se houver mudanças
                if (needsSave) {
                    try {
                        repository.save(info);
                    } catch (Exception e) {
                        logger.warn("Failed to save updated data for cached country {}: {}", upperCountryId, e.getMessage());
                    }
                }
                
                // Retorna o texto em inglês (tradução agora é feita no frontend)
                logger.info("Returning cached data for: {} (with curiosities)", upperCountryId);
                return info;
            }
            
            logger.info("Cache expired for: {}, fetching fresh data", upperCountryId);
        }
        
        // 2. Buscar dados das APIs externas
        CountryInfo countryInfo;
        try {
            countryInfo = fetchFromExternalApis(upperCountryId);
        } catch (Exception e) {
            logger.error("Error fetching data from external APIs for {}: {}", upperCountryId, e.getMessage(), e);
            // Se falhar completamente, criar objeto mínimo para não quebrar
            countryInfo = new CountryInfo();
            countryInfo.setCountryId(upperCountryId);
        }
        
        // 3. Garantir que timestamps obrigatórios estejam sempre setados
        LocalDateTime now = LocalDateTime.now();
        if (countryInfo.getLastUpdated() == null) {
            countryInfo.setLastUpdated(now);
        }
        if (countryInfo.getExpiresAt() == null) {
            countryInfo.setExpiresAt(now.plusHours(BASIC_INFO_CACHE_HOURS));
        }
        if (countryInfo.getBasicInfoExpiresAt() == null) {
            countryInfo.setBasicInfoExpiresAt(now.plusHours(BASIC_INFO_CACHE_HOURS));
        }
        if (countryInfo.getEconomicDataExpiresAt() == null) {
            countryInfo.setEconomicDataExpiresAt(now.plusHours(ECONOMIC_DATA_CACHE_HOURS));
        }
        if (countryInfo.getSocialDataExpiresAt() == null) {
            countryInfo.setSocialDataExpiresAt(now.plusHours(SOCIAL_DATA_CACHE_HOURS));
        }
        
        // 4. Salvar no banco (com tratamento de erro)
        try {
            repository.save(countryInfo);
            logger.info("Saved country info to cache for: {}", upperCountryId);
        } catch (Exception e) {
            logger.error("Error saving country info to database for {}: {}", upperCountryId, e.getMessage(), e);
            // Mesmo se falhar ao salvar, retornar os dados (pode ser problema temporário do banco)
        }
        
        // 5. Gerar curiosidades em inglês (sempre)
        if (countryInfo.getCuriosities() == null || countryInfo.getCuriosities().isEmpty()) {
            logger.info("🤖 [Curiosities] Starting generation for: {} (English)", upperCountryId);
            long startTime = System.currentTimeMillis();
            try {
                String curiosities = curiositiesService.generateCuriosities(countryInfo);
                long duration = System.currentTimeMillis() - startTime;
                
                if (curiosities != null && !curiosities.trim().isEmpty()) {
                    countryInfo.setCuriosities(curiosities);
                    countryInfo.setCuriositiesLastUpdated(LocalDateTime.now());
                    repository.save(countryInfo);
                    logger.info("✅ [Curiosities] Generated for: {} (English, took {}ms, {} chars)", 
                        upperCountryId, duration, curiosities.length());
                } else {
                    logger.warn("⚠️ [Curiosities] Generation returned null/empty for: {} (took {}ms). Check API key configuration.", 
                        upperCountryId, duration);
                }
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                logger.error("❌ [Curiosities] Failed to generate for {} (took {}ms): {}", 
                    upperCountryId, duration, e.getMessage(), e);
                // Continua mesmo se falhar - não é crítico, pode tentar novamente depois
            }
        }
        
        // Retorna o texto em inglês (tradução agora é feita no frontend)
        return countryInfo;
    }
    
    /**
     * Fetches country data from external APIs (RestCountries).
     * This method handles the primary data source and fallback mechanisms.
     */
    @SuppressWarnings("unchecked")
    private CountryInfo fetchFromExternalApis(String countryId) {
        logger.info("🔄 Starting fresh data fetch for country: {}", countryId);
        long startTime = System.currentTimeMillis();
        
        CountryInfo info = new CountryInfo();
        info.setCountryId(countryId);
        
        // Garantir timestamps básicos desde o início (caso algo falhe)
        LocalDateTime now = LocalDateTime.now();
        info.setLastUpdated(now);
        info.setExpiresAt(now.plusHours(BASIC_INFO_CACHE_HOURS));
        info.setBasicInfoExpiresAt(now.plusHours(BASIC_INFO_CACHE_HOURS));
        info.setEconomicDataExpiresAt(now.plusHours(ECONOMIC_DATA_CACHE_HOURS));
        info.setSocialDataExpiresAt(now.plusHours(SOCIAL_DATA_CACHE_HOURS));
        
        try {
            // Buscar dados básicos do RestCountries
            logger.debug("Fetching basic info from RestCountries for: {}", countryId);
            String url = "https://restcountries.com/v3.1/alpha/" + countryId;
            Object response = restTemplate.getForObject(url, Object.class);
            
            if (response instanceof List) {
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) response;
                if (!dataList.isEmpty()) {
                    Map<String, Object> countryData = dataList.get(0);
                    extractBasicInfo(countryData, info);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error fetching country data for {}: {}", countryId, e.getMessage(), e);
            // Continuar mesmo se RestCountries falhar
        }
        
        // Buscar dados do World Bank
        try {
            fetchWorldBankData(countryId, info);
        } catch (Exception e) {
            logger.error("Error fetching World Bank data for {}: {}", countryId, e.getMessage(), e);
            // Continuar mesmo se World Bank falhar - pelo menos temos dados básicos
        }
        
        // Buscar dados demográficos (religião e grupos étnicos)
        try {
            fetchDemographicsData(countryId, info);
        } catch (Exception e) {
            logger.debug("Error fetching demographics data for {}: {}", countryId, e.getMessage());
            // Não é crítico, continuar
        }
        
        long totalDuration = System.currentTimeMillis() - startTime;
        logger.info("✅ Completed data fetch for {}: took {}ms ({}s)", countryId, totalDuration, totalDuration / 1000.0);
        
        return info;
    }

    @SuppressWarnings("unchecked")
    private void fetchBasicInfoFromRestCountries(String countryId, CountryInfo info) {
        logger.info("Fetching basic-only country info from RestCountries for: {}", countryId);
        String url = "https://restcountries.com/v3.1/alpha/" + countryId;
        Object response = restTemplate.getForObject(url, Object.class);

        if (response instanceof List) {
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response;
            if (!dataList.isEmpty()) {
                extractBasicInfo(dataList.get(0), info);
            }
        }
    }

    private boolean hasBasicInfo(CountryInfo info) {
        return info.getCapital() != null
            || info.getOfficialLanguage() != null
            || info.getCurrency() != null
            || info.getNativeName() != null
            || info.getPopulation() != null
            || info.getLatitude() != null
            || info.getLongitude() != null;
    }
    
    /**
     * Extracts basic country information from RestCountries API response.
     */
    @SuppressWarnings("unchecked")
    private void extractBasicInfo(Map<String, Object> countryData, CountryInfo info) {
        try {
            // Nome nativo
            Map<String, Object> name = (Map<String, Object>) countryData.get("name");
            if (name != null) {
                Map<String, Object> nativeName = (Map<String, Object>) name.get("nativeName");
                if (nativeName != null && !nativeName.isEmpty()) {
                    Object firstNative = nativeName.values().iterator().next();
                    if (firstNative instanceof Map) {
                        Map<String, Object> nativeMap = (Map<String, Object>) firstNative;
                        Object common = nativeMap.get("common");
                        if (common != null) {
                            info.setNativeName(common.toString());
                        }
                    }
                }
                if (info.getNativeName() == null) {
                    Object common = name.get("common");
                    if (common != null) {
                        info.setNativeName(common.toString());
                    }
                }
            }
            
            // Idioma oficial
            Map<String, Object> languages = (Map<String, Object>) countryData.get("languages");
            if (languages != null && !languages.isEmpty()) {
                Object firstLang = languages.values().iterator().next();
                if (firstLang != null) {
                    info.setOfficialLanguage(firstLang.toString());
                }
            }
            
            // Moeda
            Map<String, Object> currencies = (Map<String, Object>) countryData.get("currencies");
            if (currencies != null && !currencies.isEmpty()) {
                String currencyKey = currencies.keySet().iterator().next();
                info.setCurrency(currencyKey);
                Map<String, Object> currencyData = (Map<String, Object>) currencies.get(currencyKey);
                if (currencyData != null) {
                    Object currencyName = currencyData.get("name");
                    if (currencyName != null) {
                        info.setCurrencyName(currencyName.toString());
                    }
                }
            }
            
            // Capital
            List<String> capitals = (List<String>) countryData.get("capital");
            if (capitals != null && !capitals.isEmpty()) {
                info.setCapital(capitals.get(0));
            }
            
            // População
            Object population = countryData.get("population");
            if (population != null) {
                if (population instanceof Number) {
                    info.setPopulation(((Number) population).longValue());
                }
            }
            
            // Coordenadas
            List<Number> latlng = (List<Number>) countryData.get("latlng");
            if (latlng != null && latlng.size() >= 2) {
                info.setLatitude(latlng.get(0).doubleValue());
                info.setLongitude(latlng.get(1).doubleValue());
            }
            
        } catch (Exception e) {
            logger.error("Error extracting basic info: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Fetches World Bank data for a country and populates the CountryInfo object.
     * 
     * @param countryId ISO2 country code
     * @param info CountryInfo object to populate
     */
    private void fetchWorldBankData(String countryId, CountryInfo info) {
        String iso3 = ISO2_TO_ISO3.get(countryId);
        if (iso3 == null) {
            logger.warn("ISO3 code not found for country: {}", countryId);
            return;
        }
        
        logger.info("Fetching World Bank data for {} (ISO3: {})", countryId, iso3);
        
        // Buscar indicadores em paralelo para acelerar
        List<Map.Entry<String, String>> indicatorsList = new ArrayList<>(WORLD_BANK_INDICATORS.entrySet());
        int totalIndicators = indicatorsList.size();
        int processedIndicators = 0;
        
        // Buscar cada indicador
        for (Map.Entry<String, String> entry : indicatorsList) {
            String key = entry.getKey();
            String indicatorCode = entry.getValue();
            processedIndicators++;
            
            try {
                logger.debug("Fetching indicator {}/{}: {} ({})", processedIndicators, totalIndicators, key, indicatorCode);
                Map<String, Object> indicatorData = fetchWorldBankIndicator(iso3, indicatorCode);
                if (indicatorData != null) {
                    String year = (String) indicatorData.get("date");
                    extractWorldBankData(key, indicatorData, info);
                    
                    // Calcular ranking para este indicador (pode ser lento)
                    if (year != null) {
                        logger.debug("Calculating ranking for {}/{}: {} (year: {})", processedIndicators, totalIndicators, key, year);
                        calculateAndSetRanking(countryId, iso3, indicatorCode, key, year, info);
                    }
                } else {
                    logger.debug("No data found for indicator: {} ({})", key, indicatorCode);
                }
            } catch (Exception e) {
                logger.debug("Error fetching indicator {} for {}: {}", indicatorCode, countryId, e.getMessage());
            }
        }
        
        logger.info("Completed fetching World Bank data for {}: {} indicators processed", countryId, processedIndicators);
        
        // Buscar dados de HDI separadamente (não está no World Bank)
        fetchHDIData(countryId, info);
    }
    
    /**
     * Fetches HDI (Human Development Index) data for a country.
     * Uses static HDI data from UNDP Human Development Report.
     * 
     * @param countryId ISO2 country code
     * @param info CountryInfo object to populate
     */
    private void fetchHDIData(String countryId, CountryInfo info) {
        try {
            logger.info("Fetching HDI data for: {}", countryId);
            fetchHDIFromAlternativeSource(countryId, info);
        } catch (Exception e) {
            logger.debug("Error fetching HDI data for {}: {}", countryId, e.getMessage());
        }
    }
    
    /**
     * Fetches HDI data from an alternative source.
     * Uses static HDI data from UNDP Human Development Report.
     * 
     * @param countryId ISO2 country code
     * @param info CountryInfo object to populate
     */
    private void fetchHDIFromAlternativeSource(String countryId, CountryInfo info) {
        try {
            String upperCountryId = countryId.toUpperCase();
            
            // Buscar HDI do mapeamento estático
            Double hdiValue = HDI_DATA.get(upperCountryId);
            
            if (hdiValue != null) {
                info.setHdi(hdiValue);
                info.setHdiYear(HDI_YEAR);
                logger.info("HDI data found for {}: {} (year: {})", upperCountryId, hdiValue, HDI_YEAR);
                
                // Calcular ranking de HDI
                calculateHDIRanking(upperCountryId, hdiValue, info);
            } else {
                logger.debug("HDI data not available for: {}", upperCountryId);
            }
            
        } catch (Exception e) {
            logger.debug("Error fetching HDI from alternative source for {}: {}", countryId, e.getMessage());
        }
    }
    
    /**
     * Calculates HDI ranking for a country.
     * 
     * @param countryId ISO2 country code
     * @param hdiValue HDI value for the country
     * @param info CountryInfo object to update
     */
    private void calculateHDIRanking(String countryId, Double hdiValue, CountryInfo info) {
        try {
            // Ordenar todos os países por HDI (maior = melhor)
            List<Map.Entry<String, Double>> sortedHDI = HDI_DATA.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue())) // Ordenar do maior para o menor
                .toList();
            
            // Encontrar a posição do país
            int rank = 1;
            for (Map.Entry<String, Double> entry : sortedHDI) {
                if (entry.getKey().equals(countryId)) {
                    info.setHdiRank(rank);
                    info.setHdiTotalCountries(sortedHDI.size());
                    logger.debug("HDI ranking calculated for {}: #{} / {}", countryId, rank, sortedHDI.size());
                    return;
                }
                rank++;
            }
            
        } catch (Exception e) {
            logger.debug("Error calculating HDI ranking for {}: {}", countryId, e.getMessage());
        }
    }
    
    /**
     * Fetches demographics data (religion and ethnic groups) from static data.
     * 
     * @param countryId ISO2 country code
     * @param info CountryInfo object to update
     */
    private void fetchDemographicsData(String countryId, CountryInfo info) {
        String upperCountryId = countryId.toUpperCase();
        
        try {
            // Buscar dados de religião
            String religionJson = RELIGION_DATA.get(upperCountryId);
            if (religionJson != null) {
                info.setReligion(religionJson);
                info.setReligionYear(DEMOGRAPHICS_YEAR);
                logger.debug("Religion data found for {}: {}", upperCountryId, religionJson);
            }
            
            // Buscar dados de grupos étnicos
            String ethnicGroupsJson = ETHNIC_GROUPS_DATA.get(upperCountryId);
            if (ethnicGroupsJson != null) {
                info.setEthnicGroups(ethnicGroupsJson);
                info.setEthnicGroupsYear(DEMOGRAPHICS_YEAR);
                logger.debug("Ethnic groups data found for {}: {}", upperCountryId, ethnicGroupsJson);
            }
            
        } catch (Exception e) {
            logger.debug("Error fetching demographics data for {}: {}", countryId, e.getMessage());
        }
    }
    
    /**
     * Fetches a specific World Bank indicator for a country.
     * 
     * @param iso3 ISO3 country code
     * @param indicatorCode World Bank indicator code
     * @return Map with value, date, and country info, or null if not found
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchWorldBankIndicator(String iso3, String indicatorCode) {
        try {
            String url = String.format(
                "https://api.worldbank.org/v2/country/%s/indicator/%s?format=json&per_page=100",
                iso3, indicatorCode
            );
            
            Object response = restTemplate.getForObject(url, Object.class);
            
            if (response instanceof List && ((List<?>) response).size() > 1) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) ((List<?>) response).get(1);
                
                if (data != null && !data.isEmpty()) {
                    // Filtrar entradas com valor null e ordenar por data (mais recente primeiro)
                    List<Map<String, Object>> validEntries = data.stream()
                        .filter(entry -> entry.get("value") != null)
                        .sorted((a, b) -> {
                            String dateA = (String) a.get("date");
                            String dateB = (String) b.get("date");
                            return dateB.compareTo(dateA); // Mais recente primeiro
                        })
                        .toList();
                    
                    if (!validEntries.isEmpty()) {
                        return validEntries.get(0);
                    }
                }
            }
        } catch (Exception e) {
            logger.debug("Error fetching World Bank indicator {} for {}: {}", indicatorCode, iso3, e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Extracts and sets World Bank data into CountryInfo object.
     * 
     * @param key Indicator key (e.g., "gdp", "lifeExpectancy")
     * @param data Indicator data from World Bank API
     * @param info CountryInfo object to populate
     */
    private void extractWorldBankData(String key, Map<String, Object> data, CountryInfo info) {
        try {
            Object valueObj = data.get("value");
            String year = (String) data.get("date");
            
            if (valueObj == null || year == null) {
                return;
            }
            
            double value = ((Number) valueObj).doubleValue();
            
            switch (key) {
                case "gdp":
                    info.setGdp(value);
                    info.setGdpFormatted(formatCurrencyUSD(value));
                    info.setGdpYear(year);
                    break;
                    
                case "gdpGrowth":
                    info.setGdpGrowth(value);
                    info.setGdpGrowthYear(year);
                    // GDP Growth já é percentual, não precisa formatação adicional aqui
                    break;
                    
                case "gdpPerCapitaCurrent":
                    info.setGdpPerCapitaCurrent(value);
                    info.setGdpPerCapitaCurrentFormatted(formatCurrencyUSD(value));
                    info.setGdpPerCapitaCurrentYear(year);
                    break;
                    
                case "debtToGDP":
                    info.setDebtToGDP(value);
                    info.setDebtToGDPYear(year);
                    break;
                    
                case "inflationCPI":
                    info.setInflationCPI(value);
                    info.setInflationCPIYear(year);
                    break;
                    
                case "gniPerCapita":
                    info.setGniPerCapita(value);
                    info.setGniPerCapitaFormatted(formatCurrencyUSD(value));
                    info.setGniPerCapitaYear(year);
                    break;
                    
                case "gniPerCapitaPPP":
                    info.setGniPerCapitaPPP(value);
                    info.setGniPerCapitaPPPFormatted(formatCurrencyUSD(value));
                    info.setGniPerCapitaPPPYear(year);
                    break;
                    
                case "lifeExpectancy":
                    info.setLifeExpectancy(value);
                    info.setLifeExpectancyYear(year);
                    break;
                    
                case "internetUsers":
                    info.setInternetUsers(value);
                    info.setInternetUsersYear(year);
                    break;
                    
                case "urbanPopulation":
                    info.setUrbanPopulation(value);
                    info.setUrbanPopulationYear(year);
                    break;
                    
                case "education":
                    info.setEducation(value);
                    info.setEducationYear(year);
                    break;
                    
                case "netMigration":
                    info.setNetMigration((long) value);
                    info.setNetMigrationFormatted(formatNumber(value));
                    info.setNetMigrationYear(year);
                    break;
                    
                case "unemployment":
                    info.setUnemployment(value);
                    info.setUnemploymentYear(year);
                    break;
                    
                case "fertilityRate":
                    info.setFertilityRate(value);
                    info.setFertilityRateYear(year);
                    break;
                    
                case "accessToEletricity":
                    info.setAccessToEletricity(value);
                    info.setAccessToEletricityYear(year);
                    break;
                    
                case "healthExpenses":
                    info.setHealthExpenses(value);
                    info.setHealthExpensesYear(year);
                    break;
            }
        } catch (Exception e) {
            logger.debug("Error extracting World Bank data for key {}: {}", key, e.getMessage());
        }
    }
    
    /**
     * Formats a number as USD currency.
     * 
     * @param value Value to format
     * @return Formatted string (e.g., "$29.18 Trillion")
     */
    private String formatCurrencyUSD(double value) {
        if (value >= 1_000_000_000_000L) {
            return String.format("$%.2f Trillion", value / 1_000_000_000_000.0);
        } else if (value >= 1_000_000_000L) {
            return String.format("$%.2f Billion", value / 1_000_000_000.0);
        } else if (value >= 1_000_000L) {
            return String.format("$%.2f Million", value / 1_000_000.0);
        } else {
            return String.format("$%.2f", value);
        }
    }
    
    /**
     * Formats a number with thousand separators.
     * 
     * @param value Value to format
     * @return Formatted string (e.g., "1,234,567")
     */
    private String formatNumber(double value) {
        return String.format("%,.0f", value);
    }
    
    /**
     * Formats a percentage value.
     * 
     * @param value Percentage value
     * @return Formatted string (e.g., "5.2%")
     */
    private String formatPercent(double value) {
        return String.format("%.2f%%", value);
    }
    
    /**
     * Checks if a country code represents a real country (not an aggregate region).
     * 
     * @param code Country code to check
     * @return true if it's a real country, false otherwise
     */
    private boolean isRealCountry(String code) {
        if (code == null || code.isEmpty()) {
            return false;
        }
        
        String upperCode = code.toUpperCase().trim();
        
        // Exclude aggregate region codes
        if (AGGREGATE_REGIONS.contains(upperCode)) {
            return false;
        }
        
        // Exclude codes starting with numbers
        if (upperCode.matches("^\\d.*")) {
            return false;
        }
        
        // Accept ISO2 (2 letters) and ISO3 (3 letters) that are alphabetic
        return upperCode.matches("^[A-Z]{2,3}$");
    }
    
    /**
     * Checks if a country name represents an aggregate region.
     * 
     * @param name Country name to check
     * @return true if it's an aggregate region, false otherwise
     */
    private boolean isAggregateByName(String name) {
        if (name == null || name.isEmpty()) {
            return false;
        }
        
        String nameUpper = name.trim();
        return AGGREGATE_NAME_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(nameUpper).find());
    }
    
    /**
     * Extracts country codes from a World Bank API entry.
     * 
     * @param entry API entry
     * @return Set of valid country codes
     */
    @SuppressWarnings("unchecked")
    private Set<String> extractCountryCodes(Map<String, Object> entry) {
        Set<String> codes = new HashSet<>();
        
        Object countryObj = entry.get("country");
        if (countryObj instanceof Map) {
            Map<String, Object> country = (Map<String, Object>) countryObj;
            if (country.get("id") != null) {
                codes.add(country.get("id").toString().toUpperCase());
            }
            if (country.get("iso2Code") != null) {
                codes.add(country.get("iso2Code").toString().toUpperCase());
            }
            if (country.get("iso3Code") != null) {
                codes.add(country.get("iso3Code").toString().toUpperCase());
            }
            if (country.get("value") != null) {
                String countryName = country.get("value").toString();
                if (isAggregateByName(countryName)) {
                    return new HashSet<>(); // Return empty if it's an aggregate by name
                }
            }
        } else if (countryObj instanceof String) {
            codes.add(((String) countryObj).toUpperCase());
        }
        
        if (entry.get("countryid") != null) {
            codes.add(entry.get("countryid").toString().toUpperCase());
        }
        if (entry.get("countryiso2code") != null) {
            codes.add(entry.get("countryiso2code").toString().toUpperCase());
        }
        if (entry.get("countryiso3code") != null) {
            codes.add(entry.get("countryiso3code").toString().toUpperCase());
        }
        
        return codes.stream().filter(this::isRealCountry).collect(Collectors.toSet());
    }
    
    /**
     * Calculates and sets ranking for a specific indicator.
     * 
     * @param countryId ISO2 country code
     * @param iso3 ISO3 country code
     * @param indicatorCode World Bank indicator code
     * @param key Indicator key (e.g., "gdp")
     * @param year Year of the data
     * @param info CountryInfo object to update
     */
    @SuppressWarnings("unchecked")
    private void calculateAndSetRanking(String countryId, String iso3, String indicatorCode, 
                                       String key, String year, CountryInfo info) {
        try {
            logger.debug("Starting ranking calculation for {} - {} (year: {})", countryId, key, year);
            long startTime = System.currentTimeMillis();
            
            // Buscar todos os países para este indicador no ano específico
            String url = String.format(
                "https://api.worldbank.org/v2/country/all/indicator/%s?format=json&per_page=300&date=%s",
                indicatorCode, year
            );
            
            Object response = restTemplate.getForObject(url, Object.class);
            
            if (!(response instanceof List) || ((List<?>) response).size() < 2) {
                return;
            }
            
            List<Map<String, Object>> metadata = (List<Map<String, Object>>) response;
            List<Map<String, Object>> allEntries = (List<Map<String, Object>>) ((List<?>) response).get(1);
            
            if (allEntries == null || allEntries.isEmpty()) {
                return;
            }
            
            // Verificar paginação
            int totalPages = 1;
            if (!metadata.isEmpty() && metadata.get(0) != null) {
                Object pagesObj = metadata.get(0).get("pages");
                if (pagesObj instanceof Number) {
                    totalPages = ((Number) pagesObj).intValue();
                }
            }
            
            // Buscar páginas adicionais se necessário
            if (totalPages > 1) {
                List<Map<String, Object>> additionalEntries = new ArrayList<>();
                for (int page = 2; page <= totalPages; page++) {
                    try {
                        String pageUrl = String.format(
                            "https://api.worldbank.org/v2/country/all/indicator/%s?format=json&per_page=300&date=%s&page=%d",
                            indicatorCode, year, page
                        );
                        Object pageResponse = restTemplate.getForObject(pageUrl, Object.class);
                        if (pageResponse instanceof List && ((List<?>) pageResponse).size() > 1) {
                            List<Map<String, Object>> pageData = (List<Map<String, Object>>) ((List<?>) pageResponse).get(1);
                            if (pageData != null) {
                                additionalEntries.addAll(pageData);
                            }
                        }
                    } catch (Exception e) {
                        logger.debug("Error fetching page {} for ranking: {}", page, e.getMessage());
                    }
                }
                allEntries.addAll(additionalEntries);
            }
            
            // Filtrar apenas países reais (excluir regiões agregadas)
            List<Map<String, Object>> validEntries = allEntries.stream()
                .filter(entry -> {
                    Object value = entry.get("value");
                    if (value == null) {
                        return false;
                    }
                    
                    // Verificar pelo nome
                    Object countryObj = entry.get("country");
                    if (countryObj instanceof Map) {
                        Map<String, Object> country = (Map<String, Object>) countryObj;
                        Object countryName = country.get("value");
                        if (countryName != null && isAggregateByName(countryName.toString())) {
                            return false;
                        }
                    }
                    
                    // Verificar pelos códigos
                    Set<String> codes = extractCountryCodes(entry);
                    return !codes.isEmpty();
                })
                .collect(Collectors.toList());
            
            if (validEntries.isEmpty()) {
                return;
            }
            
            // Determinar se valores maiores são melhores
            boolean higherBetter = HIGHER_BETTER_INDICATORS.contains(key);
            
            // Ordenar por valor
            validEntries.sort((a, b) -> {
                double valueA = ((Number) a.get("value")).doubleValue();
                double valueB = ((Number) b.get("value")).doubleValue();
                return higherBetter ? Double.compare(valueB, valueA) : Double.compare(valueA, valueB);
            });
            
            // Encontrar a posição do país
            int rank = -1;
            Set<String> countryCodes = Set.of(countryId.toUpperCase(), iso3);
            
            for (int i = 0; i < validEntries.size(); i++) {
                Map<String, Object> entry = validEntries.get(i);
                Set<String> entryCodes = extractCountryCodes(entry);
                
                // Verificar se algum código do país corresponde
                boolean matches = entryCodes.stream().anyMatch(countryCodes::contains);
                if (matches) {
                    rank = i + 1; // Ranking começa em 1
                    break;
                }
            }
            
            if (rank > 0) {
                int totalCountries = validEntries.size();
                
                // Atualizar ranking no objeto CountryInfo
                switch (key) {
                    case "gdp":
                        info.setGdpRank(rank);
                        info.setGdpTotalCountries(totalCountries);
                        break;
                    case "gdpGrowth":
                        info.setGdpGrowthRank(rank);
                        info.setGdpGrowthTotalCountries(totalCountries);
                        break;
                    case "gdpPerCapitaCurrent":
                        info.setGdpPerCapitaCurrentRank(rank);
                        info.setGdpPerCapitaCurrentTotalCountries(totalCountries);
                        break;
                    case "debtToGDP":
                        info.setDebtToGDPRank(rank);
                        info.setDebtToGDPTotalCountries(totalCountries);
                        break;
                    case "inflationCPI":
                        info.setInflationCPIRank(rank);
                        info.setInflationCPITotalCountries(totalCountries);
                        break;
                    case "lifeExpectancy":
                        info.setLifeExpectancyRank(rank);
                        info.setLifeExpectancyTotalCountries(totalCountries);
                        break;
                    case "internetUsers":
                        info.setInternetUsersRank(rank);
                        info.setInternetUsersTotalCountries(totalCountries);
                        break;
                    case "urbanPopulation":
                        info.setUrbanPopulationRank(rank);
                        info.setUrbanPopulationTotalCountries(totalCountries);
                        break;
                    case "education":
                        info.setEducationRank(rank);
                        info.setEducationTotalCountries(totalCountries);
                        break;
                    case "netMigration":
                        info.setNetMigrationRank(rank);
                        info.setNetMigrationTotalCountries(totalCountries);
                        break;
                    case "fertilityRate":
                        info.setFertilityRateRank(rank);
                        info.setFertilityRateTotalCountries(totalCountries);
                        break;
                    case "accessToEletricity":
                        info.setAccessToEletricityRank(rank);
                        info.setAccessToEletricityTotalCountries(totalCountries);
                        break;
                    case "healthExpenses":
                        info.setHealthExpensesRank(rank);
                        info.setHealthExpensesTotalCountries(totalCountries);
                        break;
                }
                
                long duration = System.currentTimeMillis() - startTime;
                logger.info("✅ Ranking calculated for {} - {}: {}/{} (took {}ms)", countryId, key, rank, totalCountries, duration);
            } else {
                logger.debug("Ranking not found for {} - {}", countryId, key);
            }
            
        } catch (Exception e) {
            logger.warn("Error calculating ranking for {} - {}: {}", countryId, key, e.getMessage());
        }
    }
    
    /**
     * Evicts cache for a specific country.
     * 
     * @param countryId ISO2 country code
     */
    @CacheEvict(value = "countryInfo", key = "#countryId")
    public void evictCache(String countryId) {
        repository.deleteById(countryId.toUpperCase());
        logger.info("Cache evicted for: {}", countryId.toUpperCase());
    }
    
    /**
     * Clears only the curiosities for a specific country, keeping other cached data.
     * Forces regeneration of curiosities on next request.
     * 
     * @param countryId ISO2 country code
     */
    public void clearCuriosities(String countryId) {
        String upperCountryId = countryId.toUpperCase();
        Optional<CountryInfo> info = repository.findByCountryId(upperCountryId);
        
        if (info.isPresent()) {
            CountryInfo countryInfo = info.get();
            countryInfo.setCuriosities(null);
            countryInfo.setCuriositiesLastUpdated(null);
            repository.save(countryInfo);
            
            // Also evict from Caffeine cache
            evictCaffeineCache(upperCountryId);
            
            logger.info("Curiosities cleared for: {}", upperCountryId);
        } else {
            logger.warn("Country not found for clearing curiosities: {}", upperCountryId);
        }
    }
    
    /**
     * Clears curiosities for all countries in the database.
     */
    public void clearAllCuriosities() {
        List<CountryInfo> allCountries = repository.findAll();
        int count = 0;
        
        for (CountryInfo info : allCountries) {
            if (info.getCuriosities() != null) {
                info.setCuriosities(null);
                info.setCuriositiesLastUpdated(null);
                repository.save(info);
                evictCaffeineCache(info.getCountryId());
                count++;
            }
        }
        
        logger.info("Curiosities cleared for {} countries", count);
    }
    
    /**
     * Clears all Caffeine cache (in-memory cache).
     */
    public void clearAllCaffeineCache() {
        if (cacheManager != null) {
            cacheManager.getCache("countryInfo").clear();
            logger.info("All Caffeine cache cleared");
        }
    }
    
    /**
     * Gets the complete HDI ranking for all countries.
     * Uses static HDI data from UNDP Human Development Report.
     * 
     * @return Map containing ranking list, year, and total count
     */
    public Map<String, Object> getHDIRanking() {
        List<Map<String, Object>> rankingList = new ArrayList<>();
        
        // Ordenar todos os países por HDI (maior = melhor)
        List<Map.Entry<String, Double>> sortedHDI = HDI_DATA.entrySet().stream()
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue())) // Ordenar do maior para o menor
            .toList();
        
        // Criar lista de ranking
        int position = 1;
        for (Map.Entry<String, Double> entry : sortedHDI) {
            String countryId = entry.getKey();
            Double hdiValue = entry.getValue();
            
            // Buscar nome do país: primeiro do mapeamento estático, depois do banco, por último usar código
            String countryName = COUNTRY_NAMES_EN.getOrDefault(countryId, countryId);
            
            // Se não encontrou no mapeamento estático, tentar buscar do banco
            if (countryName.equals(countryId)) {
                Optional<CountryInfo> countryInfo = repository.findByCountryId(countryId);
                if (countryInfo.isPresent()) {
                    CountryInfo info = countryInfo.get();
                    // Preferir nativeName, mas se não tiver, usar o código mesmo
                    if (info.getNativeName() != null && !info.getNativeName().isEmpty()) {
                        countryName = info.getNativeName();
                    }
                }
            }
            
            Map<String, Object> rankEntry = new HashMap<>();
            rankEntry.put("position", position);
            rankEntry.put("countryCode", countryId);
            rankEntry.put("countryName", countryName);
            rankEntry.put("value", hdiValue);
            rankEntry.put("formattedValue", String.format("%.3f", hdiValue));
            
            rankingList.add(rankEntry);
            position++;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("indicatorCode", "HDI");
        result.put("year", HDI_YEAR);
        result.put("total", rankingList.size());
        result.put("ranking", rankingList);
        
        logger.info("HDI ranking generated: {} countries", rankingList.size());
        return result;
    }
    
    /**
     * Gets cache statistics and list of countries in Caffeine cache.
     * 
     * @return Map with cache statistics and list of cached country IDs
     */
    public Map<String, Object> getCaffeineCacheInfo() {
        Map<String, Object> info = new HashMap<>();
        
        if (cacheManager == null) {
            info.put("error", "Cache manager not available");
            return info;
        }
        
        Cache cache = cacheManager.getCache("countryInfo");
        if (cache == null) {
            info.put("error", "Cache 'countryInfo' not found");
            return info;
        }
        
        // Get native Caffeine cache for statistics
        if (cache instanceof CaffeineCache) {
            CaffeineCache caffeineCache = (CaffeineCache) cache;
            com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = caffeineCache.getNativeCache();
            
            // Get statistics
            CacheStats stats = nativeCache.stats();
            info.put("stats", Map.of(
                "hitCount", stats.hitCount(),
                "missCount", stats.missCount(),
                "loadCount", stats.loadCount(),
                "evictionCount", stats.evictionCount(),
                "hitRate", stats.hitRate(),
                "missRate", stats.missRate(),
                "averageLoadPenalty", stats.averageLoadPenalty()
            ));
            
            // Get estimated size
            long estimatedSize = nativeCache.estimatedSize();
            info.put("estimatedSize", estimatedSize);
            
            // Try to get list of keys (countries in cache)
            // Note: Caffeine doesn't expose keys directly, but we can try to get them
            List<String> cachedCountries = new ArrayList<>();
            try {
                // Get all keys from the cache
                nativeCache.asMap().keySet().forEach(key -> {
                    if (key instanceof String) {
                        cachedCountries.add((String) key);
                    }
                });
                info.put("cachedCountries", cachedCountries);
                info.put("cachedCountriesCount", cachedCountries.size());
            } catch (Exception e) {
                logger.warn("Could not retrieve cache keys: {}", e.getMessage());
                info.put("cachedCountries", Collections.emptyList());
                info.put("cachedCountriesCount", 0);
            }
        } else {
            info.put("error", "Cache is not a CaffeineCache instance");
        }
        
        return info;
    }
    
    /**
     * Evicts a specific country from Caffeine cache.
     * 
     * @param countryId ISO2 country code
     */
    private void evictCaffeineCache(String countryId) {
        if (cacheManager != null) {
            var cache = cacheManager.getCache("countryInfo");
            if (cache != null) {
                cache.evict(countryId);
                logger.debug("Caffeine cache evicted for: {}", countryId);
            }
        }
    }
    
    /**
     * Cleans expired cache entries daily at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredCache() {
        logger.info("Starting scheduled cache cleanup...");
        try {
            LocalDateTime now = LocalDateTime.now();
            repository.deleteExpired(now);
            logger.info("Cache cleanup completed");
        } catch (Exception e) {
            logger.error("Error during cache cleanup: {}", e.getMessage(), e);
        }
    }
}
