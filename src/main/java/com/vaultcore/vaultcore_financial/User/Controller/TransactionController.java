package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import com.vaultcore.vaultcore_financial.User.Service.FundTransferService;
import com.vaultcore.vaultcore_financial.User.Service.TransactionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final FundTransferService fundTransferService;
    private final AccountService accountService;

    public TransactionController(
            TransactionService transactionService,
            FundTransferService fundTransferService,
            AccountService accountService
    ) {
        this.transactionService = transactionService;
        this.fundTransferService = fundTransferService;
        this.accountService = accountService;
    }

    /* ---------------- TRANSFER ---------------- */

    @PostMapping("/transfer")
    public String transfer(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID toAccountId,
            @RequestParam BigDecimal amount,
            @RequestParam String pin
    ) {
        Account fromAccount = accountService
                .getAccountForUser(jwt.getSubject());

        Account toAccount = accountService
                .getAccountById(toAccountId);

        fundTransferService.transfer(
                fromAccount,
                toAccount,
                amount,
                pin,
                jwt.getSubject()
        );

        return "Transfer successful";
    }

    /* ---------------- READ / HISTORY ---------------- */

    @GetMapping("/recent")
    public List<Transaction> recent(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return transactionService
                .getRecentTransactions(jwt.getSubject());
    }

    @GetMapping("/{id}")
    public Transaction getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id
    ) {
        return transactionService
                .getTransactionById(id, jwt.getSubject());
    }

    @GetMapping("/filter/date")
    public List<Transaction> byDate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return transactionService
                .getTransactionsByDateRange(
                        jwt.getSubject(),
                        from,
                        to
                );
    }

    @GetMapping("/filter/type")
    public List<Transaction> byType(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam TransactionType type
    ) {
        return transactionService
                .getTransactionsByType(
                        jwt.getSubject(),
                        type
                );
    }

    @GetMapping("/filter/status")
    public List<Transaction> byStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam TransactionStatus status
    ) {
        return transactionService
                .getTransactionsByStatus(
                        jwt.getSubject(),
                        status
                );
    }

    /* ---------------- SUMMARY ---------------- */

    @GetMapping("/summary/debit")
    public BigDecimal totalDebit(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return transactionService
                .getTotalDebited(jwt.getSubject());
    }

    @GetMapping("/summary/credit")
    public BigDecimal totalCredit(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return transactionService
                .getTotalCredited(jwt.getSubject());
    }
}
