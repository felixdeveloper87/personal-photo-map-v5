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
import javax.imageio.metadata.IIOMetadata;
import javax.imageio.metadata.IIOMetadataNode;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
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
import org.w3c.dom.NodeList;

/**
 * LocalFileStorageService
 *
 * Manages file uploads to local storage with automatic image resizing and EXIF
 * orientation correction.
 * Replaces AWS S3 functionality with local VPS storage.
 *
 * Features:
 * - Stores original and resized images locally
 * - Creates multiple image sizes (thumbnail, medium, original)
 * - Provides file deletion functionality
 * - Thread-safe file operations
 * - EXIF orientation correction for mobile photos
 */
@Service
public class LocalFileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    @Value("${app.base.url:http://localhost:8092}")
    private String baseUrl;

    // If true, store original bytes (preserve EXIF/orientation/format)
    @Value("${app.images.passthrough:false}")
    private boolean passthroughStore;

    // Image size configurations
    private static final int MAX_SIZE = 1920;
    private static final int MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB
    private static final int MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final float INITIAL_QUALITY = 0.9f;
    private static final float MIN_QUALITY = 0.3f;

    // Flag to log configuration only once
    private static boolean configurationLogged = false;

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
     * @param file           The MultipartFile to upload.
     * @param customFileName The exact filename to store locally.
     * @return The public URL of the uploaded file.
     */
    public String uploadFile(MultipartFile file, String customFileName) {
        // Log configuration on first upload
        if (!configurationLogged) {
            logger.info("🔧 LocalFileStorageService configuration:");
            logger.info("   - Upload directory: {}", uploadDir);
            logger.info("   - Base URL: {}", baseUrl);
            logger.info("   - Passthrough mode: {}", passthroughStore);
            logger.info("   - Max image size: {}px", MAX_SIZE);
            logger.info("   - Max file size: {}KB", MAX_FILE_SIZE_BYTES / 1024);
            logger.info("   - Max upload size: {}MB", MAX_UPLOAD_SIZE_BYTES / (1024 * 1024));
            configurationLogged = true;
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            logger.info("🔍 Upload path: {}", uploadPath.toAbsolutePath());
            logger.info("🔍 Upload path exists: {}", Files.exists(uploadPath));
            logger.info("🔍 Upload path is writable: {}", Files.isWritable(uploadPath));

            if (!Files.exists(uploadPath)) {
                logger.info("🔧 Creating upload directory: {}", uploadPath.toAbsolutePath());
                Files.createDirectories(uploadPath);
                logger.info("✅ Upload directory created successfully");
            }

            // Check if it's an image file
            if (!isImageFile(file)) {
                throw new RuntimeException("Only image files are supported");
            }

            // Check file size limits
            long fileSizeBytes = file.getSize();
            long fileSizeKB = fileSizeBytes / 1024;
            long fileSizeMB = fileSizeBytes / (1024 * 1024);

            // Reject files larger than 10MB
            if (fileSizeBytes > MAX_UPLOAD_SIZE_BYTES) {
                throw new RuntimeException("File too large: " + fileSizeMB + "MB. Maximum allowed: 10MB");
            }

            logger.info("🔍 Image size: {}KB ({}MB), needs processing: {}", fileSizeKB, fileSizeMB, fileSizeKB > 1024);

            if (fileSizeKB > 1024) {
                // Process if larger than 1MB
                logger.info("🔄 Image is larger than 1MB, processing and optimizing to ≤1MB: {}",
                        file.getOriginalFilename());
                String finalFileName = createOptimizedImage(file, customFileName, uploadPath);
                String fileUrl = "/api/images/uploads/" + finalFileName;
                logger.info("✅ Optimized image uploaded successfully: {} -> {}", file.getOriginalFilename(), fileUrl);
                return fileUrl;
            } else {
                logger.info("📁 Image is 1MB or smaller, storing with orientation correction: {}",
                        file.getOriginalFilename());
                String finalFileName = storeOriginalFileWithOrientation(file, customFileName, uploadPath);
                String fileUrl = "/api/images/uploads/" + finalFileName;
                logger.info("✅ Original image stored with orientation correction: {} -> {}", file.getOriginalFilename(),
                        fileUrl);
                return fileUrl;
            }

        } catch (IOException e) {
            logger.error("❌ IOException during file upload: {} | Error: {}", file.getOriginalFilename(), e.getMessage(),
                    e);
            throw new RuntimeException("Failed to upload file to local storage", e);
        } catch (Exception e) {
            logger.error("❌ Unexpected error during file upload: {} | Error: {}", file.getOriginalFilename(),
                    e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to local storage", e);
        }
    }

    /**
     * Creates an optimized image with maximum 1MB size and correct EXIF
     * orientation.
     * Only stores the main optimized image (no original, no multiple sizes).
     *
     * @param file       The uploaded file.
     * @param fileName   The target filename.
     * @param uploadPath The upload directory path.
     * @return The final filename that was saved.
     */
    private String createOptimizedImage(MultipartFile file, String fileName, Path uploadPath) throws IOException {
        logger.info("🔄 Starting image optimization for: {} (original size: {}KB)",
                file.getOriginalFilename(), file.getSize() / 1024);

        String nameWithoutExt = getFileNameWithoutExtension(fileName);
        // Force JPEG format for better compression
        String finalFileName = nameWithoutExt + ".jpg";
        Path finalPath = uploadPath.resolve(finalFileName);

        // Read image only once with correct orientation
        BufferedImage originalImage;
        try (InputStream inputStream = file.getInputStream()) {
            originalImage = readImageWithOrientation(inputStream);
            if (originalImage == null) {
                throw new IOException("Unsupported image format or unreadable image");
            }
            logger.info("📱 Original image loaded: {}x{}", originalImage.getWidth(), originalImage.getHeight());
        }

        // Resize from the correctly oriented image
        BufferedImage resizedImage = resizeImageFromBuffered(originalImage, MAX_SIZE);
        logger.info("📐 Image resized to {}x{} (max size: {})",
                resizedImage.getWidth(), resizedImage.getHeight(), MAX_SIZE);

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
            optimizedImageBytes = createSmallerImageFromBuffered(originalImage);
        }

        // Save the optimized image
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

    /**
     * Store original file with EXIF orientation correction applied.
     */
    private String storeOriginalFileWithOrientation(MultipartFile file, String desiredFileName, Path uploadPath)
            throws IOException {
        String targetName = sanitizeFileName(desiredFileName != null ? desiredFileName : file.getOriginalFilename());
        if (targetName == null || targetName.isBlank()) {
            targetName = UUID.randomUUID().toString();
        }

        // For small images, we'll still apply orientation correction and save as JPEG
        String nameWithoutExt = getFileNameWithoutExtension(targetName);
        String finalFileName = nameWithoutExt + ".jpg";
        Path finalPath = uploadPath.resolve(finalFileName);

        logger.info("🔧 Storing small image with orientation correction to: {}", finalPath.toAbsolutePath());

        // Read with orientation correction
        BufferedImage correctedImage;
        try (InputStream inputStream = file.getInputStream()) {
            correctedImage = readImageWithOrientation(inputStream);
            if (correctedImage == null) {
                throw new IOException("Cannot read image");
            }
        }

        // Convert to bytes and save
        byte[] imageBytes = imageToBytes(correctedImage, 0.95f); // High quality for small images
        Files.write(finalPath, imageBytes);

        logger.info("✅ Successfully stored image with orientation correction");
        return finalFileName;
    }

    /**
     * Resize image from BufferedImage (already loaded in memory with correct
     * orientation).
     */
    private BufferedImage resizeImageFromBuffered(BufferedImage originalImage, int maxDimension) {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        // Calculate new dimensions maintaining aspect ratio; never upscale
        double ratio = Math.min((double) maxDimension / originalWidth, (double) maxDimension / originalHeight);
        ratio = Math.min(1.0, ratio);
        int newWidth = Math.max(1, (int) Math.round(originalWidth * ratio));
        int newHeight = Math.max(1, (int) Math.round(originalHeight * ratio));

        // Skip resizing if dimensions are the same
        if (newWidth == originalWidth && newHeight == originalHeight) {
            return originalImage;
        }

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
     * Creates a smaller image from BufferedImage when quality reduction isn't
     * enough.
     */
    private byte[] createSmallerImageFromBuffered(BufferedImage originalImage) throws IOException {
        // Try only 2 smaller sizes with moderate quality
        int[] dimensions = { 1200, 800 };
        float quality = 0.6f; // Start with moderate quality

        for (int maxDim : dimensions) {
            try {
                BufferedImage resizedImage = resizeImageFromBuffered(originalImage, maxDim);
                byte[] imageBytes = imageToBytes(resizedImage, quality);
                if (imageBytes.length <= MAX_FILE_SIZE_BYTES) {
                    logger.info("Achieved target size with {}px max dimension at quality {}", maxDim, quality);
                    return imageBytes;
                }
            } catch (Exception e) {
                logger.warn("Failed to resize to {}px: {}", maxDim, e.getMessage());
            }
        }

        // Last resort - small image with low quality
        BufferedImage lastResort = resizeImageFromBuffered(originalImage, 600);
        return imageToBytes(lastResort, MIN_QUALITY);
    }

    /**
     * Reads an image and applies EXIF orientation correction.
     * This ensures images from mobile devices (especially iPhones) are displayed
     * correctly.
     */
    private BufferedImage readImageWithOrientation(InputStream inputStream) throws IOException {
        BufferedImage image = null;
        int orientation = 1; // Default orientation

        // Mark the InputStream to allow reset
        if (!inputStream.markSupported()) {
            inputStream = new java.io.BufferedInputStream(inputStream);
        }

        try {
            inputStream.mark(Integer.MAX_VALUE);

            // Try to read EXIF metadata first
            try (ImageInputStream iis = ImageIO.createImageInputStream(inputStream)) {
                Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
                if (readers.hasNext()) {
                    ImageReader reader = readers.next();
                    try {
                        reader.setInput(iis);
                        orientation = getExifOrientation(reader);
                        image = reader.read(0);
                        logger.info("🔍 EXIF Orientation detected: {}", orientation);
                    } finally {
                        reader.dispose();
                    }
                }
            }

            // If couldn't read with ImageReader, use ImageIO.read
            if (image == null) {
                inputStream.reset();
                image = ImageIO.read(inputStream);
                logger.debug("📷 Image read with ImageIO.read (no EXIF orientation)");
            }

        } catch (Exception e) {
            logger.debug("Error reading image with EXIF: {}", e.getMessage());
            // Fallback: reset and read without EXIF
            try {
                inputStream.reset();
                image = ImageIO.read(inputStream);
                logger.debug("📷 Fallback: Image read without EXIF processing");
            } catch (Exception fallbackError) {
                logger.error("Failed to read image even with fallback: {}", fallbackError.getMessage());
                throw new IOException("Cannot read image", fallbackError);
            }
        }

        if (image == null) {
            throw new IOException("Cannot read image - unsupported format");
        }

        logger.info("📱 Image dimensions before orientation: {}x{}", image.getWidth(), image.getHeight());

        // Apply orientation correction
        BufferedImage correctedImage = applyOrientation(image, orientation);

        logger.info("📱 Image dimensions after orientation: {}x{}", correctedImage.getWidth(),
                correctedImage.getHeight());
        logger.info("🔄 Orientation correction applied: {}", orientation != 1 ? "YES" : "NO");

        return correctedImage;
    }

    /**
     * Extracts EXIF orientation value from image metadata.
     */
    private int getExifOrientation(ImageReader reader) {
        try {
            IIOMetadata metadata = reader.getImageMetadata(0);
            if (metadata == null) {
                logger.debug("No metadata available");
                return 1;
            }

            // Try different metadata formats
            String[] formats = metadata.getMetadataFormatNames();
            logger.debug("Available metadata formats: {}", String.join(", ", formats));

            for (String format : formats) {
                logger.debug("Checking metadata format: {}", format);

                try {
                    IIOMetadataNode root = (IIOMetadataNode) metadata.getAsTree(format);

                    // For JPEG images
                    if (format.contains("jpeg")) {
                        NodeList orientationNodes = root.getElementsByTagName("Orientation");
                        if (orientationNodes.getLength() > 0) {
                            IIOMetadataNode orientationNode = (IIOMetadataNode) orientationNodes.item(0);
                            String value = orientationNode.getAttribute("value");
                            if (value != null && !value.isEmpty()) {
                                int orientation = Integer.parseInt(value);
                                logger.info("📱 Found EXIF orientation in JPEG metadata: {}", orientation);
                                return orientation;
                            }
                        }
                    }

                    // For TIFF-based images (including HEIC converted to TIFF)
                    if (format.contains("tiff")) {
                        NodeList ifdNodes = root.getElementsByTagName("TIFFIFD");
                        for (int i = 0; i < ifdNodes.getLength(); i++) {
                            IIOMetadataNode ifdNode = (IIOMetadataNode) ifdNodes.item(i);
                            NodeList fieldNodes = ifdNode.getElementsByTagName("TIFFField");
                            for (int j = 0; j < fieldNodes.getLength(); j++) {
                                IIOMetadataNode fieldNode = (IIOMetadataNode) fieldNodes.item(j);
                                String number = fieldNode.getAttribute("number");
                                if ("274".equals(number)) { // 274 is the TIFF tag for Orientation
                                    NodeList shortNodes = fieldNode.getElementsByTagName("TIFFShort");
                                    if (shortNodes.getLength() > 0) {
                                        IIOMetadataNode shortNode = (IIOMetadataNode) shortNodes.item(0);
                                        String value = shortNode.getAttribute("value");
                                        if (value != null && !value.isEmpty()) {
                                            int orientation = Integer.parseInt(value);
                                            logger.info("📱 Found EXIF orientation in TIFF metadata: {}", orientation);
                                            return orientation;
                                        }
                                    }
                                }
                            }
                        }
                    }

                } catch (Exception e) {
                    logger.debug("Error reading format {}: {}", format, e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.debug("Could not read EXIF orientation: {}", e.getMessage());
        }

        logger.debug("📱 No EXIF orientation found, using default (1)");
        return 1; // Default orientation
    }

    /**
     * Applies orientation transformation to the image based on EXIF orientation
     * value.
     */
    private BufferedImage applyOrientation(BufferedImage image, int orientation) {
        logger.debug("🔄 Applying EXIF orientation: {}", orientation);

        if (orientation == 1) {
            logger.debug("✅ No orientation correction needed");
            return image; // No rotation needed
        }

        int width = image.getWidth();
        int height = image.getHeight();
        BufferedImage rotatedImage;
        Graphics2D g2d;

        switch (orientation) {
            case 2: // Flip horizontal
                rotatedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.drawImage(image, width, 0, -width, height, null);
                g2d.dispose();
                logger.info("✅ Applied horizontal flip (orientation 2)");
                return rotatedImage;

            case 3: // Rotate 180 degrees
                rotatedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.translate(height, 0); // Move o origem
                g2d.rotate(Math.PI / 2); // Rotaciona
                g2d.drawImage(image, 0, 0, null); // Desenha na posição correta
                g2d.dispose();
                logger.info("✅ Applied 180° rotation (orientation 3)");
                return rotatedImage;

            case 4: // Flip vertical
                rotatedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.drawImage(image, 0, height, width, -height, null);
                g2d.dispose();
                logger.info("✅ Applied vertical flip (orientation 4)");
                return rotatedImage;

            case 6: // Rotate 90 degrees clockwise
                rotatedImage = new BufferedImage(height, width, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.rotate(Math.PI / 2, height / 2.0, width / 2.0);
                g2d.drawImage(image, (height - width) / 2, (width - height) / 2, null);
                g2d.dispose();
                logger.info("✅ Applied 90° clockwise rotation (orientation 6)");
                return rotatedImage;

            case 8: // Rotate 90 degrees counter-clockwise
                rotatedImage = new BufferedImage(height, width, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.rotate(-Math.PI / 2, height / 2.0, width / 2.0);
                g2d.drawImage(image, (height - width) / 2, (width - height) / 2, null);
                g2d.dispose();
                logger.info("✅ Applied 90° counter-clockwise rotation (orientation 8)");
                return rotatedImage;

            case 5: // Rotate 90 degrees counter-clockwise and flip horizontal
                rotatedImage = new BufferedImage(height, width, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.rotate(-Math.PI / 2, height / 2.0, width / 2.0);
                g2d.scale(-1, 1);
                g2d.drawImage(image, -(height + width) / 2, (width - height) / 2, null);
                g2d.dispose();
                logger.info("✅ Applied 90° counter-clockwise + horizontal flip (orientation 5)");
                return rotatedImage;

            case 7: // Rotate 90 degrees clockwise and flip horizontal
                rotatedImage = new BufferedImage(height, width, BufferedImage.TYPE_INT_RGB);
                g2d = rotatedImage.createGraphics();
                g2d.rotate(Math.PI / 2, height / 2.0, width / 2.0);
                g2d.scale(-1, 1);
                g2d.drawImage(image, -(height + width) / 2, (width - height) / 2, null);
                g2d.dispose();
                logger.info("✅ Applied 90° clockwise + horizontal flip (orientation 7)");
                return rotatedImage;

            default:
                logger.warn("⚠️ Unknown orientation {}, returning original image", orientation);
                return image;
        }
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
     * @param size        The desired size (ignored - only one size available).
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
        if (fileName == null)
            return "unknown";
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
        if (contentType == null)
            return null;
        String ct = contentType.toLowerCase();
        if (ct.equals("image/jpeg"))
            return "jpg";
        if (ct.equals("image/png"))
            return "png";
        if (ct.equals("image/webp"))
            return "webp";
        if (ct.equals("image/gif"))
            return "gif";
        if (ct.equals("image/bmp"))
            return "bmp";
        if (ct.equals("image/heic"))
            return "heic";
        if (ct.equals("image/heif"))
            return "heif";
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
        } catch (Exception e) {
            logger.debug("Cannot decode image {}: {}", file.getOriginalFilename(), e.getMessage());
            return false;
        }
    }
}