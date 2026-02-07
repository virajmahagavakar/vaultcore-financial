package com.vaultcore.vaultcore_financial.User.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    /* ---------------- RELATION ---------------- */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    /* ---------------- IDENTIFIERS ---------------- */

    @Column(name = "keycloak_user_id", nullable = false, length = 64)
    private String keycloakUserId;

    @Column(name = "account_number", nullable = false, unique = true, length = 32)
    private String accountNumber;

    /* ---------------- KYC DATA ---------------- */

    @Column(name = "phone", nullable = false, length = 10)
    private String phone;

    @Column(name = "age", nullable = false)
    private Integer age;

    /* ---------------- BALANCE & STATUS ---------------- */

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false, length = 16)
    private String status = "ACTIVE"; // ACTIVE / FROZEN

    /* ---------------- SECURITY ---------------- */

    @Column(length = 255)
    private String pin; // TODO: hash later

    @Column(name = "failed_pin_attempts", nullable = false)
    private Integer failedPinAttempts = 0;

    /* ---------------- PREFERENCES ---------------- */

    @Column(length = 64)
    private String nickname;

    @Column(name = "notification_preference", nullable = false, length = 16)
    private String notificationPreference = "EMAIL";

    @Column(name = "daily_limit", nullable = false, precision = 38, scale = 2)
    private BigDecimal dailyLimit = BigDecimal.valueOf(10000);

    @Column(name = "last_transaction_date", nullable = false)
    private LocalDate lastTransactionDate;

    /* ---------------- LIFECYCLE ---------------- */

    @PrePersist
    protected void onCreate() {
        if (this.lastTransactionDate == null) {
            this.lastTransactionDate = LocalDate.now();
        }
        if (this.balance == null) {
            this.balance = BigDecimal.ZERO;
        }
        if (this.failedPinAttempts == null) {
            this.failedPinAttempts = 0;
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    /* ---------------- BUSINESS METHODS ---------------- */

    public boolean isFrozen() {
        return "FROZEN".equalsIgnoreCase(this.status);
    }

    public void freeze() {
        this.status = "FROZEN";
    }

    public void unfreeze() {
        this.status = "ACTIVE";
    }

    /* ---------------- GETTERS & SETTERS ---------------- */

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

    public String getKeycloakUserId() {
        return keycloakUserId;
    }

    public void setKeycloakUserId(String keycloakUserId) {
        this.keycloakUserId = keycloakUserId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
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

    public Integer getFailedPinAttempts() {
        return failedPinAttempts;
    }

    public void setFailedPinAttempts(Integer failedPinAttempts) {
        this.failedPinAttempts = failedPinAttempts;
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

    public LocalDate getLastTransactionDate() {
        return lastTransactionDate;
    }

    public void setLastTransactionDate(LocalDate lastTransactionDate) {
        this.lastTransactionDate = lastTransactionDate;
    }
}
