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
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;

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

        // Start with initial quality and reduce until under 1MB
        float quality = INITIAL_QUALITY;
        byte[] optimizedImageBytes;
        
        do {
            try {
                // Read and resize image
                BufferedImage resizedImage = resizeImage(file.getInputStream(), MAX_SIZE);
                
                // Convert to bytes with specified quality
                optimizedImageBytes = imageToBytes(resizedImage, quality);

            } catch (Exception e) {
                logger.error("Error creating optimized image with quality {}: {}", quality, e.getMessage());
                throw new IOException("Failed to optimize image", e);
            }

            // If still too large, reduce quality
            if (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES) {
                quality -= 0.1f;
                logger.debug("Image still {}KB, reducing quality to {}", 
                    optimizedImageBytes.length / 1024, quality);
            }

        } while (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES && quality >= MIN_QUALITY);

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
     * Creates a smaller image when quality reduction isn't enough.
     */
    private byte[] createSmallerImage(MultipartFile file) throws IOException {
        int[] dimensions = {1600, 1200, 800, 600, 400};
        
        for (int maxDim : dimensions) {
            float quality = INITIAL_QUALITY;
            
            do {
                BufferedImage resizedImage = resizeImage(file.getInputStream(), maxDim);
                byte[] imageBytes = imageToBytes(resizedImage, quality);
                
                if (imageBytes.length <= MAX_FILE_SIZE_BYTES) {
                    logger.info("Achieved target size with {}x{} dimensions at quality {}", 
                        maxDim, maxDim, quality);
                    return imageBytes;
                }
                
                quality -= 0.1f;
            } while (quality >= MIN_QUALITY);
        }
        
        // Last resort - very small image with minimum quality
        BufferedImage lastResort = resizeImage(file.getInputStream(), 300);
        return imageToBytes(lastResort, MIN_QUALITY);
    }

    /**
     * Resizes an image to fit within the specified maximum dimension.
     * Automatically corrects EXIF orientation to prevent rotation issues.
     */
    private BufferedImage resizeImage(InputStream inputStream, int maxDimension) throws IOException {
        // Reset stream for EXIF reading
        inputStream.mark(Integer.MAX_VALUE);
        
        // Read EXIF orientation first
        int orientation = 1; // Default: no rotation
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
            ExifIFD0Directory directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (directory != null && directory.hasTagName(ExifIFD0Directory.TAG_ORIENTATION)) {
                orientation = directory.getInt(ExifIFD0Directory.TAG_ORIENTATION);
                logger.debug("🔍 EXIF Orientation detected: {}", orientation);
            }
        } catch (Exception e) {
            logger.debug("Could not read EXIF orientation, using default: {}", e.getMessage());
        }
        
        // Reset stream for image reading
        inputStream.reset();
        BufferedImage originalImage = ImageIO.read(inputStream);
        
        // Apply EXIF orientation correction first
        BufferedImage correctedImage = correctImageOrientation(originalImage, orientation);
        
        int originalWidth = correctedImage.getWidth();
        int originalHeight = correctedImage.getHeight();
        
        // Calculate new dimensions maintaining aspect ratio
        double ratio = Math.min((double) maxDimension / originalWidth, (double) maxDimension / originalHeight);
        int newWidth = (int) (originalWidth * ratio);
        int newHeight = (int) (originalHeight * ratio);
        
        // Create resized image
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        
        // Set rendering hints for better quality
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2d.drawImage(correctedImage, 0, 0, newWidth, newHeight, null);
        g2d.dispose();
        
        logger.info("✅ Image resized and orientation corrected: {}x{} -> {}x{} (orientation: {})", 
                   originalImage.getWidth(), originalImage.getHeight(), newWidth, newHeight, orientation);
        
        return resizedImage;
    }

    /**
     * Corrects image orientation based on EXIF data.
     * This fixes the rotation issue that occurs with mobile photos.
     */
    private BufferedImage correctImageOrientation(BufferedImage image, int orientation) {
        int width = image.getWidth();
        int height = image.getHeight();
        
        BufferedImage correctedImage;
        AffineTransform transform = new AffineTransform();
        
        switch (orientation) {
            case 1: // Normal orientation
                return image;
                
            case 2: // Flip horizontal
                correctedImage = new BufferedImage(width, height, image.getType());
                transform.scale(-1.0, 1.0);
                transform.translate(-width, 0);
                break;
                
            case 3: // Rotate 180°
                correctedImage = new BufferedImage(width, height, image.getType());
                transform.translate(width, height);
                transform.rotate(Math.PI);
                break;
                
            case 4: // Flip vertical
                correctedImage = new BufferedImage(width, height, image.getType());
                transform.scale(1.0, -1.0);
                transform.translate(0, -height);
                break;
                
            case 5: // Rotate 90° CCW + flip horizontal
                correctedImage = new BufferedImage(height, width, image.getType());
                transform.rotate(-Math.PI / 2);
                transform.scale(-1.0, 1.0);
                break;
                
            case 6: // Rotate 90° CW
                correctedImage = new BufferedImage(height, width, image.getType());
                transform.translate(height, 0);
                transform.rotate(Math.PI / 2);
                break;
                
            case 7: // Rotate 90° CW + flip horizontal
                correctedImage = new BufferedImage(height, width, image.getType());
                transform.scale(-1.0, 1.0);
                transform.translate(-height, 0);
                transform.translate(height, 0);
                transform.rotate(Math.PI / 2);
                break;
                
            case 8: // Rotate 90° CCW
                correctedImage = new BufferedImage(height, width, image.getType());
                transform.translate(0, width);
                transform.rotate(-Math.PI / 2);
                break;
                
            default:
                logger.warn("Unknown EXIF orientation: {}, using original image", orientation);
                return image;
        }
        
        Graphics2D g2d = correctedImage.createGraphics();
        g2d.setTransform(transform);
        g2d.drawImage(image, 0, 0, null);
        g2d.dispose();
        
        logger.debug("✅ Applied EXIF orientation correction: {} -> {}x{}", orientation, 
                    correctedImage.getWidth(), correctedImage.getHeight());
        
        return correctedImage;
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
     * Gets the filename without extension.
     */
    private String getFileNameWithoutExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            return fileName.substring(0, dotIndex);
        }
        return fileName;
    }
}
