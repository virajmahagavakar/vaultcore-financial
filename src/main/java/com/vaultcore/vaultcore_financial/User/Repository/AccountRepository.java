package com.vaultcore.vaultcore_financial.User.Repository;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByKeycloakUserId(String keycloakUserId);

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByKeycloakUserId(String keycloakUserId);
}

