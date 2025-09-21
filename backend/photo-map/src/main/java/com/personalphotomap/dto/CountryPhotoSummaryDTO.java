package com.personalphotomap.dto;

/**
 * DTO for returning detailed information about countries where a user has photos.
 * Used by the MapInteractions component to display country information on the map.
 */
public class CountryPhotoSummaryDTO {
    private String countryId;
    private String countryName;
    private int photoCount;

    public CountryPhotoSummaryDTO() {}

    public CountryPhotoSummaryDTO(String countryId, String countryName, int photoCount) {
        this.countryId = countryId;
        this.countryName = countryName;
        this.photoCount = photoCount;
    }

    // Getters and Setters
    public String getCountryId() {
        return countryId;
    }

    public void setCountryId(String countryId) {
        this.countryId = countryId;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public int getPhotoCount() {
        return photoCount;
    }

    public void setPhotoCount(int photoCount) {
        this.photoCount = photoCount;
    }

    @Override
    public String toString() {
        return "CountryPhotoSummaryDTO{" +
                "countryId='" + countryId + '\'' +
                ", countryName='" + countryName + '\'' +
                ", photoCount=" + photoCount +
                '}';
    }
}
