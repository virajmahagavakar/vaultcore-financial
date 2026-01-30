package com.vaultcore.vaultcore_financial.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_number", unique = true, nullable = false)
    private String accountNumber;

    private String keycloakUserId; // sub from token

    private BigDecimal balance = BigDecimal.ZERO;

    private String status = "ACTIVE"; // ACTIVE / FROZEN

    // New fields for user-controlled account settings
    private String pin; // store hashed PIN in real apps
    private String nickname;
    private String notificationPreference = "EMAIL"; // default
    private BigDecimal dailyLimit = BigDecimal.valueOf(10000);

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getKeycloakUserId() { return keycloakUserId; }
    public void setKeycloakUserId(String keycloakUserId) { this.keycloakUserId = keycloakUserId; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getNotificationPreference() { return notificationPreference; }
    public void setNotificationPreference(String notificationPreference) { this.notificationPreference = notificationPreference; }

    public BigDecimal getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; }

    // Convenience method for freeze/unfreeze
    public boolean isFrozen() { return "FROZEN".equalsIgnoreCase(this.status); }
    public void freeze() { this.status = "FROZEN"; }
    public void unfreeze() { this.status = "ACTIVE"; }
}
