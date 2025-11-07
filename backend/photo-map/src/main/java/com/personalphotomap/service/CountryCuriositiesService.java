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
                "Write an engaging and modern encyclopedia-style summary about %s. " +
                        "The text should be around 200–250 words, informative, curious, and enjoyable to read.\n\n" +
                        "Basic country information (for reference):\n" +
                        "- Name: %s\n" +
                        "- Capital: %s\n" +
                        "- Official language: %s\n" +
                        "- Currency: %s\n\n" +
                        "IMPORTANT: The text must naturally include and highlight:\n" +
                        "1. **Gastronomy** – traditional dishes, signature ingredients, and culinary traditions\n" +
                        "2. **Sports** – popular sports, athletic traditions, and major sporting events\n" +
                        "3. **Lifestyle** – customs, habits, and the everyday way of life\n" +
                        "4. **Culture** – festivals, music, art, and cultural expressions\n" +
                        "5. **Curiosities** – interesting or unique facts about the country\n" +
                        "6. **Geography and nature** – notable landscapes and natural features\n\n" +
                        "Guidelines:\n" +
                        "- Use general knowledge about the country, not just the provided data\n" +
                        "- Write in a natural, narrative way, as if it were a modern encyclopedia entry\n" +
                        "- Do NOT list numbers, statistics, or rankings\n" +
                        "- Emphasize cultural, gastronomic, sporting, and lifestyle aspects\n" +
                        "- Keep the tone informative, curious, and engaging\n" +
                        "- Make the reader feel as if they are traveling through the country while reading.",
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
                "You are a professional writer specialized in creating engaging, modern encyclopedia-style summaries about countries. " +
                "You have deep knowledge of world cultures, gastronomy, sports, lifestyle, traditions, and curiosities. " +
                "Your goal is to write informative, curious, and captivating texts that read like a modern encyclopedia entry — " +
                "smooth, natural, and enjoyable to read. " +
                "Use your general knowledge about the country to describe its cuisine, popular sports, daily lifestyle, culture, music, art, festivals, curiosities, and notable geography. " +
                "The text should be around 200–250 words, written in a narrative and friendly tone, without listing numbers or statistics. " +
                "Focus on awakening the reader's curiosity and making them feel as if they are traveling through the country while reading.");
            
            // User message
            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            
            // Request body
            request.put("model", "gpt-3.5-turbo");
            request.put("messages", List.of(systemMessage, userMessage));
            request.put("temperature", 0.7);
            request.put("max_tokens", 500);

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
