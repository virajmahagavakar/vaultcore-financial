package com.vaultcore.vaultcore_financial.stock.entity;


import com.vaultcore.vaultcore_financial.User.Entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "stock_holdings",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "symbol"})
        }
)
public class StockHolding {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal avgBuyPrice;

    // getters & setters
}
