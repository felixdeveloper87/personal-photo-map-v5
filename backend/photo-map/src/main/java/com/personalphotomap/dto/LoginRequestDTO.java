package com.personalphotomap.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO used for receiving login credentials from the client.
 * Contains validation annotations to enforce correct input format and non-empty
 * fields.
 */

public class LoginRequestDTO {

    // Email field must not be blank and must follow a valid email format
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    // Password must not be blank
    @NotBlank(message = "Password cannot be empty")
    private String password;

    // Default constructor required for frameworks (e.g., Spring, Jackson)
    public LoginRequestDTO() {
    }

    // Constructor used for manually creating DTO instances
    public LoginRequestDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getter for email field
    public String getEmail() {
        return email;
    }

    // Setter for email field
    public void setEmail(String email) {
        this.email = email;
    }

    // Getter for password field
    public String getPassword() {
        return password;
    }

    // Setter for password field
    public void setPassword(String password) {
        this.password = password;
    }
}
