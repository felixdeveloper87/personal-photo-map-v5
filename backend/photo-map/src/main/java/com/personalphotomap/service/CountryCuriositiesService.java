package com.personalphotomap.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalphotomap.model.CountryInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service responsible for generating country curiosities using OpenAI GPT.
 * Generates engaging text about countries including gastronomy, sports,
 * culture, lifestyle, etc.
 */
@Service
public class CountryCuriositiesService {

    private static final Logger logger = LoggerFactory.getLogger(CountryCuriositiesService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    public CountryCuriositiesService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Gera curiosidades sobre o país usando OpenAI GPT.
     * O texto é gerado uma vez e armazenado permanentemente no banco.
     * 
     * @param countryInfo Informações do país
     * @return Texto com curiosidades sobre o país ou null se falhar
     */
    public String generateCuriosities(CountryInfo countryInfo) {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            logger.error("❌ [OpenAI] API key not configured! Set OPENAI_API_KEY environment variable.");
            logger.error("❌ [OpenAI] Curiosities generation skipped for: {}", countryInfo.getCountryId());
            return null;
        }
        
        logger.info("🤖 [OpenAI] API key found, starting generation for: {}", countryInfo.getCountryId());

        try {
            String prompt = buildPrompt(countryInfo);
            String curiosities = callOpenAIAPI(prompt, countryInfo.getCountryId());

            if (curiosities != null && !curiosities.trim().isEmpty()) {
                logger.info("✅ Curiosities generated successfully for: {}", countryInfo.getCountryId());
                return curiosities.trim();
            }

            logger.warn("Failed to generate curiosities for: {}", countryInfo.getCountryId());
            return null;

        } catch (Exception e) {
            logger.error("Error generating curiosities for {}: {}",
                    countryInfo.getCountryId(), e.getMessage(), e);
            return null;
        }
    }

    /**
     * Constrói o prompt para a IA baseado nas informações do país.
     */
    private String buildPrompt(CountryInfo info) {
        String countryName = info.getNativeName() != null ? info.getNativeName() : info.getCountryId();
        String capital = info.getCapital() != null ? info.getCapital() : "";
        String language = info.getOfficialLanguage() != null ? info.getOfficialLanguage() : "";
        String currency = info.getCurrencyName() != null ? info.getCurrencyName() : "";

        return String.format(
                "Write an inspiring and captivating promotional text about %s that encourages travelers to visit and explore this amazing destination. " +
                        "The text should be around 200–250 words, enthusiastic, and written to attract tourists.\n\n" +
                        "Basic country information (for reference):\n" +
                        "- Name: %s\n" +
                        "- Capital: %s\n" +
                        "- Official language: %s\n" +
                        "- Currency: %s\n\n" +
                        "CRITICAL FORMATTING REQUIREMENTS - YOU MUST FOLLOW THIS EXACT STRUCTURE:\n\n" +
                        "1. **Opening paragraph** (2-3 sentences) – Start with an exciting and enthusiastic introduction that sparks curiosity and makes the reader want to discover this country immediately.\n\n" +
                        "2. **Top 5 Tourist Attractions section** – You MUST include a clear section title followed by a blank line, then list exactly 5 items, each on its own separate line:\n" +
                        "   Format:\n" +
                        "   Top 5 Tourist Attractions:\n" +
                        "   \n" +
                        "   1) [Attraction Name] - [Brief description]\n" +
                        "   2) [Attraction Name] - [Brief description]\n" +
                        "   3) [Attraction Name] - [Brief description]\n" +
                        "   4) [Attraction Name] - [Brief description]\n" +
                        "   5) [Attraction Name] - [Brief description]\n\n" +
                        "3. **Top 5 Experiences section** – You MUST include a clear section title followed by a blank line, then list exactly 5 items, each on its own separate line:\n" +
                        "   Format:\n" +
                        "   Top 5 Experiences:\n" +
                        "   \n" +
                        "   1) [Experience Name] - [Brief description]\n" +
                        "   2) [Experience Name] - [Brief description]\n" +
                        "   3) [Experience Name] - [Brief description]\n" +
                        "   4) [Experience Name] - [Brief description]\n" +
                        "   5) [Experience Name] - [Brief description]\n\n" +
                        "4. **Closing paragraph** (2-3 sentences) – End with information about gastronomy, natural beauty, lifestyle, and atmosphere that makes the reader feel they MUST visit this country.\n\n" +
                        "FORMATTING RULES:\n" +
                        "- Each numbered item MUST be on its own separate line\n" +
                        "- Use exactly this format: 1), 2), 3), 4), 5) with closing parenthesis\n" +
                        "- Include blank lines between sections for visual separation\n" +
                        "- Section titles must be clearly visible: \"Top 5 Tourist Attractions:\" and \"Top 5 Experiences:\"\n" +
                        "- Use general knowledge about the country, not just the provided data\n" +
                        "- Write in an enthusiastic, promotional tone that sells the destination\n" +
                        "- Make the reader feel they MUST visit this country",
                countryName, countryName, capital, language, currency);
    }

