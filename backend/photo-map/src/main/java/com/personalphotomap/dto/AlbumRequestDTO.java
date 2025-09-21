package com.personalphotomap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * AlbumRequestDTO
 *
 * Data Transfer Object used to receive album creation requests from the client.
 *
 * Contains:
 * - Album name (required)
 * - Country ID (required)
 * - List of image IDs to associate with the album (at least one required)
 *
 * Used in the AlbumController to validate and process album creation.
 */

public class AlbumRequestDTO {

    @NotBlank(message = "Album name is required") 
    private String albumName;

    @NotBlank(message = "Country ID is required")
    private String countryId;

    @NotEmpty(message = "Image ID list cannot be empty")
    private List<Long> imageIds;

    public AlbumRequestDTO() {
    }

    public AlbumRequestDTO(String albumName, String countryId, List<Long> imageIds) {
        this.albumName = albumName;
        this.countryId = countryId;
        this.imageIds = imageIds;
    }

    public String getAlbumName() {
        return albumName;
    }

    public void setAlbumName(String albumName) {
        this.albumName = albumName;
    }

    public String getCountryId() {
        return countryId;
    }

    public void setCountryId(String countryId) {
        this.countryId = countryId;
    }

    public List<Long> getImageIds() {
        return imageIds;
    }

    public void setImageIds(List<Long> imageIds) {
        this.imageIds = imageIds;
    }
}
