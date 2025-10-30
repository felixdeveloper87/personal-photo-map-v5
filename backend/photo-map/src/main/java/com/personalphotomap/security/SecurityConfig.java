package com.personalphotomap.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        System.out.println("🔧 Configuring SecurityFilterChain with JWT filter: " + jwtAuthenticationFilter.getClass().getSimpleName());
        
        http
            // 1) CORS handled by CustomCorsFilter to prevent duplicates
            .cors(cors -> cors.disable())
            // 2) API stateless
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 3) Autorização (preflight e endpoints públicos)
            .authorizeHttpRequests(auth -> {
                System.out.println("🔧 Configuring authorization rules...");
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()      // preflight
                    .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()  // login/registro públicos
                    .requestMatchers("/health").permitAll()                      // health público
                    .requestMatchers("/api/images/uploads/**").permitAll()       // imagens públicas
                    .requestMatchers("/favicon.ico").permitAll()                 // favicon público
                    .requestMatchers("/robots.txt").permitAll()                  // robots.txt público
                    .requestMatchers("/sitemap.xml").permitAll()                 // sitemap público
                    .requestMatchers(HttpMethod.PUT, "/api/auth/users/premium").authenticated()  // premium management requires auth
                    .requestMatchers(HttpMethod.PUT, "/api/auth/users/make-premium").authenticated()  // history endpoint
                    .anyRequest().authenticated();
                System.out.println("🔧 Authorization rules configured");
            });

        // 4) Filtro JWT antes do UsernamePasswordAuthenticationFilter
        System.out.println("🔧 Adding JWT filter before UsernamePasswordAuthenticationFilter");
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        // 5) Log da configuração final
        System.out.println("🔧 SecurityFilterChain configuration completed");

        return http.build();
    }

    // CORS is now handled by CustomCorsFilter to prevent duplicate headers

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration conf) throws Exception {
        return conf.getAuthenticationManager();
    }
}
