package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /* ---------------- CREATE / RECORD ---------------- */

    public Transaction recordTransaction(
            UUID fromAccount,
            UUID toAccount,
            BigDecimal amount,
            TransactionType type,
            String description,
            String keycloakUserId
    ) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Transaction tx = new Transaction();
        tx.setFromAccountId(fromAccount);
        tx.setToAccountId(toAccount);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setStatus(TransactionStatus.PENDING);
        tx.setDescription(description);
        tx.setKeycloakUserId(keycloakUserId);
        tx.setReferenceId(UUID.randomUUID().toString());

        return transactionRepository.save(tx);
    }

    public void markTransactionSuccess(String referenceId) {
        Transaction tx = transactionRepository.findByReferenceId(referenceId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalStateException("Invalid status transition");
        }

        tx.setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(tx);
    }

    public void markTransactionFailed(String referenceId) {
        Transaction tx = transactionRepository.findByReferenceId(referenceId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        tx.setStatus(TransactionStatus.FAILED);
        transactionRepository.save(tx);
    }

    /* ---------------- READ / HISTORY ---------------- */

    public List<Transaction> getRecentTransactions(String keycloakUserId) {
        return transactionRepository
                .findTop10ByKeycloakUserIdOrderByCreatedAtDesc(keycloakUserId);
    }

    public Transaction getTransactionById(UUID transactionId, String keycloakUserId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!tx.getKeycloakUserId().equals(keycloakUserId)) {
            throw new SecurityException("Unauthorized access");
        }
        return tx;
    }

    public List<Transaction> getTransactionsByDateRange(
            String keycloakUserId,
            LocalDate from,
            LocalDate to
    ) {
        return transactionRepository.findByKeycloakUserIdAndCreatedAtBetween(
                keycloakUserId,
                from.atStartOfDay(),
                to.atTime(23, 59, 59)
        );
    }

    public List<Transaction> getTransactionsByType(
            String keycloakUserId,
            TransactionType type
    ) {
        return transactionRepository.findByKeycloakUserIdAndType(keycloakUserId, type);
    }

    public List<Transaction> getTransactionsByStatus(
            String keycloakUserId,
            TransactionStatus status
    ) {
        return transactionRepository.findByKeycloakUserIdAndStatus(keycloakUserId, status);
    }

    /* ---------------- INSIGHTS ---------------- */

    public BigDecimal getTotalDebited(String keycloakUserId) {
        return transactionRepository.findByKeycloakUserIdAndType(
                        keycloakUserId, TransactionType.DEBIT)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalCredited(String keycloakUserId) {
        return transactionRepository.findByKeycloakUserIdAndType(
                        keycloakUserId, TransactionType.CREDIT)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
