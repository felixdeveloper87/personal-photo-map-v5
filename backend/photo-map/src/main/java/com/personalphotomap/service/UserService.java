package com.personalphotomap.service;

import com.personalphotomap.model.AppUser;
import com.personalphotomap.model.Image;
import com.personalphotomap.dto.LoginRequestDTO;
import com.personalphotomap.dto.RegisterRequestDTO;
import com.personalphotomap.dto.UserDTO;
import com.personalphotomap.dto.UserSummaryDTO;
import com.personalphotomap.repository.ImageRepository;
import com.personalphotomap.repository.UserRepository;
import com.personalphotomap.security.JwtUtil;

import jakarta.transaction.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service class responsible for user-related business logic such as
 * registration,
 * authentication, user role updates, and real-time notifications.
 */

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ImageRepository imageRepository;
    private final ImageDeleteService imageDeleteService;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil, ImageRepository imageRepository, ImageDeleteService imageDeleteService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.imageRepository = imageRepository;
        this.imageDeleteService = imageDeleteService;
    }

    /**
     * Retrieves all users from the system and converts them to DTOs.
     *
     * @return A list of UserDTO objects
     */

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::new)
                .toList();
    }

    public List<UserSummaryDTO> getAllUsersWithPhotoCount() {
        List<AppUser> users = userRepository.findAll();

        return users.stream()
                .map(user -> {
                    long count = imageRepository.countByUserId(user.getId());
                    return new UserSummaryDTO(
                            user.getId(),
                            user.getFullname(),
                            user.getEmail(),
                            user.getCountry(),
                            (int) count);
                })
                .toList();
    }

    /**
     * Registers a new user in the system.
     * Checks for email uniqueness and encrypts the password before saving.
     *
     * @param registerRequest DTO containing user registration data
     * @return A success or conflict message
     */
    public String registerUser(RegisterRequestDTO registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()) != null) {
            return "Email is already in use.";
        }

        AppUser newUser = new AppUser();
        newUser.setFullname(registerRequest.getFullname());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setCountry(registerRequest.getCountry());
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // converts it to hash Bycrpt
        newUser.setRole("ROLE_USER"); // Default role

        userRepository.save(newUser);
        return "User registered successfully.";
    }

    /**
     * Authenticates a user based on email and password.
     * Generates a JWT token upon successful login.
     *
     * @param loginRequest DTO containing email and password
     * @return A map with token and basic user info
     * @throws SecurityException if credentials are invalid
     */

    public Map<String, String> authenticateUser(LoginRequestDTO loginRequest) {
        AppUser user = userRepository.findByEmail(loginRequest.getEmail());

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new SecurityException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("fullname", user.getFullname());
        response.put("email", user.getEmail());
        response.put("premium", String.valueOf(user.isPremium()));

        return response;
    }

    /**
     * Finds a user by email.
     * Returns an Optional to promote safe handling of null values.
     *
     * @param email The user's email
     * @return Optional containing the user if found
     */
    public Optional<AppUser> findByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }

    /**
     * Upgrades the current authenticated user to premium status.
     * Extracts the user from JWT token and updates the role.
     * Also sends a real-time notification via WebSocket.
     *
     * @param token The JWT token from the Authorization header
     * @return A response map with confirmation message and premium status
     * @throws SecurityException        if token format is invalid
     * @throws IllegalArgumentException if user is not found
     */
    public Map<String, Object> upgradeCurrentUserToPremium(String token) {
        System.out.println("🚀 upgradeCurrentUserToPremium called with token: " + (token != null ? token.substring(0, 20) + "..." : "null"));
        
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("❌ Invalid token format");
            throw new SecurityException("Invalid token format");
        }

        String email = jwtUtil.extractUsername(token.substring(7));
        System.out.println("👤 Extracted email: " + email);
        
        AppUser user = userRepository.findByEmail(email);
        System.out.println("👤 User found: " + (user != null ? "YES" : "NO"));

        if (user == null) {
            System.out.println("❌ User not found for email: " + email);
            throw new IllegalArgumentException("User not found.");
        }

        System.out.println("🔐 Current user role: " + user.getRole());
        System.out.println("🔐 Current premium status: " + user.isPremium());
        
        // Check if user is already premium
        if (user.isPremium()) {
            System.out.println("⚠️ User is already premium");
            Map<String, Object> response = new HashMap<>();
            response.put("premium", true);
            response.put("message", "User is already premium!");
            return response;
        }

        // Upgrade user to premium
        user.setPremium(true);
        userRepository.save(user);
        System.out.println("✅ User upgraded to premium successfully");

        Map<String, Object> response = new HashMap<>();
        response.put("premium", true);
        response.put("message", "User upgraded to premium!");
        return response;
    }

    /**
     * Validates a JWT token and returns user information if valid.
     * Used by the frontend to check if the stored token is still valid.
     *
     * @param token Authorization header containing Bearer token
     * @return Map containing validation result and user info
     * @throws SecurityException if token is invalid or expired
     */
    public Map<String, Object> validateToken(String token) throws SecurityException {
        try {
            // Extract token from Authorization header
            String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            
            // Validate token and extract user information
            String email = jwtUtil.extractUsername(jwtToken);
            if (email != null && jwtUtil.validateToken(jwtToken, email)) {
                // Token is valid, get user info
                AppUser user = userRepository.findByEmail(email);
                if (user != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", true);
                    response.put("email", email);
                    response.put("fullname", user.getFullname());
                    response.put("role", user.getRole());
                    response.put("message", "Token is valid");
                    return response;
                } else {
                    throw new SecurityException("User not found");
                }
            } else {
                throw new SecurityException("Invalid or expired token");
            }
        } catch (Exception e) {
            throw new SecurityException("Token validation failed: " + e.getMessage());
        }
    }

    /**
     * Deletes a user by their ID.
     *
     * @param id User ID
     * @return true if the user was deleted, false if not found
     */

    public boolean deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }

    @Transactional
    public boolean deleteUserAndImagesById(Long userId) {
        Optional<AppUser> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            AppUser user = userOptional.get();
            List<Image> images = imageRepository.findByUserId(userId);

            images.forEach(image -> imageDeleteService.deleteImage(image));

            userRepository.delete(user);
            return true;
        }
        return false;
    }

    @Transactional
    public void deleteAllUsersAndImages() {
        List<Image> allImages = imageRepository.findAll();

        allImages.forEach(image -> imageDeleteService.deleteImage(image));

        userRepository.deleteAll();
    }

}
