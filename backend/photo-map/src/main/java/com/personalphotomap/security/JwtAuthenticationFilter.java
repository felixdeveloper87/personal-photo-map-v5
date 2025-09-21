package com.personalphotomap.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter responsible for authenticating incoming HTTP requests using JWT tokens.
 * This filter runs once per request and sets the authenticated user in the Spring Security
 * context if the token is valid.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    /**
     * Public endpoints that bypass JWT auth.
     */
    private static final List<String> EXCLUDE_URLS = Arrays.asList(
            "/api/auth/register",
            "/api/auth/login",
            "/photomap",
            "/api/other-public-endpoint"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Allow CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();

        logger.info(String.format("🔍 Processing request: %s %s from %s", requestMethod, requestPath, request.getRemoteAddr()));
        logger.info(String.format("🔍 Authorization header: %s", request.getHeader("Authorization")));

        // Skip auth for public endpoints
        if (isExcluded(requestPath)) {
            logger.info(String.format("✅ Skipping authentication for excluded path: %s", requestPath));
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT
        String token = extractJwtFromRequest(request);
        String email = null;

        if (StringUtils.hasText(token)) {
            logger.info(String.format("🔑 Token extracted successfully, length: %d", token.length()));
            try {
                email = jwtUtil.extractUsername(token);
                logger.info(String.format("👤 Email extracted from token: %s", email));
            } catch (Exception e) {
                logger.error("❌ Failed to extract email from JWT token", e);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired JWT token\",\"details\":\"" + e.getMessage() + "\"}");
                return;
            }
        } else {
            logger.warn("⚠️ No token found in request");
            // Missing token for a protected endpoint → 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Missing JWT token\",\"message\":\"Please provide a valid Authorization header with Bearer token\"}");
            return;
        }

        // Authenticate only if we DON'T already have a non-anonymous authenticated context
        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAuth = existingAuth != null && existingAuth.isAuthenticated();
        boolean isAnon = existingAuth instanceof AnonymousAuthenticationToken;
        boolean hasValidNonAnonymousAuth = hasAuth && !isAnon;

        if (email != null && !hasValidNonAnonymousAuth) {
            logger.info(String.format("🔐 Attempting to authenticate user: %s", email));
            try {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                logger.info(String.format("👤 User details loaded: %s", userDetails.getUsername()));

                if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                    logger.info(String.format("✅ Token validated successfully for user: %s", userDetails.getUsername()));
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info(String.format("🔐 User authenticated successfully: %s", userDetails.getUsername()));
                } else {
                    logger.warn(String.format("⚠️ Token validation failed for user: %s", userDetails.getUsername()));
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Token validation failed\",\"message\":\"JWT token is invalid or expired\"}");
                    return;
                }
            } catch (Exception e) {
                logger.error("❌ Error during user authentication", e);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Authentication failed\",\"details\":\"" + e.getMessage() + "\"}");
                return;
            }
        } else if (email == null) {
            logger.warn("⚠️ No email extracted from token");
        } else {
            // We already have a non-anonymous authenticated principal
            logger.info(String.format("ℹ️ User already authenticated: %s", existingAuth.getName()));
        }

        filterChain.doFilter(request, response);
    }

    private boolean isExcluded(String path) {
        for (String pattern : EXCLUDE_URLS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extracts the raw JWT (without "Bearer ") from the Authorization header.
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
