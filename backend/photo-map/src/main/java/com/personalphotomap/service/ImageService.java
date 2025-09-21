package com.personalphotomap.service;

import com.personalphotomap.dto.ImageDTO;
import com.personalphotomap.dto.CountryPhotoSummaryDTO;
import com.personalphotomap.model.AppUser;
import com.personalphotomap.model.Image;
import com.personalphotomap.repository.ImageRepository;
import com.personalphotomap.repository.UserRepository;
import com.personalphotomap.security.JwtUtil;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * ImageService
 *
 * Core service responsible for managing image-related operations for authenticated users.
 *
 * Responsibilities:
 * - Handles upload of images to S3 and saves metadata to the database.
 * - Provides methods to retrieve images by country, year, and user.
 * - Supports asynchronous and secure deletion of single or multiple images.
 * - Converts Image entities to DTOs for API responses.
 * - Extracts and validates authenticated user from JWT tokens.
 *
 * This service acts as the main interface between the image controller layer and persistence layer,
 * ensuring business logic is centralized and reusable.
 */

@Service
public class ImageService {

    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ImageUploadService imageUploadService;
    private final ImageDeleteService imageDeleteService;

    public ImageService(ImageRepository imageRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            ImageUploadService imageUploadService,
            ImageDeleteService imageDeleteService) {
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.imageUploadService = imageUploadService;
        this.imageDeleteService = imageDeleteService;
    }

    /**
     * Extracts the AppUser associated with the provided JWT token.
     * Centralized method for token validation and user retrieval.
     */

    public AppUser getUserFromToken(String token) { // after testing make it private again
        String email = jwtUtil.extractUsernameFromToken(token);
        if (email == null) {
            throw new IllegalArgumentException("Invalid or missing JWT token.");
        }

        AppUser user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User Not Found.");
        }

