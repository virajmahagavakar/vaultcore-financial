package com.vaultcore.vaultcore_financial.stock.dto;

import java.util.List;

public class MarketChartDto {

    private String coinId;
    private List<ChartPointDto> prices;

    public String getCoinId() { return coinId; }
    public void setCoinId(String coinId) { this.coinId = coinId; }

    public List<ChartPointDto> getPrices() { return prices; }
    public void setPrices(List<ChartPointDto> prices) { this.prices = prices; }
}