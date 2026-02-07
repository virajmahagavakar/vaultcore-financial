package com.vaultcore.vaultcore_financial.User.dto;

import java.util.List;

public class MonthlyStatementDto {

    private String accountNumber;
    private String month;
    private int year;
    private List<StatementRowDto> transactions;

    public MonthlyStatementDto(
            String accountNumber,
            String month,
            int year,
            List<StatementRowDto> transactions
    ) {
        this.accountNumber = accountNumber;
        this.month = month;
        this.year = year;
        this.transactions = transactions;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public List<StatementRowDto> getTransactions() {
        return transactions;
    }
}
