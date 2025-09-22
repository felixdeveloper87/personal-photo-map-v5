package com.personalphotomap.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        System.out.println("🔧 Configuring SecurityFilterChain with JWT filter: " + jwtAuthenticationFilter.getClass().getSimpleName());
        
        http
            // 1) CORS antes de tudo
            .cors(Customizer.withDefaults())
            // 2) API stateless
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 3) Autorização (preflight e endpoints públicos)
            .authorizeHttpRequests(auth -> {
                System.out.println("🔧 Configuring authorization rules...");
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()      // preflight
                    .requestMatchers("/api/auth/**").permitAll()                 // login/registro públicos
                    .requestMatchers("/health").permitAll()                      // health público
                    .requestMatchers("/api/images/uploads/**").permitAll()       // imagens públicas
                    .requestMatchers(HttpMethod.PUT, "/api/users/make-premium").authenticated()
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

    // 5) CORS: permita seu domínio do frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // Permitir tanto o domínio de produção quanto localhost para desenvolvimento
        cfg.setAllowedOrigins(List.of(
            "https://www.personalphotomap.co.uk",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));
        // Também permitir padrões para subdomínios
        cfg.setAllowedOriginPatterns(List.of("https://*.personalphotomap.co.uk"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","Origin","X-Requested-With"));
        cfg.setExposedHeaders(List.of("Authorization","Content-Disposition"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration conf) throws Exception {
        return conf.getAuthenticationManager();
    }
}

