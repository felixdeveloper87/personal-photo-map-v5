package com.personalphotomap.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
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
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;

@Service
public class LocalFileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    @Value("${app.base.url:http://localhost:8092}")
    private String baseUrl;

    @Value("${app.images.passthrough:false}")
    private boolean passthroughStore;

    private static final int MAX_SIZE = 1920;
    private static final int MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
    private static final float INITIAL_QUALITY = 0.9f;
    private static final float MIN_QUALITY = 0.3f;

    private static boolean configurationLogged = false;

    public String uploadFile(MultipartFile file) {
        String fileName = UUID.randomUUID().toString() + "-" + sanitizeFileName(file.getOriginalFilename());
        return uploadFile(file, fileName);
    }

    public String uploadFile(MultipartFile file, String customFileName) {
        if (!configurationLogged) {
            logger.info("🔧 LocalFileStorageService configuration:");
            logger.info("   - Upload directory: {}", uploadDir);
            logger.info("   - Base URL: {}", baseUrl);
            logger.info("   - Passthrough mode: {}", passthroughStore);
            logger.info("   - Max image size: {}px", MAX_SIZE);
            logger.info("   - Max file size: {}KB", MAX_FILE_SIZE_BYTES / 1024);
            configurationLogged = true;
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            logger.info("🔍 Upload path: {}", uploadPath.toAbsolutePath());
            logger.info("🔍 Upload path exists: {}", Files.exists(uploadPath));
            logger.info("🔍 Upload path is writable: {}", Files.isWritable(uploadPath));
            
            if (!Files.exists(uploadPath)) {
                logger.info("🔧 Creating upload directory: {}", uploadPath.toAbsolutePath());
                Files.createDirectories(uploadPath);
                logger.info("✅ Upload directory created successfully");
            }

            if (!isImageFile(file)) {
                throw new RuntimeException("Only image files are supported");
            }

            long fileSizeKB = file.getSize() / 1024;
            logger.info("🔍 Image size: {}KB, needs processing: {}", fileSizeKB, fileSizeKB > 1024);

            if (fileSizeKB > 1024) {
                logger.info("🔄 Image is larger than 1MB, processing and optimizing: {}", file.getOriginalFilename());
                String finalFileName = createOptimizedImage(file, customFileName, uploadPath);
                String fileUrl = "/api/images/uploads/" + finalFileName;
                logger.info("✅ Optimized image uploaded successfully: {} -> {}", file.getOriginalFilename(), fileUrl);
                return fileUrl;
            } else {
                logger.info("📁 Image is 1MB or smaller, storing original: {}", file.getOriginalFilename());
                String finalFileName = storeOriginalFile(file, customFileName, uploadPath);
                String fileUrl = "/api/images/uploads/" + finalFileName;
                logger.info("✅ Original image stored: {} -> {}", file.getOriginalFilename(), fileUrl);
                return fileUrl;
            }

        } catch (IOException e) {
            logger.error("❌ IOException during file upload: {} | Error: {}", file.getOriginalFilename(), e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to local storage", e);
        } catch (Exception e) {
            logger.error("❌ Unexpected error during file upload: {} | Error: {}", file.getOriginalFilename(), e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to local storage", e);
        }
    }

    private String createOptimizedImage(MultipartFile file, String fileName, Path uploadPath) throws IOException {
        logger.info("🔄 Starting image optimization for: {} (original size: {}KB)",
                file.getOriginalFilename(), file.getSize() / 1024);

        String nameWithoutExt = getFileNameWithoutExtension(fileName);
        String finalFileName = nameWithoutExt + ".jpg";
        Path finalPath = uploadPath.resolve(finalFileName);

        BufferedImage resizedImage = resizeImage(file, MAX_SIZE);
        logger.info("📐 Image resized to {}x{} (max size: {})",
                resizedImage.getWidth(), resizedImage.getHeight(), MAX_SIZE);

        float quality = INITIAL_QUALITY;
        int pixels = resizedImage.getWidth() * resizedImage.getHeight();
        if (pixels > 2000000) {
            quality = 0.7f;
        } else if (pixels > 1000000) {
            quality = 0.75f;
        }

        byte[] optimizedImageBytes;
        int attempts = 0;

        do {
            optimizedImageBytes = imageToBytes(resizedImage, quality);
            attempts++;
            if (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES && attempts < 5) {
                quality -= 0.1f;
                logger.debug("Image {}KB > {}KB, reducing quality to {}",
                        optimizedImageBytes.length / 1024, MAX_FILE_SIZE_BYTES / 1024, quality);
            }
        } while (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES && quality >= MIN_QUALITY && attempts < 5);

        if (optimizedImageBytes.length > MAX_FILE_SIZE_BYTES) {
            logger.warn("Image still too large at minimum quality, reducing dimensions");
            optimizedImageBytes = createSmallerImage(file);
        }

        logger.info("🔧 Writing optimized image to: {}", finalPath.toAbsolutePath());
        Files.write(finalPath, optimizedImageBytes);
        logger.info("✅ Successfully wrote optimized image file");

        long finalSizeKB = optimizedImageBytes.length / 1024;
        long originalSizeKB = file.getSize() / 1024;
        float compressionRatio = (float) finalSizeKB / originalSizeKB * 100;

        logger.info("✅ Created optimized image: {} ({}KB -> {}KB, quality: {}, compression: {:.1f}%)",
                finalFileName, originalSizeKB, finalSizeKB, quality, compressionRatio);

        return finalFileName;
    }

    private String storeOriginalFile(MultipartFile file, String desiredFileName, Path uploadPath) throws IOException {
        String targetName = sanitizeFileName(desiredFileName != null ? desiredFileName : file.getOriginalFilename());
        if (targetName == null || targetName.isBlank()) {
            targetName = UUID.randomUUID().toString();
        }
        if (!targetName.contains(".")) {
            String ext = getExtensionFromContentType(file.getContentType());
            if (ext != null && !ext.isBlank()) {
                targetName = targetName + "." + ext;
            }
        }
        Path finalPath = uploadPath.resolve(targetName);
        logger.info("🔧 Storing original file to: {}", finalPath.toAbsolutePath());
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, finalPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
        logger.info("✅ Successfully stored original file");
        return finalPath.getFileName().toString();
    }

    private byte[] createSmallerImage(MultipartFile file) throws IOException {
        int[] dimensions = {1600, 1200, 800, 600};
        float[] qualities = {0.7f, 0.6f, 0.5f, 0.4f};

        for (int i = 0; i < dimensions.length; i++) {
            int maxDim = dimensions[i];
            float quality = qualities[i];
            
            BufferedImage resizedImage = resizeImage(file, maxDim);
            byte[] imageBytes = imageToBytes(resizedImage, quality);
            if (imageBytes.length <= MAX_FILE_SIZE_BYTES) {
                logger.info("Achieved target size with {}px max dimension at quality {}", maxDim, quality);
                return imageBytes;
            }
        }

        // Last resort: very small size with minimum quality
        BufferedImage lastResort = resizeImage(file, 400);
        return imageToBytes(lastResort, MIN_QUALITY);
    }

    /**
     * Lê EXIF orientation num stream e a imagem completa em outro stream.
     */
    private BufferedImage resizeImage(MultipartFile file, int maxDimension) throws IOException {
        int orientation = 1;
        BufferedImage originalImage;
        
        // Read the entire file into bytes first to avoid stream issues
        byte[] fileBytes = file.getBytes();
        
        // Read EXIF orientation from bytes
        try (ByteArrayInputStream metaStream = new ByteArrayInputStream(fileBytes)) {
            Metadata metadata = ImageMetadataReader.readMetadata(metaStream);
            Directory directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (directory != null && directory.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                orientation = directory.getInt(ExifIFD0Directory.TAG_ORIENTATION);
            }
        } catch (Exception e) {
            logger.debug("❌ Could not read EXIF orientation: {}", e.getMessage());
        }
        
        // Read the image from bytes
        try (ByteArrayInputStream imageStream = new ByteArrayInputStream(fileBytes)) {
            originalImage = ImageIO.read(imageStream);
        }
        if (originalImage == null) {
            throw new IOException("Unsupported image format or unreadable image");
        }

        // aplica correção de orientação
        originalImage = applyOrientation(originalImage, orientation);

        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        double ratio = Math.min((double) maxDimension / originalWidth, (double) maxDimension / originalHeight);
        ratio = Math.min(1.0, ratio);
        int newWidth = Math.max(1, (int) Math.round(originalWidth * ratio));
        int newHeight = Math.max(1, (int) Math.round(originalHeight * ratio));

        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g2d.dispose();

        return resizedImage;
    }

    private BufferedImage applyOrientation(BufferedImage image, int orientation) {
        if (orientation == 1) return image;

        int width = image.getWidth();
        int height = image.getHeight();
        BufferedImage rotatedImage;
        Graphics2D g2d;

        switch (orientation) {
            case 3: // 180
                rotatedImage = new BufferedImage(width, height, image.getType());
                g2d = rotatedImage.createGraphics();
                g2d.rotate(Math.PI, width / 2.0, height / 2.0);
                g2d.drawImage(image, 0, 0, null);
                g2d.dispose();
                return rotatedImage;
            case 6: // 90 clockwise
                rotatedImage = new BufferedImage(height, width, image.getType());
                g2d = rotatedImage.createGraphics();
                g2d.translate(height, 0);
                g2d.rotate(Math.PI / 2);
                g2d.drawImage(image, 0, 0, null);
                g2d.dispose();
                return rotatedImage;
            case 8: // 90 counter-clockwise
                rotatedImage = new BufferedImage(height, width, image.getType());
                g2d = rotatedImage.createGraphics();
                g2d.translate(0, width);
                g2d.rotate(-Math.PI / 2);
                g2d.drawImage(image, 0, 0, null);
                g2d.dispose();
                return rotatedImage;
            default:
                return image;
        }
    }

    private byte[] imageToBytes(BufferedImage image, float quality) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) throw new IOException("No JPEG writer available");
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
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

    public void deleteFile(String fileUrl) {
        try {
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

    public String getImageUrl(String originalUrl, String size) {
        if (originalUrl != null && originalUrl.startsWith("http")) {
            int pathIndex = originalUrl.indexOf("/api/images/uploads/");
            if (pathIndex != -1) {
                return originalUrl.substring(pathIndex);
            }
        }
        return originalUrl;
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null) return "unknown";
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return "jpg";
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null) return null;
        String ct = contentType.toLowerCase();
        switch (ct) {
            case "image/jpeg": return "jpg";
            case "image/png": return "png";
            case "image/webp": return "webp";
            case "image/gif": return "gif";
            case "image/bmp": return "bmp";
            case "image/heic": return "heic";
            case "image/heif": return "heif";
            default: return null;
        }
    }

    private String getFileNameWithoutExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            return fileName.substring(0, dotIndex);
        }
        return fileName;
    }
}
