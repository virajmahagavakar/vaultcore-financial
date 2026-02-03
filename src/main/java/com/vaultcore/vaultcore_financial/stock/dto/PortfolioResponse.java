package com.vaultcore.vaultcore_financial.stock.dto;

import java.util.List;

public class PortfolioResponse {

    private List<HoldingResponse> holdings;
    private Double totalInvested;
    private Double currentValue;
    private Double profitLoss;

    public List<HoldingResponse> getHoldings() {
        return holdings;
    }

    public Double getTotalInvested() {
        return totalInvested;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public Double getProfitLoss() {
        return profitLoss;
    }

    public void setHoldings(List<HoldingResponse> holdings) {
        this.holdings = holdings;
    }

    public void setTotalInvested(Double totalInvested) {
        this.totalInvested = totalInvested;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }

    public void setProfitLoss(Double profitLoss) {
        this.profitLoss = profitLoss;
    }
}

