package com.personalphotomap.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

/**
 * Entity representing an uploaded image.
 * Each image is associated with one user and contains metadata such as
 * file path, country, upload date, and year.
 */

@Entity
@Table(name = "images", indexes = {
        @Index(name = "idx_images_user", columnList = "user_id"),
        @Index(name = "idx_images_country", columnList = "countryId"),
        @Index(name = "idx_images_year", columnList = "year")
})
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ISO country code where the image was taken or associated.
     */
    private String countryId;

    /**
     * The original or generated file name of the image.
     */
    private String fileName;

    /**
     * Path to the image (can be local or S3 URL depending on environment).
     */
    private String filePath;

    /**
     * The year the image is categorized under.
     */
    private int year;

    /**
     * Timestamp of when the image was uploaded.
     * Automatically set before persisting.
     */
    @Column(name = "upload_date", updatable = false)
    private LocalDateTime uploadDate;

    /**
     * Many-to-One relationship: each image belongs to one user.
     * 'user_id' is the foreign key in the 'images' table.
     * @JsonBackReference prevents infinite JSON recursion during serialization.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private AppUser user;

    // Constructors
    public Image() {
    }

    public Image(Long id, String countryId, String fileName, AppUser user, String filePath, int year) {
        this.id = id;
        this.countryId = countryId;
        this.fileName = fileName;
        this.user = user;
        this.filePath = filePath;
        this.year = year;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCountryId() {
        return countryId;
    }

    public void setCountryId(String countryId) {
        this.countryId = countryId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    /**
     * Automatically sets the upload date before persisting.
     */
    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }
}
