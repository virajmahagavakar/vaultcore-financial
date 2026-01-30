package com.vaultcore.vaultcore_financial.configurations;

import com.vaultcore.vaultcore_financial.keycloak.config.JwtAuthConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // Backend is stateless (JWT)
                .csrf(csrf -> csrf.disable())

                // Enable CORS for React
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // API authorization
                .authorizeHttpRequests(auth -> auth
                        // Public APIs (login, register, health)
                        .requestMatchers(
                                "/api/auth/**",
                                "/public/**"
                        ).permitAll()

                        // Admin APIs
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // User APIs
                        .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")

                        // Everything else needs authentication
                        .anyRequest().authenticated()
                )

                // OAuth2 Resource Server (Keycloak JWT)
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(new JwtAuthConverter()))
                );


        return http.build();
    }

    // CORS config for React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
