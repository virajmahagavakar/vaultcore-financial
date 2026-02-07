package com.vaultcore.vaultcore_financial.User.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StatementRowDto {

    private LocalDateTime transactionTime;
    private String type;            // DEBIT / CREDIT
    private BigDecimal amount;
    private String status;
    private String fromAccount;
    private String toAccount;
    private String description;

    public StatementRowDto(
            LocalDateTime transactionTime,
            String type,
            BigDecimal amount,
            String status,
            String fromAccount,
            String toAccount,
            String description
    ) {
        this.transactionTime = transactionTime;
        this.type = type;
        this.amount = amount;
        this.status = status;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.description = description;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public String getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public String getFromAccount() {
        return fromAccount;
    }

    public String getToAccount() {
        return toAccount;
    }

    public String getDescription() {
        return description;
    }
}
