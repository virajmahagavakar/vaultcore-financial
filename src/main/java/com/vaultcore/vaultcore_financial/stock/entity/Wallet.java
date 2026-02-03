package com.vaultcore.vaultcore_financial.stock.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Double balance;

    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public Double getBalance() {
        return balance;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}

