package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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
        securityService.ensureAccountActive(from);
        securityService.verifyPin(from, pin);
        limitService.validateDailyLimit(from, amount);

        if (from.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepository.save(from);
        accountRepository.save(to);

        transactionService.recordTransaction(
                from.getId(),
                to.getId(),
                amount,
                TransactionType.DEBIT,
                "Fund Transfer",
                keycloakUserId
        );

        notificationService.sendTransactionAlert(
                from, amount, "DEBIT"
        );
    }
}

