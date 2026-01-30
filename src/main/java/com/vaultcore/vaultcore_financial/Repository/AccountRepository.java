package com.vaultcore.vaultcore_financial.Repository;

import com.vaultcore.vaultcore_financial.Entity.Account;
import com.vaultcore.vaultcore_financial.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByKeycloakUserId(String keycloakUserId);
}
