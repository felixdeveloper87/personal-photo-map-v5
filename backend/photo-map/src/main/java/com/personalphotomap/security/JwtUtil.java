package com.personalphotomap.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

/**
 * JwtUtil
 *
 * Utility class responsible for handling JSON Web Token (JWT) operations.
 *
 * Core responsibilities:
 * - Generate signed tokens using a secret key
 * - Extract claims such as subject (username/email) and expiration date
 * - Validate tokens against expiration and username
 *
 * This class encapsulates the logic used for stateless authentication via JWT.
 * Configured with a secret defined in application properties.
 */

@Component
public class JwtUtil {

    private final Key key;

    /**
     * Initializes the signing key using the secret provided in application
     * properties.
     *
     * @param secret the secret key used for signing the JWT
     */

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Extracts the username (subject) from the given JWT token.
     *
     * @param token the JWT token
     * @return the subject (usually email or username)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from the JWT token.
     *
     * @param token the JWT token
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method to extract any claim from the token using a resolver function.
     *
     * @param token          the JWT token
     * @param claimsResolver function to resolve a specific claim
     * @return the claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses and retrieves all claims from the JWT token.
     *
     * @param token the JWT token
     * @return claims from the token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Checks if the token has expired based on its expiration date.
     *
     * @param token the JWT token
     * @return true if expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a new JWT token for the given username (email).
     * Token is valid for 7 days.
     *
     * @param username the subject for which the token is generated
     * @return signed JWT token
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7)) // 7 days
                .signWith(key)
                .compact();
    }

    /**
     * Extracts the username from a token with "Bearer " prefix.
     *
     * @param token the full Authorization header value (e.g., "Bearer eyJhbGci...")
     * @return the extracted username or null if invalid
     */
    public String extractUsernameFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7); // Remove "Bearer "
            try {
                return extractUsername(jwtToken);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Validates if the token belongs to the given username and is not expired.
     *
     * @param token    the JWT token
     * @param username the expected username
     * @return true if valid, false otherwise
     */
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
