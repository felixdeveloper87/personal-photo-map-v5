package com.personalphotomap.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO used to receive registration data from the client.
 * Includes validation constraints to ensure required fields and valid formats.
 */

public class RegisterRequestDTO {

    // Full name must not be blank and must have at least 3 characters
    @NotBlank(message = "Full name cannot be empty")
    @Size(min = 3, message = "Full name must be at least 3 characters long")
    private String fullname;

    // Email must not be blank and must follow a valid email format
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    // Password must not be blank and must have at least 6 characters
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    // Country must not be blank
    @NotBlank(message = "Country cannot be empty")
    private String country;

    // Default constructor required by frameworks
    public RegisterRequestDTO() {
    }

    // Constructor used for manual instantiation
    public RegisterRequestDTO(String fullname, String email, String password, String country) {
        this.fullname = fullname;
        this.email = email;
        this.password = password;
        this.country = country;
    }

    // Getters and Setters

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
