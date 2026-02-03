package com.vaultcore.vaultcore_financial.stock.dto;

public class BuyRequest {

    private String symbol;
    private Double amount; // money user wants to invest

    public String getSymbol() {
        return symbol;
    }

    public Double getAmount() {
        return amount;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}

