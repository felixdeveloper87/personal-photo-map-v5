package com.personalphotomap.controller;

import com.personalphotomap.dto.RegisterRequestDTO;
import com.personalphotomap.dto.UserSummaryDTO;
import com.personalphotomap.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AdminController
 * 
 * This controller provides administrative endpoints for managing users and their photos.
 * 
 * - Accessible only to users with the ADMIN role.
 * - Allows creating new users with ADMIN role.
 * - Allows listing all users with their photo counts.
 * - Allows deletion of a user and all associated images by ID.
 */

@RestController // Responses go directly as JSON
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Restricts all endpoints in this controller to ADMIN users only
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves a list of all users along with the count of their uploaded photos.
     *
     * @return List of UserSummaryDTO containing user info and photo count.
     */
    @GetMapping("/users")
    public List<UserSummaryDTO> getAllUsersWithPhotoCount() {
        return userService.getAllUsersWithPhotoCount();
    }

    /**
     * Creates a new user with ADMIN role.
     * Only accessible to existing admins.
     *
     * @param registerRequest DTO containing user registration data
     * @return ResponseEntity with success message or error
     */
    @PostMapping("/users/admin")
    public ResponseEntity<Map<String, String>> createAdminUser(@RequestBody RegisterRequestDTO registerRequest) {
        String result = userService.createUserWithRole(registerRequest, "ROLE_ADMIN");
        
        if (result.contains("already in use")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", result);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        response.put("email", registerRequest.getEmail());
        response.put("role", "ROLE_ADMIN");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Deletes a user by ID, along with all images associated with that user.
     *
     * @param id ID of the user to delete
     * @return 200 OK if deletion was successful, 404 Not Found if user doesn't exist.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            boolean deleted = userService.deleteUserAndImagesById(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(404).body("User not found");
            }
        } catch (Exception e) {
            System.err.println("Error deleting user " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }
}
