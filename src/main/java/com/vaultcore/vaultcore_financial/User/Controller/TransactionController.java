package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.User.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import com.vaultcore.vaultcore_financial.User.Service.FundTransferService;
import com.vaultcore.vaultcore_financial.User.Service.TransactionService;
import com.vaultcore.vaultcore_financial.User.dto.TransferRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private static final Logger log =
            LoggerFactory.getLogger(TransactionController.class);

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
    public Map<String, Object> transfer(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody TransferRequestDto request
    ) {

        log.info("=== TRANSFER REQUEST START ===");
        log.info("Authenticated user (keycloakId): {}", jwt.getSubject());
        log.info("Transfer request → toAccountNumber={}, amount={}",
                request.getToAccountNumber(),
                request.getAmount()
        );

        Account fromAccount =
                accountService.getAccountForUser(jwt.getSubject());

        log.info(
                "FROM account resolved → id={}, accountNumber={}, keycloakUserId={}",
                fromAccount.getId(),
                fromAccount.getAccountNumber(),
                fromAccount.getKeycloakUserId()
        );

        Account toAccount =
                accountService.getAccountByAccountNumber(
                        request.getToAccountNumber()
                );

        log.info(
                "TO account resolved → id={}, accountNumber={}, keycloakUserId={}",
                toAccount.getId(),
                toAccount.getAccountNumber(),
                toAccount.getKeycloakUserId()
        );

        log.info(
                "FROM == TO ? {}",
                fromAccount.getId().equals(toAccount.getId())
        );

        fundTransferService.transfer(
                fromAccount,
                toAccount,
                request.getAmount(),
                request.getPin(),
                jwt.getSubject()
        );

        log.info("=== TRANSFER COMPLETED SUCCESSFULLY ===");

        return Map.of(
                "status", "SUCCESS",
                "message", "Transfer completed successfully"
        );
    }

    /* ---------------- HISTORY ---------------- */

    @GetMapping("/recent")
    public List<Transaction> recent(
            @AuthenticationPrincipal Jwt jwt
    ) {
        log.debug("Fetching recent transactions for user={}", jwt.getSubject());
        return transactionService.getRecentTransactions(jwt.getSubject());
    }

    @GetMapping("/{id}")
    public Transaction getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id
    ) {
        log.debug("Fetching transaction id={} for user={}", id, jwt.getSubject());
        return transactionService.getTransactionById(id, jwt.getSubject());
    }

    /* ---------------- FILTERS ---------------- */

    @GetMapping("/filter/date")
    public List<Transaction> byDate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        log.debug(
                "Filtering transactions by date for user={}, from={}, to={}",
                jwt.getSubject(), from, to
        );
        return transactionService
                .getTransactionsByDateRange(jwt.getSubject(), from, to);
    }

    @GetMapping("/filter/type")
    public List<Transaction> byType(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam TransactionType type
    ) {
        log.debug(
                "Filtering transactions by type for user={}, type={}",
                jwt.getSubject(), type
        );
        return transactionService
                .getTransactionsByType(jwt.getSubject(), type);
    }

    @GetMapping("/filter/status")
    public List<Transaction> byStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam TransactionStatus status
    ) {
        log.debug(
                "Filtering transactions by status for user={}, status={}",
                jwt.getSubject(), status
        );
        return transactionService
                .getTransactionsByStatus(jwt.getSubject(), status);
    }

    /* ---------------- SUMMARY ---------------- */

    @GetMapping("/summary/debit")
    public BigDecimal totalDebit(
            @AuthenticationPrincipal Jwt jwt
    ) {
        log.debug("Calculating total debit for user={}", jwt.getSubject());
        return transactionService.getTotalDebited(jwt.getSubject());
    }

    @GetMapping("/summary/credit")
    public BigDecimal totalCredit(
            @AuthenticationPrincipal Jwt jwt
    ) {
        log.debug("Calculating total credit for user={}", jwt.getSubject());
        return transactionService.getTotalCredited(jwt.getSubject());
    }
}
