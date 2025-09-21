package com.personalphotomap.service;

import com.personalphotomap.dto.AlbumRequestDTO;
import com.personalphotomap.dto.AlbumResponseDTO;
import com.personalphotomap.dto.ImageDTO;
import com.personalphotomap.model.Album;
import com.personalphotomap.model.AppUser;
import com.personalphotomap.model.Image;
import com.personalphotomap.repository.AlbumRepository;
import com.personalphotomap.repository.ImageRepository;
import com.personalphotomap.repository.UserRepository;
import com.personalphotomap.security.JwtUtil;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service layer responsible for handling business logic related to albums,
 * including creation, retrieval, deletion, and user validation.
 */

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ImageService imageService;

    public AlbumService(AlbumRepository albumRepository,
                        ImageRepository imageRepository,
                        UserRepository userRepository,
                        JwtUtil jwtUtil,
                        ImageService imageService) {
        this.albumRepository = albumRepository;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.imageService = imageService;
    }

    /**
     * Extracts the authenticated user from the provided JWT token.
     *
     * @param token JWT Authorization header (format: Bearer <token>)
     * @return Authenticated AppUser entity
     * @throws SecurityException if the token is invalid
     * @throws NoSuchElementException if the user cannot be found
     */

    private AppUser getUserFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new SecurityException("Invalid token format");
        }

        String email = jwtUtil.extractUsername(token.substring(7));
        AppUser user = userRepository.findByEmail(email);
        if (user == null) {
            throw new NoSuchElementException("User not found");
        }

        return user;
    }

    /**
     * Creates a new album for the authenticated user based on the request payload.
     * Validates the image list before associating them to the album.
     *
     * @param request DTO containing album data
     * @param token JWT token used to authenticate the user
     * @return AlbumResponseDTO representing the created album
     * @throws IllegalArgumentException if the request contains invalid or empty image IDs
     */

    public AlbumResponseDTO createAlbumFromRequest(AlbumRequestDTO request, String token) {
        AppUser user = getUserFromToken(token);

        if (request.getImageIds() == null || request.getImageIds().isEmpty()) {
            throw new IllegalArgumentException("No images selected for the album.");
        }

        List<Image> selectedImages = imageRepository.findAllById(request.getImageIds());

        if (selectedImages.size() != request.getImageIds().size()) {
            throw new IllegalArgumentException("Some provided image IDs are invalid.");
        }

        Album album = new Album(request.getAlbumName(), request.getCountryId());
        album.setUser(user);
        album.setImages(selectedImages);

        Album saved = albumRepository.save(album);
        return convertToDTO(saved);
    }

    /**
     * Retrieves all albums created by the authenticated user.
     *
     * @param token JWT token used for authentication
     * @return List of AlbumResponseDTOs belonging to the user
     */

    public List<AlbumResponseDTO> getAlbumsByUserDTO(String token) {
        AppUser user = getUserFromToken(token);
        List<Album> albums = albumRepository.findByUser(user);
        return convertToDTOList(albums);
    }

    /**
     * Retrieves all albums created by the authenticated user for a specific country.
     *
     * @param countryId Country ISO code
     * @param token JWT token used for authentication
     * @return List of AlbumResponseDTOs filtered by country
     */

    public List<AlbumResponseDTO> getAlbumsByCountryAndUserDTO(String countryId, String token) {
        AppUser user = getUserFromToken(token);
        List<Album> albums = albumRepository.findByCountryIdAndUser(countryId, user);
        return convertToDTOList(albums);
    }

    /**
     * Retrieves all albums available for a given country.
     * This method is intended for public access and does not require authentication.
     *
     * @param countryId Country ISO code
     * @return List of AlbumResponseDTOs related to the country
     */

    public List<AlbumResponseDTO> getAlbumsByCountryDTO(String countryId) {
        List<Album> albums = albumRepository.findByCountryId(countryId);
        return convertToDTOList(albums);
    }

    /**
     * Retrieves all images associated with a given album and maps them to DTOs.
     *
     * @param albumId Album identifier
     * @return List of ImageDTOs belonging to the album
     * @throws NoSuchElementException if the album is not found
     */

    public List<ImageDTO> getImagesByAlbumDTO(Long albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new NoSuchElementException("Album not found"));

        return imageService.convertToDTOList(album.getImages());
    }

    /**
     * Deletes a specific album owned by the authenticated user.
     * Verifies ownership before deletion.
     *
     * @param albumId Album identifier
     * @param token JWT token used to authenticate the user
     * @throws SecurityException if the album does not belong to the authenticated user
     * @throws NoSuchElementException if the album is not found
     */

    public void deleteAlbum(Long albumId, String token) {
        AppUser user = getUserFromToken(token);

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new NoSuchElementException("Album not found"));

        validateAlbumOwnership(user, album);

        // Clear image association to avoid foreign key constraint issues
        album.getImages().clear();
        albumRepository.save(album);
        albumRepository.delete(album);
    }

    /**
     * Validates that the album belongs to the authenticated user.
     *
     * @param user Authenticated user
     * @param album Album to validate
     * @throws SecurityException if ownership does not match
     */

    private void validateAlbumOwnership(AppUser user, Album album) {
        if (!album.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You are not authorized to delete this album");
        }
    }

    /**
     * Retrieves all albums in the system.
     * Intended for administrative or analytical use only.
     *
     * @return List of all albums converted to AlbumResponseDTO
     */

    public List<AlbumResponseDTO> getAllAlbumsDTO() {
        List<Album> albums = albumRepository.findAll();
        return convertToDTOList(albums);
    }

    /**
     * Converts an Album entity to its corresponding AlbumResponseDTO.
     *
     * @param album Album entity
     * @return DTO representation of the album
     */

    public AlbumResponseDTO convertToDTO(Album album) {
        return new AlbumResponseDTO(
                album.getId(),
                album.getName(),
                album.getCountryId(),
                album.getUser().getId(),
                album.getImages() != null ? album.getImages().size() : 0
        );
    }

    /**
     * Converts a list of Album entities to a list of AlbumResponseDTOs.
     *
     * @param albums List of Album entities
     * @return List of DTOs
     */
    
    public List<AlbumResponseDTO> convertToDTOList(List<Album> albums) {
        return albums.stream()
                .map(this::convertToDTO)
                .toList();
    }
}
