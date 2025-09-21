package com.personalphotomap.dto;

/**
 * UserSummaryDTO
 *
 * Data Transfer Object used exclusively for administrative purposes.
 * 
 * Provides summarized information about a user, including:
 * - User ID
 * - Full name
 * - Email address
 * - Country
 * - Number of uploaded photos
 *
 * Intended for internal dashboards or admin endpoints only.
 * Should not be exposed in public-facing APIs.
 */

public class UserSummaryDTO {

    private Long id;
    private String fullname;
    private String email;
    private String country;
    private int photoCount;

    public UserSummaryDTO(Long id, String fullname, String email, String country, int photoCount) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
        this.country = country;
        this.photoCount = photoCount;
    }

    public Long getId() {
        return id;
    }

    public String getFullname() {
        return fullname;
    }

    public String getEmail() {
        return email;
    }

    public String getCountry() {
        return country;
    }

    public int getPhotoCount() {
        return photoCount;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setPhotoCount(int photoCount) {
        this.photoCount = photoCount;
    }

}
