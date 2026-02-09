package com.vaultcore.vaultcore_financial.stock.dto;

public class HoldingResponse {

    private String coinId;
    private Double quantity;
    private Double avgBuyPrice;
    private Double currentPrice;
    private Double investedValue;
    private Double currentValue;
    private Double profitLoss;

    public String getCoinId() {
        return coinId;
    }

    public Double getQuantity() {
        return quantity;
    }

    public Double getAvgBuyPrice() {
        return avgBuyPrice;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public Double getInvestedValue() {
        return investedValue;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public Double getProfitLoss() {
        return profitLoss;
    }

    public void setCoinId(String coinId) {
        this.coinId = coinId;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public void setAvgBuyPrice(Double avgBuyPrice) {
        this.avgBuyPrice = avgBuyPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public void setInvestedValue(Double investedValue) {
        this.investedValue = investedValue;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }

    public void setProfitLoss(Double profitLoss) {
        this.profitLoss = profitLoss;
    }
}
