package com.personalphotomap.dto;

import com.personalphotomap.model.AppUser;

/**
 * DTO used to transfer user data to the client side in a safe and controlled format.
 * Prevents exposing sensitive internal information (like passwords or tokens).
 */

public class UserDTO {
    private Long id;
    private String fullname;
    private String email;
    private String country;
    private String role;
    private boolean premium;

    /**
     * Constructs a UserDTO from the AppUser entity.
     *
     * @param user The AppUser entity to convert into a DTO.
     */
    public UserDTO(AppUser user) {
        this.id = user.getId();
        this.fullname = user.getFullname();
        this.email = user.getEmail();
        this.country = user.getCountry();
        this.role = user.getRole();
        this.premium = user.isPremium();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isPremium() {
        return premium;
    }

    public void setPremium(boolean premium) {
        this.premium = premium;
    }
}
