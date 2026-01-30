package com.vaultcore.vaultcore_financial.stock.entity;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(
        name = "watchlist",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "symbol"})
        }
)
public class Watchlist {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol;

    // getters & setters
}
