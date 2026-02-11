package com.vaultcore.vaultcore_financial.admin.service;

import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.TransactionRepository;
import com.vaultcore.vaultcore_financial.User.Repository.UserRepository;
import com.vaultcore.vaultcore_financial.admin.dto.DashboardSummaryDto;
import com.vaultcore.vaultcore_financial.admin.entity.AuditLog;
import com.vaultcore.vaultcore_financial.admin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);

        return DashboardSummaryDto.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByStatus("ACTIVE"))
                .newUsers24h(userRepository.countByCreatedAtAfter(yesterday))
                .totalTransactions24h(transactionRepository.countByCreatedAtAfter(yesterday))
                .failedTransactions(transactionRepository.countByStatus(TransactionStatus.FAILED))
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void updateUserStatus(UUID userId, String status, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldStatus = user.getStatus();
        user.setStatus(status);
        userRepository.save(user);

        // Log Audit
        logAction(adminId, "UPDATE_USER_STATUS", "USER", userId.toString(),
                "Changed status from " + oldStatus + " to " + status);
    }

    private void logAction(String adminId, String action, String targetType, String targetId, String details) {
        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getFlaggedTransactions() {
        return transactionRepository.findByIsFlaggedTrue();
    }

    @Transactional
    public void setTransactionFlag(UUID transactionId, boolean isFlagged, String adminId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        boolean oldFlag = tx.isFlagged();
        tx.setFlagged(isFlagged);
        transactionRepository.save(tx);

        logAction(adminId, "SET_TRANSACTION_FLAG", "TRANSACTION", transactionId.toString(),
                "Changed flagged status from " + oldFlag + " to " + isFlagged);
    }
}
