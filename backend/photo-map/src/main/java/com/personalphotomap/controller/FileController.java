package com.personalphotomap.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * FileController
 * 
 * REST controller for serving staticc files from local storage.
 * Replaces AWS S3 public URL functionality by serving files directly from the
 * VPS.
 * 
 * Features:
 * - Serves images from local upload directory
 * - Handles different image sizes (original, medium, thumbnail)
 * - Sets appropriate content types and headers
 * - Security checks to prevent directory traversal
 */

@RestController
@RequestMapping("/api/images/uploads")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;


    /**
     * Serves image files from the local upload directory.
     * 
     * @param filename The name of the file to serve
     * @return ResponseEntity with the file resource
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            logger.info("🔍 FileController: Attempting to serve file: {}", filename);
            logger.info("🔍 Upload directory: {}", uploadDir);
            
            // Security: Sanitize filename to prevent directory traversal
            String sanitizedFilename = sanitizeFilename(filename);
            logger.info("🔍 Sanitized filename: {}", sanitizedFilename);

            Path file = Paths.get(uploadDir).resolve(sanitizedFilename);
            logger.info("🔍 Full file path: {}", file.toAbsolutePath());
            
            // Check if file exists before creating resource
            if (!Files.exists(file)) {
                logger.warn("❌ File does not exist: {} | Path: {}", sanitizedFilename, file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                logger.warn("❌ File not found or not readable: {} | Path: {}", sanitizedFilename, file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            // Security check: Ensure the resolved path is within the upload directory
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = file.toAbsolutePath().normalize();

            if (!filePath.startsWith(uploadPath)) {
                logger.warn("❌ Security violation: Attempted to access file outside upload directory: {} | Upload path: {} | File path: {}", filename, uploadPath, filePath);
                return ResponseEntity.badRequest().build();
            }

            // Determine content type
            String contentType = determineContentType(file);
            logger.info("✅ File served successfully: {} | Content-Type: {}", filename, contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000") // Cache for 1 year
                    .header("Cross-Origin-Resource-Policy", "cross-origin")
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Malformed URL for file: {}", filename, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error serving file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Legacy endpoint for different image sizes.
     * Since we only store one optimized version, this redirects to the main file.
     * 
     * @param filename The base filename
     * @param size     The size variant (ignored)
     * @return ResponseEntity with the optimized image resource
     */
    @GetMapping("/{filename:.+}/size/{size}")
    public ResponseEntity<Resource> serveResizedFile(@PathVariable String filename, @PathVariable String size) {
        // Since we only have one optimized version, just serve the main file
        return serveFile(filename);
    }

    /**
     * Handle OPTIONS requests for CORS preflight.
     * CORS is now handled by Spring Security configuration.
     */
    @RequestMapping(value = "/{filename:.+}", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions(@PathVariable String filename) {
        logger.info("🔍 OPTIONS request for file: {}", filename);
        // CORS headers are handled by Spring Security configuration
        return ResponseEntity.ok().build();
    }

    /**
     * Health check endpoint for file serving.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            boolean uploadDirExists = Files.exists(uploadPath);
            boolean uploadDirWritable = Files.isWritable(uploadPath);
            
            logger.info("🔍 Health check - Upload dir: {} | Exists: {} | Writable: {}", uploadDir, uploadDirExists, uploadDirWritable);
            
            if (uploadDirExists && uploadDirWritable) {
                // Lista alguns arquivos para debug
                try {
                    long fileCount = Files.list(uploadPath).count();
                    logger.info("🔍 Upload directory contains {} files", fileCount);
                    
                    // Lista os primeiros 5 arquivos para debug
                    Files.list(uploadPath)
                        .limit(5)
                        .forEach(file -> logger.info("🔍 Found file: {}", file.getFileName()));
                        
                } catch (Exception e) {
                    logger.warn("Could not list files in upload directory: {}", e.getMessage());
                }
                
                return ResponseEntity.ok("File server is healthy - Upload dir: " + uploadDir);
            } else {
                String errorMsg = "Upload directory issues - exists: " + uploadDirExists + ", writable: " + uploadDirWritable + ", path: " + uploadDir;
                logger.error("❌ {}", errorMsg);
                return ResponseEntity.internalServerError().body(errorMsg);
            }
        } catch (Exception e) {
            logger.error("❌ Error checking file server health", e);
            return ResponseEntity.internalServerError().body("Error checking file server health: " + e.getMessage());
        }
    }

    /**
     * Sanitizes filename to prevent directory traversal attacks.
     */
    private String sanitizeFilename(String filename) {
        if (filename == null)
            return "";

        // Remove any path separators and parent directory references
        return filename.replaceAll("[/\\\\]", "")
                .replaceAll("\\.\\.", "")
                .trim();
    }

    /**
     * Determines the content type of a file based on its extension.
     */
    private String determineContentType(Path file) {
        try {
            String contentType = Files.probeContentType(file);
            if (contentType != null) {
                return contentType;
            }
        } catch (IOException e) {
            logger.debug("Could not determine content type for file: {}", file.getFileName());
        }

        // Fallback based on file extension
        String filename = file.getFileName().toString().toLowerCase();
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".webp")) {
            return "image/webp";
        } else if (filename.endsWith(".bmp")) {
            return "image/bmp";
        } else {
            return "application/octet-stream";
        }
    }

    /**
     * Extracts the file extension from a filename.
     */
    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1).toLowerCase();
        }
        return "jpg";
    }

    /**
     * Gets the filename without extension.
     */
    private String getFileNameWithoutExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            return filename.substring(0, dotIndex);
        }
        return filename;
    }

}
