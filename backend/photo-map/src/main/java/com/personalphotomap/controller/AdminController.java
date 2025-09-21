package com.personalphotomap.controller;

import com.personalphotomap.dto.UserSummaryDTO;
import com.personalphotomap.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;

/**
 * AdminController
 * 
 * This controller provides administrative endpoints for managing users.
 * 
 * - Accessible only to users with the ADMIN role.
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
     * Deletes a user by ID, along with all images associated with that user.
     *
     * @param id ID of the user to delete
     * @return 200 OK if deletion was successful, 404 Not Found if user doesn't exist.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUserAndImagesById(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
