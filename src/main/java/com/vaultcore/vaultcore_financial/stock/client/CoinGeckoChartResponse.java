package com.vaultcore.vaultcore_financial.stock.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CoinGeckoChartResponse {
    public List<List<Number>> prices;
}
