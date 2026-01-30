package com.vaultcore.vaultcore_financial.Repository;

import com.vaultcore.vaultcore_financial.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.Entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findTop10ByKeycloakUserIdOrderByCreatedAtDesc(String keycloakUserId);

    List<Transaction> findByFromAccountIdOrToAccountId(UUID from, UUID to);

    List<Transaction> findByKeycloakUserIdAndCreatedAtBetween(
            String keycloakUserId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Transaction> findByKeycloakUserIdAndType(
            String keycloakUserId,
            TransactionType type
    );

    List<Transaction> findByKeycloakUserIdAndStatus(
            String keycloakUserId,
            TransactionStatus status
    );

    Optional<Transaction> findByReferenceId(String referenceId);
}