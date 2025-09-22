package com.personalphotomap.security;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Custom CORS filter to ensure only one Access-Control-Allow-Origin header is sent.
 * This prevents conflicts with Cloudflare or other proxies that might add CORS headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");
        
        // Check if the origin is allowed
        if (isAllowedOrigin(origin)) {
            // Clear any existing CORS headers to prevent duplicates
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", 
                "Authorization, Content-Type, Accept, Origin, X-Requested-With, DNT, User-Agent, If-Modified-Since, Cache-Control, Range");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Max-Age", "3600");
        }

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }

    private boolean isAllowedOrigin(String origin) {
        if (origin == null) {
            return false;
        }
        
        return origin.equals("https://www.personalphotomap.co.uk") ||
               origin.equals("https://personalphotomap.co.uk") ||
               origin.startsWith("http://localhost:") ||
               origin.startsWith("http://127.0.0.1:");
    }
}
