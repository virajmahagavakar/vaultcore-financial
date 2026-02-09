package com.vaultcore.vaultcore_financial.stock.dto;

import java.math.BigDecimal;

public class BuyRequest {

    private String coinId;
    private BigDecimal amount; // money user wants to invest

    public String getCoinId() {
        return coinId;
    }

    public void setCoinId(String coinId) {
        this.coinId = coinId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
