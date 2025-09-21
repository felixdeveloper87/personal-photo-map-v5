package com.personalphotomap.dto;

import java.util.Collections;
import java.util.List;

/**
 * Data Transfer Object (DTO) used to return the result of an S3 file upload.
 * It encapsulates the list of public URLs of the uploaded images.
 */

public class S3UploadResponseDTO {

    private List<String> imageUrls;

    /**
     * Constructor used for single file uploads.
     * Wraps the provided file URL into a singleton list.
     *
     * @param fileUrl Public URL of the uploaded image
     */
    public S3UploadResponseDTO(String fileUrl) {
        this.imageUrls = Collections.singletonList(fileUrl);
    }

    /**
     * Getter for the list of image URLs.
     *
     * @return List of uploaded image URLs
     */
    public List<String> getImageUrls() {
        return imageUrls;
    }

    /**
     * Setter for the image URL list.
     *
     * @param imageUrls List of URLs to set
     */
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
