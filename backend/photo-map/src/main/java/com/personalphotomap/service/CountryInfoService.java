package com.personalphotomap.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalphotomap.model.CountryInfo;
import com.personalphotomap.repository.CountryInfoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
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
        Map.entry("CY", "CYP")
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
        this.restTemplate = new RestTemplate();
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
        String upperCountryId = countryId.toUpperCase();
        logger.info("Fetching country info for: {}", upperCountryId);
        
        // 1. Verificar cache no banco
        Optional<CountryInfo> cached = repository.findByCountryId(upperCountryId);
        
        if (cached.isPresent()) {
            CountryInfo info = cached.get();
            LocalDateTime now = LocalDateTime.now();
            
            // Verificar se ainda não expirou
            if (info.getExpiresAt() != null && info.getExpiresAt().isAfter(now)) {
                // Se tem curiosidades, retorna do cache
                if (info.getCuriosities() != null && !info.getCuriosities().isEmpty()) {
                    logger.info("Returning cached data for: {} (with curiosities)", upperCountryId);
                    return info;
                }
                
                // Se não tem curiosidades, tenta gerar mesmo com cache válido
                logger.info("Cache valid but no curiosities found for: {}, attempting to generate...", upperCountryId);
                try {
                    String curiosities = curiositiesService.generateCuriosities(info);
                    if (curiosities != null && !curiosities.trim().isEmpty()) {
                        info.setCuriosities(curiosities);
                        info.setCuriositiesLastUpdated(LocalDateTime.now());
                        repository.save(info);
                        logger.info("✅ Curiosities generated and saved for cached country: {}", upperCountryId);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to generate curiosities for cached country {}: {}", upperCountryId, e.getMessage());
                }
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
        
        // 5. Gerar curiosidades se não existir (armazenamento permanente)
        if (countryInfo.getCuriosities() == null || countryInfo.getCuriosities().isEmpty()) {
            logger.info("🤖 [Curiosities] Starting generation for: {}", upperCountryId);
            long startTime = System.currentTimeMillis();
            try {
                String curiosities = curiositiesService.generateCuriosities(countryInfo);
                long duration = System.currentTimeMillis() - startTime;
                
                if (curiosities != null && !curiosities.trim().isEmpty()) {
                    countryInfo.setCuriosities(curiosities);
                    countryInfo.setCuriositiesLastUpdated(LocalDateTime.now());
                    // Salvar novamente com as curiosidades
                    repository.save(countryInfo);
                    logger.info("✅ [Curiosities] Generated and saved for: {} (took {}ms, {} chars)", 
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
        } else {
            logger.debug("✅ [Curiosities] Already exist for: {} ({} chars)", 
                upperCountryId, countryInfo.getCuriosities().length());
        }
        
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
        
        long totalDuration = System.currentTimeMillis() - startTime;
        logger.info("✅ Completed data fetch for {}: took {}ms ({}s)", countryId, totalDuration, totalDuration / 1000.0);
        
        return info;
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