package com.vaultcore.vaultcore_financial.stock.entity;


import com.vaultcore.vaultcore_financial.User.Entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_trades")
public class StockTrade {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol; // BTC, ETH, etc.

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal price; // price per unit

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeType type;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // getters & setters
}
