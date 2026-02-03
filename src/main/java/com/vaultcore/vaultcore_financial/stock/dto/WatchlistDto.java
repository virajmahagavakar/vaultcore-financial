package com.vaultcore.vaultcore_financial.stock.dto;

public class WatchlistDto {

    private String symbol;
    private Double currentPrice;

    public String getSymbol() {
        return symbol;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }
}

