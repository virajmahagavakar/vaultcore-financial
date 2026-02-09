package com.vaultcore.vaultcore_financial.stock.dto;

public class WatchlistDto {

    private String coinId;
    private Double currentPrice;

    public String getCoinId() {
        return coinId;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCoinId(String coinId) {
        this.coinId = coinId;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }
}
