package com.vaultcore.vaultcore_financial.keycloak.config;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class SecurityUtil {

    public static String getKeycloakUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }


    public static String getEmail() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getClaim("email");
    }

    public static String getName() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getClaim("name");
    }
}

