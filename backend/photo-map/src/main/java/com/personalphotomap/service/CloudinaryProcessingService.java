package com.personalphotomap.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;

/**
 * CloudinaryProcessingService
 * 
 * Uses Cloudinary to process images externally, saving VPS resources.
 * 
 * Flow:
 * 1. Upload image to Cloudinary (temporary)
 * 2. Cloudinary processes/optimizes automatically
 * 3. Download the optimized version
 * 4. Delete from Cloudinary
 * 5. Return processed bytes for local storage
 */
@Service
public class CloudinaryProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryProcessingService.class);
    
    private final Cloudinary cloudinary;
    private final boolean enabled;

    public CloudinaryProcessingService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${cloudinary.enabled:false}") boolean enabled) {
        
        this.enabled = enabled && cloudName != null && !cloudName.isEmpty();
        
        if (this.enabled) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
            ));
            logger.info("✅ Cloudinary enabled - Cloud: {}", cloudName);
        } else {
            this.cloudinary = null;
            logger.info("⚠️ Cloudinary disabled - using local processing");
        }
    }

    /**
     * Checks if Cloudinary processing is enabled
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Processes an image using Cloudinary and returns the optimized bytes.
     * 
     * @param file The original image file
     * @param maxWidth Maximum width (default: 1600)
     * @param maxHeight Maximum height (default: 1600)
     * @param quality Quality setting (default: auto)
     * @return Optimized image bytes
     * @throws IOException if processing fails
     */
    public byte[] processImage(MultipartFile file, int maxWidth, int maxHeight, String quality) throws IOException {
        if (!enabled) {
            throw new IllegalStateException("Cloudinary is not enabled");
        }

        String publicId = null;
        
        try {
            logger.info("📤 Uploading to Cloudinary: {} ({}KB)", 
                file.getOriginalFilename(), file.getSize() / 1024);
            
            // Upload to Cloudinary with processing parameters
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "photomap-processing",
                "resource_type", "image",
                "format", "jpg",
                "quality", quality,
                "transformation", ObjectUtils.asMap(
                    "width", maxWidth,
                    "height", maxHeight,
                    "crop", "limit",
                    "fetch_format", "auto",
                    "quality", "auto:good"
                )
            ));
            
            publicId = (String) uploadResult.get("public_id");
            String optimizedUrl = (String) uploadResult.get("secure_url");
            int originalSize = (int) (file.getSize() / 1024);
            int optimizedSize = ((Number) uploadResult.get("bytes")).intValue() / 1024;
            
            logger.info("✅ Cloudinary processed: {}KB → {}KB ({}% reduction)", 
                originalSize, optimizedSize, 
                100 - (optimizedSize * 100 / originalSize));
            
            // Download the optimized image
            byte[] optimizedBytes = downloadImage(optimizedUrl);
            
            logger.info("📥 Downloaded optimized image: {}KB", optimizedBytes.length / 1024);
            
            return optimizedBytes;
            
        } catch (Exception e) {
            logger.error("❌ Cloudinary processing failed: {}", e.getMessage());
            throw new IOException("Failed to process image with Cloudinary", e);
        } finally {
            // Always try to delete from Cloudinary to save storage
            if (publicId != null) {
                deleteFromCloudinary(publicId);
            }
        }
    }

    /**
     * Simplified process method with default settings
     */
    public byte[] processImage(MultipartFile file) throws IOException {
        return processImage(file, 1600, 1600, "auto:good");
    }

    /**
     * Downloads an image from a URL
     */
    private byte[] downloadImage(String imageUrl) throws IOException {
        try (InputStream in = new URL(imageUrl).openStream();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            
            return out.toByteArray();
        }
    }

    /**
     * Deletes an image from Cloudinary
     */
    private void deleteFromCloudinary(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            logger.info("🗑️ Deleted from Cloudinary: {}", publicId);
        } catch (Exception e) {
            logger.warn("⚠️ Failed to delete from Cloudinary: {} - {}", publicId, e.getMessage());
        }
    }
}