    /**
     * Chama a API da OpenAI para gerar o texto.
     */
    @SuppressWarnings("unchecked")
    private String callOpenAIAPI(String prompt, String countryId) {
        try {
            Map<String, Object> request = new HashMap<>();
            
            // System message
            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", 
                "You are a professional travel writer and destination marketing specialist with deep knowledge of world tourism, cultures, gastronomy, and attractions. " +
                "Your goal is to write inspiring, enthusiastic, and promotional texts that encourage people to visit and explore countries. " +
                "You excel at creating captivating opening sentences that spark curiosity and excitement. " +
                "You know the main tourist attractions, landmarks, and must-visit places in countries around the world. " +
                "Your texts are written to attract tourists and sell destinations in an authentic and inspiring way. " +
                "The text should be around 200–250 words, written in an enthusiastic and inviting tone. " +
                "Always start with an exciting introduction that makes readers want to discover the country immediately. " +
                "CRITICAL FORMATTING: You MUST structure your response with clear visual separation: " +
                "1) Opening paragraph, 2) Section title 'Top 5 Tourist Attractions:' followed by a blank line, then 5 numbered items (1), 2), 3), 4), 5)) each on its own separate line, " +
                "3) Section title 'Top 5 Experiences:' followed by a blank line, then 5 numbered items (1), 2), 3), 4), 5)) each on its own separate line, " +
                "4) Closing paragraph. Each numbered item must be on its own line with proper line breaks for visual clarity. " +
                "Emphasize tourist attractions, cultural experiences, gastronomy, natural beauty, and unique aspects that make each destination special. " +
                "Make readers feel they absolutely must visit this amazing country.");
            
            // User message
            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            
            // Request body
            request.put("model", "gpt-3.5-turbo");
            request.put("messages", List.of(systemMessage, userMessage));
            request.put("temperature", 0.7);
            request.put("max_tokens", 700);

            String requestBody = objectMapper.writeValueAsString(request);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            logger.info("🌐 [OpenAI] Calling API for: {} (model: gpt-3.5-turbo)", countryId);
            long apiStartTime = System.currentTimeMillis();
            String response = restTemplate.postForObject(OPENAI_URL, entity, String.class);
            long apiDuration = System.currentTimeMillis() - apiStartTime;
            logger.info("⏱️ [OpenAI] API call completed in {}ms for: {}", apiDuration, countryId);

            if (response == null) {
                logger.error("❌ [OpenAI] API returned null response for: {}", countryId);
                return null;
            }
            
            logger.debug("📥 [OpenAI] Response received ({} chars) for: {}", response.length(), countryId);

            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");

            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> choice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                String content = (String) message.get("content");
                
                if (content != null && !content.trim().isEmpty()) {
                    return content.trim();
                }
            }

            logger.error("❌ [OpenAI] No valid response structure from API for: {}", countryId);
            logger.error("❌ [OpenAI] Response was: {}", response != null ? response.substring(0, Math.min(500, response.length())) : "null");
            return null;

        } catch (Exception e) {
            logger.error("❌ [OpenAI] Exception calling API for {}: {}", countryId, e.getMessage(), e);
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                logger.error("❌ [OpenAI] 401 Unauthorized - Check if API key is valid!");
            }
            return null;
        }
    }
}
