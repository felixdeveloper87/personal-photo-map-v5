package com.personalphotomap.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;


/**
 * LocalFileStorageService
 * 
 * Manages file uploads to local storage with automatic image resizing.
 * Replaces AWS S3 functionality with local VPS storage.
 * 
 * Features:
 * - Stores original and resized images locally
 * - Creates multiple image sizes (thumbnail, medium, original)
 * - Provides file deletion functionality
 * - Thread-safe file operations
 */

@Service
public class LocalFileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    @Value("${app.base.url:http://localhost:8092}")
    private String baseUrl;

    // If true, store original bytes (preserve EXIF/orientation/format)
    @Value("${app.images.passthrough:true}")
    private boolean passthroughStore;

    // Image size configurations
    private static final int MAX_SIZE = 1920;
    private static final int MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB
    private static final float INITIAL_QUALITY = 0.9f;
    private static final float MIN_QUALITY = 0.3f;

    /**
     * Uploads a file to local storage with an auto-generated filename.
     *
     * @param file The MultipartFile to upload.
     * @return The public URL of the uploaded file.
     */
    public String uploadFile(MultipartFile file) {
        String fileName = UUID.randomUUID().toString() + "-" + sanitizeFileName(file.getOriginalFilename());
        return uploadFile(file, fileName);
    }

    /**
     * Uploads a file to local storage using a custom filename.
     * Creates only resized versions (no original) with 1MB max size.
     *
     * @param file The MultipartFile to upload.
     * @param customFileName The exact filename to store locally.
     * @return The public URL of the uploaded file.
     */
    public String uploadFile(MultipartFile file, String customFileName) {
        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Fast path: passthrough store (no re-encode, preserve EXIF and format)
            if (isImageFile(file) && (passthroughStore || !canDecodeImage(file))) {
                String finalFileName = storeOriginalFile(file, customFileName, uploadPath);
                String fileUrl = "/api/images/uploads/" + finalFileName;
                logger.info("Stored original image (passthrough): {} -> {}", file.getOriginalFilename(), fileUrl);
                return fileUrl;
            }

            // Process and save only if it's an image
            if (isImageFile(file)) {
                String finalFileName = createOptimizedImage(file, customFileName, uploadPath);
                String fileUrl = "/api/images/uploads/" + finalFileName;
                
                logger.info("✅ Optimized image uploaded successfully: {} -> {}", file.getOriginalFilename(), fileUrl);
                return fileUrl;
            } else {
                throw new RuntimeException("Only image files are supported");
            }

        } catch (IOException e) {
            logger.error("Failed to upload file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload file to local storage", e);
        }
    }

    /**
     * Creates an optimized image with maximum 1MB size.
     * Only stores the main optimized image (no original, no multiple sizes).
     *
     * @param file The uploaded file.
     * @param fileName The target filename.
     * @param uploadPath The upload directory path.
     * @return The final filename that was saved.
     */
    private String createOptimizedImage(MultipartFile file, String fileName, Path uploadPath) throws IOException {
        String nameWithoutExt = getFileNameWithoutExtension(fileName);
        
        // Force JPEG format for better compression
        String finalFileName = nameWithoutExt + ".jpg";
        Path finalPath = uploadPath.resolve(finalFileName);

        // Optimize: Read image only once, then adjust quality
        BufferedImage resizedImage;
        try {
            resizedImage = resizeImage(file.getInputStream(), MAX_SIZE);
            logger.debug("Image resized to {}x{}", resizedImage.getWidth(), resizedImage.getHeight());
        } catch (Exception e) {
            logger.error("Error resizing image: {}", e.getMessage());
            throw new IOException("Failed to resize image", e);
        }

        // Smart quality selection: start lower for large images
        float quality = INITIAL_QUALITY;
        int pixels = resizedImage.getWidth() * resizedImage.getHeight();
        if (pixels > 2000000) { // > 2MP
            quality = 0.7f;
        } else if (pixels > 1000000) { // > 1MP  
            quality = 0.75f;
        }
        
        byte[] optimizedImageBytes;
        int attempts = 0;
        
        do {
            try {
                optimizedImageBytes = imageToBytes(resizedImage, quality);
                attempts++;
                
                if (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES && attempts < 3) {
                    quality -= 0.15f; // Bigger steps to reduce iterations
                    logger.debug("Image {}KB > {}KB, reducing quality to {}", 
                        optimizedImageBytes.length / 1024, MAX_FILE_SIZE_BYTES / 1024, quality);
                }
            } catch (Exception e) {
                logger.error("Error compressing image with quality {}: {}", quality, e.getMessage());
                throw new IOException("Failed to compress image", e);
            }

        } while (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES && quality >= MIN_QUALITY && attempts < 3);

        // If still too large even at minimum quality, try smaller dimensions
        if (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES) {
            logger.warn("Image still too large at minimum quality, reducing dimensions");
            optimizedImageBytes = createSmallerImage(file);
        }

        // Save the optimized image
        Files.write(finalPath, optimizedImageBytes);
        
        long finalSizeKB = optimizedImageBytes.length / 1024;
        logger.info("✅ Created optimized image: {} ({}KB, quality: {})", 
            finalFileName, finalSizeKB, quality);

        return finalFileName;
    }

    /**
     * Store original file without modifying bytes (preserve EXIF and original format).
     */
    private String storeOriginalFile(MultipartFile file, String desiredFileName, Path uploadPath) throws IOException {
        String targetName = sanitizeFileName(desiredFileName != null ? desiredFileName : file.getOriginalFilename());
        if (targetName == null || targetName.isBlank()) {
            targetName = UUID.randomUUID().toString();
        }
        // Ensure filename has an extension; fall back to content-type
        if (!targetName.contains(".")) {
            String ext = getExtensionFromContentType(file.getContentType());
            if (ext != null && !ext.isBlank()) {
                targetName = targetName + "." + ext;
            }
        }
        Path finalPath = uploadPath.resolve(targetName);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, finalPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
        return finalPath.getFileName().toString();
    }

    /**
     * Creates a smaller image when quality reduction isn't enough.
     * Optimized to reduce file reading and processing iterations.
     */
    private byte[] createSmallerImage(MultipartFile file) throws IOException {
        // Try only 2 smaller sizes with moderate quality
        int[] dimensions = {1200, 800};
        float quality = 0.6f; // Start with moderate quality
        
        for (int maxDim : dimensions) {
            try {
                BufferedImage resizedImage = resizeImage(file.getInputStream(), maxDim);
                byte[] imageBytes = imageToBytes(resizedImage, quality);
                
                if (imageBytes.length <= MAX_FILE_SIZE_BYTES) {
                    logger.info("Achieved target size with {}px max dimension at quality {}", 
                        maxDim, quality);
                    return imageBytes;
                }
            } catch (Exception e) {
                logger.warn("Failed to resize to {}px: {}", maxDim, e.getMessage());
            }
        }
        
        // Last resort - small image with low quality
        BufferedImage lastResort = resizeImage(file.getInputStream(), 600);
        return imageToBytes(lastResort, MIN_QUALITY);
    }

    /**
     * Resizes an image to fit within the specified maximum dimension.
     */
    private BufferedImage resizeImage(InputStream inputStream, int maxDimension) throws IOException {
        BufferedImage originalImage = ImageIO.read(inputStream);
        if (originalImage == null) {
            throw new IOException("Unsupported image format or unreadable image");
        }

        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        // Calculate new dimensions maintaining aspect ratio; never upscale
        double ratio = Math.min((double) maxDimension / originalWidth, (double) maxDimension / originalHeight);
        ratio = Math.min(1.0, ratio);
        int newWidth = Math.max(1, (int) Math.round(originalWidth * ratio));
        int newHeight = Math.max(1, (int) Math.round(originalHeight * ratio));

        // Create resized image
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();

        // Set rendering hints for better quality
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g2d.dispose();

        return resizedImage;
    }



    /**
     * Converts BufferedImage to byte array with specified quality.
     */
    private byte[] imageToBytes(BufferedImage image, float quality) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        // Get JPEG writer
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("No JPEG writer available");
        }
        
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        
        // Set compression quality
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality);
        
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
            writer.setOutput(ios);
            writer.write(null, new javax.imageio.IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
        
        return baos.toByteArray();
    }

    /**
     * Deletes a file from local storage.
     *
     * @param fileUrl The full URL of the file to delete.
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract filename from URL
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path uploadPath = Paths.get(uploadDir);
            Path filePath = uploadPath.resolve(fileName);
            
            boolean deleted = Files.deleteIfExists(filePath);
            
            if (deleted) {
                logger.info("✅ Deleted file: {}", fileName);
            } else {
                logger.warn("File not found for deletion: {}", fileName);
            }

        } catch (Exception e) {
            logger.error("Error deleting file: {}", fileUrl, e);
            throw new RuntimeException("Error deleting file from local storage", e);
        }
    }

    /**
     * Gets the URL for the optimized image.
     * Since we only store one optimized version, this always returns the same URL.
     *
     * @param originalUrl The image URL.
     * @param size The desired size (ignored - only one size available).
     * @return The URL for the optimized image.
     */
    public String getImageUrl(String originalUrl, String size) {
        // Since we only store one optimized version, return the original URL
        // If it's a full URL, extract just the path part
        if (originalUrl != null && originalUrl.startsWith("http")) {
            int pathIndex = originalUrl.indexOf("/api/images/uploads/");
            if (pathIndex != -1) {
                return originalUrl.substring(pathIndex);
            }
        }
        return originalUrl;
    }

    /**
     * Checks if the uploaded file is an image based on content type.
     */
    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    /**
     * Sanitizes a filename by removing or replacing invalid characters.
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null) return "unknown";
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /**
     * Extracts the file extension from a filename.
     */
    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return "jpg"; // Default extension
    }

    /**
     * Map content-type to a typical file extension.
     */
    private String getExtensionFromContentType(String contentType) {
        if (contentType == null) return null;
        String ct = contentType.toLowerCase();
        if (ct.equals("image/jpeg")) return "jpg";
        if (ct.equals("image/png")) return "png";
        if (ct.equals("image/webp")) return "webp";
        if (ct.equals("image/gif")) return "gif";
        if (ct.equals("image/bmp")) return "bmp";
        if (ct.equals("image/heic")) return "heic";
        if (ct.equals("image/heif")) return "heif";
        return null;
    }

    /**
     * Gets the filename without extension.
     */
    private String getFileNameWithoutExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            return fileName.substring(0, dotIndex);
        }
        return fileName;
    }

    // Checks if ImageIO can decode the uploaded image format
    private boolean canDecodeImage(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            BufferedImage img = ImageIO.read(in);
            return img != null;
        } catch (IOException e) {
            return false;
        }
    }
}
