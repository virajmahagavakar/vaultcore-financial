package com.vaultcore.vaultcore_financial.stock.repository;


import com.vaultcore.vaultcore_financial.stock.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(String userId);
}
