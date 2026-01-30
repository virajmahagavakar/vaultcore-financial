package com.vaultcore.vaultcore_financial.stock.repository;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.stock.entity.StockHolding;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockHoldingRepository extends JpaRepository<StockHolding, UUID> {

    Optional<StockHolding> findByUserAndSymbol(User user, String symbol);

    List<StockHolding> findByUser(User user);
}
