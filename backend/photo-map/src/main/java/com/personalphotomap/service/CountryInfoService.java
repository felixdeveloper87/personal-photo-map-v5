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
        return getCountryInfo(countryId, "en");
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
                // Se não tem curiosidades, tenta gerar em inglês
                if (info.getCuriosities() == null || info.getCuriosities().isEmpty()) {
                    logger.info("Cache valid but no curiosities found for: {}, attempting to generate in English...", upperCountryId);
                    try {
                        String curiosities = curiositiesService.generateCuriosities(info);
                        if (curiosities != null && !curiosities.trim().isEmpty()) {
                            info.setCuriosities(curiosities);
                            info.setCuriositiesLastUpdated(LocalDateTime.now());
                            repository.save(info);
                            logger.info("✅ Curiosities generated and saved for cached country: {} (English)", upperCountryId);
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to generate curiosities for cached country {}: {}", upperCountryId, e.getMessage());
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