        return user;
    }

    // ===============================
    // UPLOAD METHOD
    // ===============================

    /**
     * Handles asynchronous upload of multiple images.
     * Images are validated, uploaded to S3, and saved to the database.
     *
     * @return list of uploaded image URLs
     */

    public List<String> handleUpload(List<MultipartFile> files, String countryId, int year, String token) {
        AppUser user = getUserFromToken(token);

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files were provided.");
        }

        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("One or more files are empty.");
            }
            futures.add(imageUploadService.uploadAndSaveImage(file, countryId, year, user));
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        return futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ===============================
    // DELETE METHODS
    // ===============================

    /**
     * Deletes all images from a given country for the authenticated user.
     * Uses async deletion for better performance.
     */

    public void deleteAllImagesByCountry(String countryId, String token) { // ✅
        AppUser user = getUserFromToken(token);

        List<Image> images = imageRepository.findByCountryIdAndUserId(countryId, user.getId());
        if (images.isEmpty()) {
            return;
        }

        imageDeleteService.deleteImagesInParallel(images);
    }

    /**
     * Deletes all images from a specific country and year.
     * Currently not used on frontend but kept for potential future use.
     */

    public void deleteImagesByCountryAndYear(String countryId, int year, String token) { // ✅ ANALIZAR PQ NAO TENHO
                                                                                         // BOTAO PARA DELETAR POR
                                                                                         // IMAGEM E ANO NO FRONT
        AppUser user = getUserFromToken(token);

        List<Image> images = imageRepository.findByCountryIdAndYearAndUserId(countryId, year, user.getId());
        if (images.isEmpty()) {
            return;
        }

        imageDeleteService.deleteImagesInParallel(images);
    }

    /**
     * Deletes a single image by ID if it belongs to the authenticated user.
     */

    public void deleteImageById(Long imageId, String token) { // ✅
        AppUser user = getUserFromToken(token);
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Image not found."));

        if (!image.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You do not have permission to delete this image.");
        }

        imageDeleteService.deleteImage(image);
    }

    /**
     * Deletes multiple images by their IDs, if all belong to the authenticated
     * user.
     */

    public void deleteMultipleImages(List<Long> imageIds, String token) { // ✅
        AppUser user = getUserFromToken(token);
        List<Image> imagesToDelete = imageRepository.findAllById(imageIds);

        if (imagesToDelete.isEmpty())
            return;

        boolean hasUnauthorized = imagesToDelete.stream()
                .anyMatch(img -> !img.getUser().getId().equals(user.getId()));

        if (hasUnauthorized) {
            throw new SecurityException("You do not have permission to delete one or more images.");
        }

        imageDeleteService.deleteImagesInParallel(imagesToDelete);
    }

    // ===============================
    // GET METHODS
    // ===============================

    /**
     * Returns all images associated with a country for the authenticated user.
     */

    public List<ImageDTO> getImagesByCountry(String countryId, String token) { // ✅
        AppUser user = getUserFromToken(token);
        List<Image> images = imageRepository.findByCountryIdAndUserId(countryId, user.getId());
        return convertToDTOList(images);
    }

    /**
     * Returns the list of distinct countries where the user has uploaded photos.
     */

    public List<String> getCountriesWithPhotos(String token) { // ✅
        AppUser user = getUserFromToken(token);
        return imageRepository.findDistinctCountryIdsByUserId(user.getId());
    }

    /**
     * Returns detailed information about countries where the user has photos.
     * Includes country ID, country name, and photo count for MapInteractions.
     */
    public List<CountryPhotoSummaryDTO> getCountriesWithPhotosDetailed(String token) {
        AppUser user = getUserFromToken(token);
        List<Object[]> results = imageRepository.findCountriesWithPhotoCountsByUserId(user.getId());
        
        return results.stream()
            .map(result -> {
                String countryId = (String) result[0];
                Long photoCount = (Long) result[1];
                String countryName = getCountryName(countryId);
                
                return new CountryPhotoSummaryDTO(countryId, countryName, photoCount.intValue());
            })
            .collect(Collectors.toList());
    }

    /**
     * Returns a list of distinct years the user has uploaded photos for.
     */

    public List<Integer> getAvailableYears(String token) { // ✅
        AppUser user = getUserFromToken(token);
        return imageRepository.findDistinctYearsByUserId(user.getId());
    }

    /**
     * Returns all images from the authenticated user, optionally filtered by year.
     */
    
    public List<ImageDTO> getAllImages(String token, Integer year) { // ✅
        AppUser user = getUserFromToken(token);

        List<Image> images;
        if (year != null) {
            images = imageRepository.findByUserIdAndYear(user.getId(), year);
        } else {
            images = imageRepository.findByUserIdOrderByUploadDateDesc(user.getId());
        }

        return convertToDTOList(images);
    }

    /**
     * Returns the list of available years for a specific country.
     */
    public List<Integer> getYearsByCountry(String countryId, String token) { // ✅
        AppUser user = getUserFromToken(token);
        return imageRepository.findDistinctYearsByCountryIdAndUserId(countryId, user.getId());
    }

    /**
     * Returns all images from a specific country and year for the authenticated
     * user.
     */
    public List<ImageDTO> getImagesByCountryAndYear(String countryId, int year, String token) { // ✅
        AppUser user = getUserFromToken(token);
        List<Image> images = imageRepository.findByCountryIdAndYearAndUserId(countryId, year, user.getId());
        return convertToDTOList(images);
    }

    /**
     * Returns a summary containing the total number of photos and distinct
     * countries.
     */
    public Map<String, Object> countUserPhotosAndCountries(String token) { // ✅
        AppUser user = getUserFromToken(token);

        long photoCount = imageRepository.countByUserId(user.getId());
        long countryCount = imageRepository.countDistinctCountryByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("photoCount", photoCount);
        response.put("countryCount", countryCount);
        return response;
    }

    // ===============================
    // CONVERSION HELPERS
    // ===============================

    /**
     * Converts an Image entity to a DTO.
     */
    public ImageDTO convertToDTO(Image image) { // ✅
        return new ImageDTO(
                image.getId(),
                image.getCountryId(),
                image.getFileName(),
                image.getFilePath(),
                image.getYear(),
                image.getUploadDate());
    }

    /**
     * Converts a list of Image entities to DTOs.
     */
    public List<ImageDTO> convertToDTOList(List<Image> images) { // ✅
        return images.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to get country names from country IDs.
     * Used by MapInteractions to display country names on the map.
     */
    private String getCountryName(String countryId) {
        // Map of country IDs to country names
        Map<String, String> countryNames = new HashMap<>();
        countryNames.put("af", "Afghanistan");
        countryNames.put("al", "Albania");
        countryNames.put("dz", "Algeria");
        countryNames.put("ad", "Andorra");
        countryNames.put("ao", "Angola");
        countryNames.put("ag", "Antigua and Barbuda");
        countryNames.put("ar", "Argentina");
        countryNames.put("am", "Armenia");
        countryNames.put("au", "Australia");
        countryNames.put("at", "Austria");
        countryNames.put("az", "Azerbaijan");
        countryNames.put("bs", "Bahamas");
        countryNames.put("bh", "Bahrain");
        countryNames.put("bd", "Bangladesh");
        countryNames.put("bb", "Barbados");
        countryNames.put("by", "Belarus");
        countryNames.put("be", "Belgium");
        countryNames.put("bz", "Belize");
        countryNames.put("bj", "Benin");
        countryNames.put("bt", "Bhutan");
        countryNames.put("bo", "Bolivia");
        countryNames.put("ba", "Bosnia and Herzegovina");
        countryNames.put("bw", "Botswana");
        countryNames.put("br", "Brazil");
        countryNames.put("bn", "Brunei");
        countryNames.put("bg", "Bulgaria");
        countryNames.put("bf", "Burkina Faso");
        countryNames.put("bi", "Burundi");
        countryNames.put("kh", "Cambodia");
        countryNames.put("cm", "Cameroon");
        countryNames.put("ca", "Canada");
        countryNames.put("cv", "Cape Verde");
        countryNames.put("cf", "Central African Republic");
        countryNames.put("td", "Chad");
        countryNames.put("cl", "Chile");
        countryNames.put("cn", "China");
        countryNames.put("co", "Colombia");
        countryNames.put("km", "Comoros");
        countryNames.put("cg", "Congo");
        countryNames.put("cr", "Costa Rica");
        countryNames.put("hr", "Croatia");
        countryNames.put("cu", "Cuba");
        countryNames.put("cy", "Cyprus");
        countryNames.put("cz", "Czech Republic");
        countryNames.put("cd", "Democratic Republic of the Congo");
        countryNames.put("dk", "Denmark");
        countryNames.put("dj", "Djibouti");
        countryNames.put("dm", "Dominica");
        countryNames.put("do", "Dominican Republic");
        countryNames.put("ec", "Ecuador");
        countryNames.put("eg", "Egypt");
        countryNames.put("sv", "El Salvador");
        countryNames.put("gq", "Equatorial Guinea");
        countryNames.put("er", "Eritrea");
        countryNames.put("ee", "Estonia");
        countryNames.put("et", "Ethiopia");
        countryNames.put("fj", "Fiji");
        countryNames.put("fi", "Finland");
        countryNames.put("fr", "France");
        countryNames.put("ga", "Gabon");
        countryNames.put("gm", "Gambia");
        countryNames.put("ge", "Georgia");
        countryNames.put("de", "Germany");
        countryNames.put("gh", "Ghana");
        countryNames.put("gr", "Greece");
        countryNames.put("gd", "Grenada");
        countryNames.put("gt", "Guatemala");
        countryNames.put("gn", "Guinea");
        countryNames.put("gw", "Guinea-Bissau");
        countryNames.put("gy", "Guyana");
        countryNames.put("ht", "Haiti");
        countryNames.put("hn", "Honduras");
        countryNames.put("hu", "Hungary");
        countryNames.put("is", "Iceland");
        countryNames.put("in", "India");
        countryNames.put("id", "Indonesia");
        countryNames.put("ir", "Iran");
        countryNames.put("iq", "Iraq");
        countryNames.put("ie", "Ireland");
        countryNames.put("il", "Israel");
        countryNames.put("it", "Italy");
        countryNames.put("jm", "Jamaica");
        countryNames.put("jp", "Japan");
        countryNames.put("jo", "Jordan");
        countryNames.put("kz", "Kazakhstan");
        countryNames.put("ke", "Kenya");
        countryNames.put("ki", "Kiribati");
        countryNames.put("kp", "North Korea");
        countryNames.put("kr", "South Korea");
        countryNames.put("kw", "Kuwait");
        countryNames.put("kg", "Kyrgyzstan");
        countryNames.put("la", "Laos");
        countryNames.put("lv", "Latvia");
        countryNames.put("lb", "Lebanon");
        countryNames.put("ls", "Lesotho");
        countryNames.put("lr", "Liberia");
        countryNames.put("ly", "Libya");
        countryNames.put("li", "Liechtenstein");
        countryNames.put("lt", "Lithuania");
        countryNames.put("lu", "Luxembourg");
        countryNames.put("mg", "Madagascar");
        countryNames.put("mw", "Malawi");
        countryNames.put("my", "Malaysia");
        countryNames.put("mv", "Maldives");
        countryNames.put("ml", "Mali");
        countryNames.put("mt", "Malta");
        countryNames.put("mh", "Marshall Islands");
        countryNames.put("mr", "Mauritania");
        countryNames.put("mu", "Mauritius");
        countryNames.put("mx", "Mexico");
        countryNames.put("fm", "Micronesia");
        countryNames.put("md", "Moldova");
        countryNames.put("mc", "Monaco");
        countryNames.put("mn", "Mongolia");
        countryNames.put("me", "Montenegro");
        countryNames.put("ma", "Morocco");
        countryNames.put("mz", "Mozambique");
        countryNames.put("mm", "Myanmar");
        countryNames.put("na", "Namibia");
        countryNames.put("nr", "Nauru");
        countryNames.put("np", "Nepal");
        countryNames.put("nl", "Netherlands");
        countryNames.put("nz", "New Zealand");
        countryNames.put("ni", "Nicaragua");
        countryNames.put("ne", "Niger");
        countryNames.put("ng", "Nigeria");
        countryNames.put("mk", "North Macedonia");
        countryNames.put("no", "Norway");
        countryNames.put("om", "Oman");
        countryNames.put("pk", "Pakistan");
        countryNames.put("pw", "Palau");
        countryNames.put("pa", "Panama");
        countryNames.put("pg", "Papua New Guinea");
        countryNames.put("py", "Paraguay");
        countryNames.put("pe", "Peru");
        countryNames.put("ph", "Philippines");
        countryNames.put("pl", "Poland");
        countryNames.put("pt", "Portugal");
        countryNames.put("qa", "Qatar");
        countryNames.put("ro", "Romania");
        countryNames.put("ru", "Russia");
        countryNames.put("rw", "Rwanda");
        countryNames.put("kn", "Saint Kitts and Nevis");
        countryNames.put("lc", "Saint Lucia");
        countryNames.put("vc", "Saint Vincent and the Grenadines");
        countryNames.put("ws", "Samoa");
        countryNames.put("sm", "San Marino");
        countryNames.put("st", "Sao Tome and Principe");
        countryNames.put("sa", "Saudi Arabia");
        countryNames.put("sn", "Senegal");
        countryNames.put("rs", "Serbia");
        countryNames.put("sc", "Seychelles");
        countryNames.put("sl", "Sierra Leone");
        countryNames.put("sg", "Singapore");
        countryNames.put("sk", "Slovakia");
        countryNames.put("si", "Slovenia");
        countryNames.put("sb", "Solomon Islands");
        countryNames.put("so", "Somalia");
        countryNames.put("za", "South Africa");
        countryNames.put("es", "Spain");
        countryNames.put("lk", "Sri Lanka");
        countryNames.put("sd", "Sudan");
        countryNames.put("sr", "Suriname");
        countryNames.put("sz", "Eswatini");
        countryNames.put("se", "Sweden");
        countryNames.put("ch", "Switzerland");
        countryNames.put("sy", "Syria");
        countryNames.put("tw", "Taiwan");
        countryNames.put("tj", "Tajikistan");
        countryNames.put("tz", "Tanzania");
        countryNames.put("th", "Thailand");
        countryNames.put("tl", "Timor-Leste");
        countryNames.put("tg", "Togo");
        countryNames.put("to", "Tonga");
        countryNames.put("tt", "Trinidad and Tobago");
        countryNames.put("tn", "Tunisia");
        countryNames.put("tr", "Turkey");
        countryNames.put("tm", "Turkmenistan");
        countryNames.put("tv", "Tuvalu");
        countryNames.put("ug", "Uganda");
        countryNames.put("ua", "Ukraine");
        countryNames.put("ae", "United Arab Emirates");
        countryNames.put("gb", "United Kingdom");
        countryNames.put("us", "United States");
        countryNames.put("uy", "Uruguay");
        countryNames.put("uz", "Uzbekistan");
        countryNames.put("vu", "Vanuatu");
        countryNames.put("va", "Vatican City");
        countryNames.put("ve", "Venezuela");
        countryNames.put("vn", "Vietnam");
        countryNames.put("ye", "Yemen");
        countryNames.put("zm", "Zambia");
        countryNames.put("zw", "Zimbabwe");
        
        return countryNames.getOrDefault(countryId.toLowerCase(), countryId.toUpperCase());
    }

}