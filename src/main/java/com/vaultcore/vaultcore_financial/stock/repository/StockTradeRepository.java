package com.vaultcore.vaultcore_financial.stock.repository;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.stock.entity.StockTrade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StockTradeRepository extends JpaRepository<StockTrade, UUID> {

    List<StockTrade> findByUserOrderByCreatedAtDesc(User user);

    List<StockTrade> findByUserAndSymbolOrderByCreatedAtDesc(
            User user,
            String symbol);

    /* ---------------- ADMIN STATS ---------------- */

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.quantity * t.price) FROM StockTrade t WHERE t.createdAt >= :date")
    java.math.BigDecimal getTotalVolumeSince(java.time.LocalDateTime date);

    @org.springframework.data.jpa.repository.Query("SELECT t.symbol, COUNT(t) as cnt FROM StockTrade t GROUP BY t.symbol ORDER BY cnt DESC LIMIT 5")
    List<Object[]> findMostTradedStocks();
}
