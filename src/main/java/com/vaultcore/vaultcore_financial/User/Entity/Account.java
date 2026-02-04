package com.vaultcore.vaultcore_financial.User.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "failed_pin_attempts", nullable = false)
    private Integer failedPinAttempts = 0;

    @Column(name = "last_transaction_date", nullable = false)
    private LocalDate lastTransactionDate;

    @Column(name = "account_number", nullable = false, unique = true, length = 32)
    private String accountNumber;

    @Column(name = "keycloak_user_id", nullable = false, length = 64)
    private String keycloakUserId;

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false, length = 16)
    private String status = "ACTIVE"; // ACTIVE / FROZEN

    @Column(length = 255)
    private String pin; // hashed

    @Column(length = 64)
    private String nickname;

    @Column(name = "notification_preference", nullable = false, length = 16)
    private String notificationPreference = "EMAIL";

    @Column(name = "daily_limit", nullable = false, precision = 38, scale = 2)
    private BigDecimal dailyLimit = BigDecimal.valueOf(10000);

    /* ---------- Lifecycle Hooks ---------- */

    @PrePersist
    protected void onCreate() {
        if (this.lastTransactionDate == null) {
            this.lastTransactionDate = LocalDate.now();
        }
        if (this.failedPinAttempts == null) {
            this.failedPinAttempts = 0;
        }
        if (this.balance == null) {
            this.balance = BigDecimal.ZERO;
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    /* ---------- Business Logic ---------- */

    public boolean isFrozen() {
        return "FROZEN".equalsIgnoreCase(this.status);
    }

    public void freeze() {
        this.status = "FROZEN";
    }

    public void unfreeze() {
        this.status = "ACTIVE";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getFailedPinAttempts() {
        return failedPinAttempts;
    }

    public void setFailedPinAttempts(Integer failedPinAttempts) {
        this.failedPinAttempts = failedPinAttempts;
    }

    public LocalDate getLastTransactionDate() {
        return lastTransactionDate;
    }

    public void setLastTransactionDate(LocalDate lastTransactionDate) {
        this.lastTransactionDate = lastTransactionDate;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getKeycloakUserId() {
        return keycloakUserId;
    }

    public void setKeycloakUserId(String keycloakUserId) {
        this.keycloakUserId = keycloakUserId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getNotificationPreference() {
        return notificationPreference;
    }

    public void setNotificationPreference(String notificationPreference) {
        this.notificationPreference = notificationPreference;
    }

    public BigDecimal getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(BigDecimal dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

}
