package com.personalphotomap.security;

import com.personalphotomap.model.AppUser;
import com.personalphotomap.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom implementation of UserDetailsService used by Spring Security
 * to retrieve user information (email, password, and roles) from the database.
 * 
 * This service is essential when using Spring Security's authentication context
 * to validate and authorize users based on their credentials and roles.
 */

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserRepository userRepository;

    /**
     * Constructor-based dependency injection for UserRepository.
     *
     * @param userRepository Repository for accessing user data
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Loads the user from the database by their email address.
     * This method is automatically called by Spring Security during authentication.
     *
     * @param email The email (used as the username) of the user.
     * @return UserDetails containing the user's credentials and roles.
     * @throws UsernameNotFoundException if the user does not exist in the database.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        // Ensure the role has the proper ROLE_ prefix for Spring Security
        String role = user.getRole();
        if (role != null && !role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }
        
        // Log role information for debugging
        System.out.println("🔐 User: " + email + " has role: " + role);
        System.out.println("🔐 User premium status: " + user.isPremium());

        // Build and return a Spring Security-compatible User object
        // using the user's email, password, and role as granted authority.
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(role != null ? role : "ROLE_USER") // Role is used as a granted authority
                .build();
    }
}
