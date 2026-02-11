package com.vaultcore.vaultcore_financial.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class TradingStatsDto {
    private BigDecimal totalVolume24h;
    private List<StockRanking> topTradedStocks;

    @Data
    @Builder
    public static class StockRanking {
        private String symbol;
        private long tradeCount;
    }
}
