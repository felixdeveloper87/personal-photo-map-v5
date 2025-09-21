package com.personalphotomap.controller;

import com.personalphotomap.dto.AlbumRequestDTO;
import com.personalphotomap.dto.AlbumResponseDTO;
import com.personalphotomap.dto.ImageDTO;
import com.personalphotomap.service.AlbumService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * AlbumController
 *
 * REST controller responsible for managing album-related operations.
 * 
 * - Allows authenticated users to create and manage their own albums.
 * - Supports public retrieval of albums by country.
 * - Handles deletion and image retrieval for specific albums.
 * - All user-specific endpoints require a valid JWT token for authentication.
 */

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    /**
     * Creates a new album for the authenticated user.
     * The album is associated with a specific country and a list of selected images.
     *
     * @param request Album creation payload including name, countryId, and imageIds
     * @param token   Bearer JWT token used for user authentication
     * @return AlbumResponseDTO representing the created album or an error message
     */
    @PostMapping
    public ResponseEntity<?> createAlbum(@Valid @RequestBody AlbumRequestDTO request,
                                         @RequestHeader("Authorization") String token) {
        try {
            AlbumResponseDTO response = albumService.createAlbumFromRequest(request, token);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized: " + e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User or related data not found.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Retrieves all albums created by the authenticated user.
     *
     * @param token Bearer JWT token used for user authentication
     * @return List of AlbumResponseDTOs belonging to the user
     */
    @GetMapping("/user")
    public ResponseEntity<?> getAllAlbumsByUser(@RequestHeader("Authorization") String token) {
        try {
            List<AlbumResponseDTO> albums = albumService.getAlbumsByUserDTO(token);
            return ResponseEntity.ok(albums);
        } catch (SecurityException | NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Retrieves all albums created by the authenticated user for a specific country.
     *
     * @param countryId Country ISO code
     * @param token     Bearer JWT token used for user authentication
     * @return List of AlbumResponseDTOs filtered by country
     */
    @GetMapping("/user/{countryId}")
    public ResponseEntity<?> getUserAlbumsByCountry(@PathVariable String countryId,
                                                    @RequestHeader("Authorization") String token) {
        try {
            List<AlbumResponseDTO> albums = albumService.getAlbumsByCountryAndUserDTO(countryId, token);
            return ResponseEntity.ok(albums);
        } catch (SecurityException | NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Retrieves all albums publicly available for a specific country.
     * Does not require user authentication.
     *
     * @param countryId Country ISO code
     * @return List of AlbumResponseDTOs associated with the given country
     */
    @GetMapping("/{countryId}")
    public ResponseEntity<List<AlbumResponseDTO>> getAlbumsByCountry(@PathVariable String countryId) {
        return ResponseEntity.ok(albumService.getAlbumsByCountryDTO(countryId));
    }

    /**
     * Retrieves all images associated with a specific album.
     *
     * @param albumId Album identifier
     * @return List of ImageDTOs belonging to the album or 404 if album not found
     */
    @GetMapping("/{albumId}/images")
    public ResponseEntity<?> getImagesByAlbum(@PathVariable Long albumId) {
        try {
            List<ImageDTO> images = albumService.getImagesByAlbumDTO(albumId);
            return ResponseEntity.ok(images);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Deletes an album owned by the authenticated user.
     * Verifies album ownership before deletion.
     *
     * @param albumId Album identifier
     * @param token   Bearer JWT token used for user authentication
     * @return Success message or appropriate error response
     */
    @DeleteMapping("/{albumId}")
    public ResponseEntity<?> deleteAlbum(@PathVariable Long albumId,
                                         @RequestHeader("Authorization") String token) {
        try {
            albumService.deleteAlbum(albumId, token);
            return ResponseEntity.ok("Album successfully deleted.");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: " + e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Album not found.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Retrieves all albums in the system.
     * Intended for administrative or analytical use only.
     *
     * @return List of all albums as AlbumResponseDTOs
     */
    @GetMapping("/all")
    public ResponseEntity<List<AlbumResponseDTO>> getAllAlbums() {
        List<AlbumResponseDTO> albums = albumService.getAllAlbumsDTO();
        return ResponseEntity.ok(albums);
    }
}
