package com.vaultcore.vaultcore_financial.admin.service;

import com.vaultcore.vaultcore_financial.admin.dto.TradingStatsDto;
import com.vaultcore.vaultcore_financial.stock.repository.StockTradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradingOversightService {

    private final StockTradeRepository stockTradeRepository;

    public TradingStatsDto getTradingStats() {
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);

        BigDecimal volume = stockTradeRepository.getTotalVolumeSince(yesterday);
        if (volume == null)
            volume = BigDecimal.ZERO;

        List<Object[]> topStocksData = stockTradeRepository.findMostTradedStocks();

        List<TradingStatsDto.StockRanking> rankings = topStocksData.stream()
                .map(obj -> TradingStatsDto.StockRanking.builder()
                        .symbol((String) obj[0])
                        .tradeCount((Long) obj[1])
                        .build())
                .collect(Collectors.toList());

        return TradingStatsDto.builder()
                .totalVolume24h(volume)
                .topTradedStocks(rankings)
                .build();
    }
}
