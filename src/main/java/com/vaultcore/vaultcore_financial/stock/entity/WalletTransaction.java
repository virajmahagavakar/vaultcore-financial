package com.vaultcore.vaultcore_financial.stock.entity;

import com.vaultcore.vaultcore_financial.stock.entity.WalletTransactionType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Long walletId;

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WalletTransactionType type;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /* ================= FACTORY METHODS ================= */

    public static WalletTransaction debit(
            Long walletId,
            BigDecimal amount,
            String reason
    ) {
        WalletTransaction tx = new WalletTransaction();
        tx.walletId = walletId;
        tx.amount = amount;
        tx.type = WalletTransactionType.DEBIT;
        tx.reason = reason;
        return tx;
    }

    public static WalletTransaction credit(
            Long walletId,
            BigDecimal amount,
            String reason
    ) {
        WalletTransaction tx = new WalletTransaction();
        tx.walletId = walletId;
        tx.amount = amount;
        tx.type = WalletTransactionType.CREDIT;
        tx.reason = reason;
        return tx;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public WalletTransactionType getType() {
        return type;
    }

    public void setType(WalletTransactionType type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}