package com.personalphotomap.controller;

import com.personalphotomap.dto.ImageDTO;
import com.personalphotomap.dto.CountryPhotoSummaryDTO;
import com.personalphotomap.service.ImageService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * ImageController
 *
 * REST controller responsible for handling image-related operations.
 *
 * - Allows authenticated users to upload, retrieve, and delete images.
 * - All endpoints return data as JSON, enabled by the @RestController annotation.
 * - Uses JWT from Authorization header to validate and identify users.
 * - Supports operations by country, year, and image ID, including batch deletions.
 */

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // ===============================
    // POST METHOD
    // ===============================

    /**
     * Handles image upload from the user.
     * Accepts multiple images, associates them with a country and year,
     * and uploads them asynchronously to S3 and the database.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImages(
            @RequestParam("images") List<MultipartFile> files,
            @RequestParam("countryId") String countryId,
            @RequestParam("year") int year,
            @RequestHeader("Authorization") String token) {
        
        // Debug logging
        System.out.println("🔍 Upload request received:");
        System.out.println("🔍 CountryId: " + countryId);
        System.out.println("🔍 Year: " + year);
        System.out.println("🔍 Files count: " + files.size());
        System.out.println("🔍 Token: " + (token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null"));
        
        try {
            List<String> urls = imageService.handleUpload(files, countryId, year, token);
            return ResponseEntity.ok(Map.of("message", "Images uploaded successfully.", "imageUrls", urls));
        } catch (IllegalArgumentException e) {
            System.out.println("❌ IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed.");
        }
    }

    // ===============================
    // DELETE METHODS
    // ===============================

    /**
     * Deletes all images from a given country for the authenticated user.
     */
    @DeleteMapping("/delete-all-images/{countryId}") // ✅
    public ResponseEntity<?> deleteAllImagesByCountry(
            @PathVariable String countryId,
            @RequestHeader("Authorization") String token) {
        try {
            imageService.deleteAllImagesByCountry(countryId, token);
            return ResponseEntity.ok("All images for country " + countryId + " have been successfully deleted.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete images.");
        }
    }

    /**
     * Deletes images by country and year.
     * Currently not used on the frontend, but ready for future use.
     */
    @DeleteMapping("/{countryId}/{year}") // ✅ ANALIZAR PQ NAO ESTOU USANDO NO FRONT
    public ResponseEntity<?> deleteImagesByCountryAndYear(
            @PathVariable String countryId,
            @PathVariable int year,
            @RequestHeader("Authorization") String token) {
        try {
            imageService.deleteImagesByCountryAndYear(countryId, year, token);
            return ResponseEntity.ok("Images from " + countryId + " in year " + year + " were successfully deleted.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete images.");
        }
    }

    /**
     * Deletes a single image by its ID.
     * Only allowed if the image belongs to the authenticated user.
     */
    @DeleteMapping("/delete/{id}") // ✅
    public ResponseEntity<?> deleteImageById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            imageService.deleteImageById(id, token);
            return ResponseEntity.ok("Image successfully deleted.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete image.");
        }
    }

    /**
     * Deletes multiple images by their IDs.
     * All images must belong to the authenticated user.
     */
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> deleteMultipleImages(
            @RequestBody List<Long> imageIds,
            @RequestHeader("Authorization") String token) {
        try {
            imageService.deleteMultipleImages(imageIds, token);
            return ResponseEntity.ok("Images deleted successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete images.");
        }
    }

    // ===============================
    // GET METHODS
    // ===============================

    /**
     * Retrieves all images for a specific country from the authenticated user.
     */
    @GetMapping("/{countryId}")
    public ResponseEntity<List<ImageDTO>> getImagesByCountry(
            @PathVariable String countryId,
            @RequestHeader("Authorization") String token) {
        try {
            List<ImageDTO> images = imageService.getImagesByCountry(countryId, token);
            return ResponseEntity.ok(images);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Returns a list of countries where the user has uploaded at least one image.
     */
    @GetMapping("/countries-with-photos")
    public ResponseEntity<List<String>> getCountriesWithPhotos(@RequestHeader("Authorization") String token) {
        try {
            List<String> countries = imageService.getCountriesWithPhotos(token);
            return ResponseEntity.ok(countries);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Returns detailed information about countries where the user has photos.
     * Used by MapInteractions to display country information on the map.
     */
    @GetMapping("/countries-with-photos-detailed")
    public ResponseEntity<List<CountryPhotoSummaryDTO>> getCountriesWithPhotosDetailed(@RequestHeader("Authorization") String token) {
        try {
            List<CountryPhotoSummaryDTO> countries = imageService.getCountriesWithPhotosDetailed(token);
            return ResponseEntity.ok(countries);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Returns a list of available years the user has uploaded photos in.
     */
    @GetMapping("/available-years")
    public ResponseEntity<List<Integer>> getAvailableYears(@RequestHeader("Authorization") String token) {
        try {
            List<Integer> years = imageService.getAvailableYears(token);
            return ResponseEntity.ok(years);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Retrieves all images from the authenticated user.
     * Optional year filtering can be applied.
     */
    @GetMapping("/allPictures")
    public ResponseEntity<List<ImageDTO>> getAllImages(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Integer year) {
        try {
            List<ImageDTO> images = imageService.getAllImages(token, year);
            return ResponseEntity.ok(images);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Returns the list of years for which the user has uploaded images for a
     * specific country.
     */
    @GetMapping("/{countryId}/available-years")
    public ResponseEntity<List<Integer>> getYearsByCountry(
            @PathVariable String countryId,
            @RequestHeader("Authorization") String token) {
        try {
            List<Integer> years = imageService.getYearsByCountry(countryId, token);
            return ResponseEntity.ok(years);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Returns all images from a specific country and year for the authenticated
     * user.
     */
    @GetMapping("/{countryId}/{year}")
    public ResponseEntity<List<ImageDTO>> getImagesByCountryAndYear(
            @PathVariable String countryId,
            @PathVariable int year,
            @RequestHeader("Authorization") String token) {
        try {
            List<ImageDTO> images = imageService.getImagesByCountryAndYear(countryId, year, token);
            return ResponseEntity.ok(images);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Returns the total number of photos and countries visited by the user.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> countUserPhotosAndCountries(
            @RequestHeader("Authorization") String token) {
        try {
            Map<String, Object> response = imageService.countUserPhotosAndCountries(token);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
