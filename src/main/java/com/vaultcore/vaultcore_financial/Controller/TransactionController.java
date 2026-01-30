package com.vaultcore.vaultcore_financial.Controller;

import com.vaultcore.vaultcore_financial.Entity.*;
import com.vaultcore.vaultcore_financial.Entity.Enum.TransactionStatus;
import com.vaultcore.vaultcore_financial.Entity.Enum.TransactionType;
import com.vaultcore.vaultcore_financial.Service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/recent")
    public List<Transaction> recent(@RequestParam String userId) {
        return transactionService.getRecentTransactions(userId);
    }

    @GetMapping("/{id}")
    public Transaction getById(
            @PathVariable UUID id,
            @RequestParam String userId
    ) {
        return transactionService.getTransactionById(id, userId);
    }

    @GetMapping("/filter/date")
    public List<Transaction> byDate(
            @RequestParam String userId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return transactionService.getTransactionsByDateRange(userId, from, to);
    }

    @GetMapping("/filter/type")
    public List<Transaction> byType(
            @RequestParam String userId,
            @RequestParam TransactionType type
    ) {
        return transactionService.getTransactionsByType(userId, type);
    }

    @GetMapping("/filter/status")
    public List<Transaction> byStatus(
            @RequestParam String userId,
            @RequestParam TransactionStatus status
    ) {
        return transactionService.getTransactionsByStatus(userId, status);
    }

    @GetMapping("/summary/debit")
    public BigDecimal totalDebit(@RequestParam String userId) {
        return transactionService.getTotalDebited(userId);
    }

    @GetMapping("/summary/credit")
    public BigDecimal totalCredit(@RequestParam String userId) {
        return transactionService.getTotalCredited(userId);
    }
}
