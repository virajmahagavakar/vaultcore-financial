package com.vaultcore.vaultcore_financial.User.Repository;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByKeycloakId(String keycloakId);

    /* ---------------- ADMIN STATS ---------------- */

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    long countByStatus(String status);
}
