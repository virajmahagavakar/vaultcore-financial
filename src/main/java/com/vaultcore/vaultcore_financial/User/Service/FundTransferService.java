package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Transactional
public class FundTransferService {

    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final AccountSecurityService securityService;
    private final TransactionLimitService limitService;
    private final NotificationService notificationService;

    public FundTransferService(
            AccountRepository accountRepository,
            TransactionService transactionService,
            AccountSecurityService securityService,
            TransactionLimitService limitService,
            NotificationService notificationService
    ) {
        this.accountRepository = accountRepository;
        this.transactionService = transactionService;
        this.securityService = securityService;
        this.limitService = limitService;
        this.notificationService = notificationService;
    }

    public void transfer(
            Account from,
            Account to,
            BigDecimal amount,
            String pin,
            String keycloakUserId
    ) {

        /* ===============================
           SECURITY & VALIDATION
           =============================== */

        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Cannot transfer to same account");
        }

        securityService.ensureAccountActive(from);
        securityService.verifyPin(from, pin);
        limitService.validateDailyLimit(from, amount);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        if (from.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }

        /* ===============================
           BALANCE UPDATE (ATOMIC)
           =============================== */

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepository.save(from);
        accountRepository.save(to);

        /* ===============================
           TRANSACTION RECORDS
           =============================== */

        String referenceId = UUID.randomUUID().toString();

        // DEBIT – Sender
        transactionService.recordTransaction(
                from.getId(),
                to.getId(),
                amount,
                TransactionType.DEBIT,
                "Transfer to " + to.getAccountNumber(),
                from.getKeycloakUserId(),
                referenceId
        );

        // CREDIT – Receiver
        transactionService.recordTransaction(
                from.getId(),
                to.getId(),
                amount,
                TransactionType.CREDIT,
                "Received from " + from.getAccountNumber(),
                to.getKeycloakUserId(),
                referenceId
        );

        /* ===============================
           FINALIZE
           =============================== */

        transactionService.markTransactionSuccess(referenceId);

        /* ===============================
           NOTIFICATIONS
           =============================== */

        notificationService.sendTransactionAlert(
                from, amount, "DEBIT"
        );
        notificationService.sendTransactionAlert(
                to, amount, "CREDIT"
        );
    }
}
