package com.personalphotomap.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;

/**
 * Entity representing a photo album.
 * Each album belongs to one user, is linked to a country,
 * and contains a list of images (many-to-many relationship).
 */

@Entity
@Table(name = "albums")
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Title of the album.
     */
    @Column(nullable = false)
    private String name;

    /**
     * ISO country code associated with the album (e.g., "US", "BR").
     */
    @Column(nullable = false)
    private String countryId;

    /**
     * Images linked to this album.
     * An image can belong to multiple albums (many-to-many).
     */
    @ManyToMany
    @JoinTable(
        name = "album_images",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "image_id")
    )
    private List<Image> images;

    /**
     * The user who owns this album.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    // ─────────────────────────────────────────────────────────────
    // Constructors
    // ─────────────────────────────────────────────────────────────

    public Album() {}

    public Album(String name, String countryId) {
        this.name = name;
        this.countryId = countryId;
    }

    // ─────────────────────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCountryId() {
        return countryId;
    }

    public List<Image> getImages() {
        return images;
    }

    public AppUser getUser() {
        return user;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCountryId(String countryId) {
        this.countryId = countryId;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }
}
