package com.vaultcore.vaultcore_financial.Service;

import com.vaultcore.vaultcore_financial.Entity.User;
import com.vaultcore.vaultcore_financial.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getOrCreateUser(String keycloakId, String email, String name) {

        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    User user = new User();
                    // ❌ DO NOT set ID manually
                    // JPA will generate it

                    user.setKeycloakId(keycloakId);
                    user.setEmail(email);
                    user.setFullName(name);

                    return userRepository.save(user);
                });
    }
}

