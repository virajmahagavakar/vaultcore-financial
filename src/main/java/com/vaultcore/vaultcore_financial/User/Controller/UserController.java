package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public User getProfile(Authentication authentication) {

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String keycloakId = jwt.getSubject(); // sub
        String email = jwt.getClaim("email");
        String fullName = jwt.getClaim("name");

        Optional<User> existingUser = userRepository.findByKeycloakId(keycloakId);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Create user if not exists
        User user = new User();
        user.setKeycloakId(keycloakId);
        user.setEmail(email);
        user.setFullName(fullName);

        return userRepository.save(user);
    }
}
