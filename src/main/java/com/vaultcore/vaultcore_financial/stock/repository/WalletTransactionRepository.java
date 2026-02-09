package com.vaultcore.vaultcore_financial.stock.repository;

import com.vaultcore.vaultcore_financial.stock.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WalletTransactionRepository
        extends JpaRepository<WalletTransaction, UUID> {
}
