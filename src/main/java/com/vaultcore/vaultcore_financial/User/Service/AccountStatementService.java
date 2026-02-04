package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AccountStatementService {

    private final TransactionRepository transactionRepository;

    public AccountStatementService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal getTotalDebit(String keycloakUserId) {
        return transactionRepository
                .findByKeycloakUserIdAndType(
                        keycloakUserId,
                        TransactionType.DEBIT
                )
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalCredit(String keycloakUserId) {
        return transactionRepository
                .findByKeycloakUserIdAndType(
                        keycloakUserId,
                        TransactionType.CREDIT
                )
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
