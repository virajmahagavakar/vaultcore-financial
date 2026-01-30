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
            String symbol
    );
}
