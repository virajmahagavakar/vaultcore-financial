package com.vaultcore.vaultcore_financial.stock.dto;

import lombok.Getter;

@Getter
public class WalletResponse {

    private Double balance;

    public WalletResponse(Double balance) {
        this.balance = balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}
