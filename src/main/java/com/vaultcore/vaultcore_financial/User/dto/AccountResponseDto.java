package com.vaultcore.vaultcore_financial.User.dto;

import com.vaultcore.vaultcore_financial.User.Entity.Account;

import java.math.BigDecimal;

public class AccountResponseDto {

    private String accountNumber;
    private BigDecimal balance;
    private String status;
    private String nickname;

    /* ---------- MAPPER ---------- */

    public static AccountResponseDto from(Account account) {
        AccountResponseDto dto = new AccountResponseDto();
        dto.accountNumber = account.getAccountNumber();
        dto.balance = account.getBalance();
        dto.status = account.getStatus();
        dto.nickname = account.getNickname();
        return dto;
    }

    /* ---------- GETTERS ---------- */

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public String getNickname() {
        return nickname;
    }
}
