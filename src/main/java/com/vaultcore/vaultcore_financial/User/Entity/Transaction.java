package com.vaultcore.vaultcore_financial.User.Entity;

import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_reference_id", columnList = "reference_id"),
        @Index(name = "idx_keycloak_user", columnList = "keycloak_user_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
public class Transaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "from_account_id", nullable = false)
    private UUID fromAccountId;

    @Column(name = "to_account_id", nullable = false)
    private UUID toAccountId;

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // DEBIT / CREDIT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status; // PENDING / SUCCESS / FAILED

    /**
     * Same referenceId is shared by DEBIT + CREDIT rows
     * → MUST NOT be unique
     */
    @Column(name = "reference_id", nullable = false)
    private String referenceId;

    @Column(nullable = false)
    private String description;

    /**
     * Owner of this ledger entry
     * (sender for DEBIT, receiver for CREDIT)
     */
    @Column(name = "keycloak_user_id", nullable = false)
    private String keycloakUserId;

    @Column(name = "is_flagged")
    private Boolean isFlagged = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
     * ===============================
     * LIFECYCLE
     * ===============================
     */

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Simple Fraud Rule: Flag if amount > 10,000
        if (this.amount != null && this.amount.compareTo(new BigDecimal("10000")) > 0) {
            this.isFlagged = true;
        }
        if (this.isFlagged == null) {
            this.isFlagged = false;
        }
    }

    /*
     * ===============================
     * GETTERS & SETTERS
     * ===============================
     */

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFromAccountId() {
        return fromAccountId;
    }

    public void setFromAccountId(UUID fromAccountId) {
        this.fromAccountId = fromAccountId;
    }

    public UUID getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(UUID toAccountId) {
        this.toAccountId = toAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getKeycloakUserId() {
        return keycloakUserId;
    }

    public void setKeycloakUserId(String keycloakUserId) {
        this.keycloakUserId = keycloakUserId;
    }

    public Boolean isFlagged() {
        return isFlagged != null && isFlagged;
    }

    public void setFlagged(Boolean flagged) {
        isFlagged = flagged;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
