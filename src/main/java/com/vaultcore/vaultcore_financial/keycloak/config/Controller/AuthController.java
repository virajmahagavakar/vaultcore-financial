package com.vaultcore.vaultcore_financial.keycloak.config.Controller;

import com.vaultcore.vaultcore_financial.keycloak.config.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${spring.keycloak.server-url}")
    private String keycloakUrl;

    @Value("${spring.keycloak.realm}")
    private String realm;

    @Value("${spring.keycloak.client-id}")
    private String clientId;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String tokenUrl = keycloakUrl +
                "/realms/" + realm +
                "/protocol/openid-connect/token";

        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);                 // PUBLIC client
        body.add("code", request.getCode());
        body.add("redirect_uri", request.getRedirectUri());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> entity =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(tokenUrl, entity, Map.class);

            return ResponseEntity.ok(Map.of(
                    "accessToken", response.getBody().get("access_token"),
                    "refreshToken", response.getBody().get("refresh_token")
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Keycloak login failed: " + e.getMessage());
        }
    }
}
