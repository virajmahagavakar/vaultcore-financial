package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.MarketChartDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDetailDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketService {

    private final CoinGeckoClient coinGeckoClient;

    public MarketService(CoinGeckoClient coinGeckoClient) {
        this.coinGeckoClient = coinGeckoClient;
    }

    /* =========================
       MARKET LISTS
       ========================= */

    public List<MarketCoinDto> getAllCoins() {
        return coinGeckoClient.getMarketCoins();
    }

    public List<MarketCoinDto> getTop50Coins() {
        return coinGeckoClient.getMarketCoins()
                .stream()
                .limit(50)
                .toList();
    }

    public List<MarketCoinDto> getTopGainers() {
        return coinGeckoClient.getMarketCoins()
                .stream()
                .filter(c -> c.getPriceChangePercentage24h() != null)
                .sorted(Comparator.comparing(
                        MarketCoinDto::getPriceChangePercentage24h
                ).reversed())
                .limit(10)
                .toList();
    }

    public List<MarketCoinDto> getTopLosers() {
        return coinGeckoClient.getMarketCoins()
                .stream()
                .filter(c -> c.getPriceChangePercentage24h() != null)
                .sorted(Comparator.comparing(
                        MarketCoinDto::getPriceChangePercentage24h
                ))
                .limit(10)
                .toList();
    }

    /* =========================
       COIN DETAILS
       ========================= */

    public MarketCoinDetailDto getCoinDetails(String coinId) {
        return coinGeckoClient.getCoinDetails(coinId);
    }

    /* =========================
       PRICE CHART
       ========================= */

    public MarketChartDto getChart(String coinId, String range) {

        if (range == null || range.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Range is required"
            );
        }

        int days;

        switch (range.toUpperCase()) {

            // Label-based ranges (optional support)
            case "1D" -> days = 1;
            case "1W" -> days = 7;
            case "1M" -> days = 30;
            case "1Y" -> days = 180;

            // Numeric ranges (frontend-friendly)
            case "1" -> days = 1;
            case "7" -> days = 7;
            case "30" -> days = 30;
            case "180" -> days = 180;

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid range. Allowed values: 1, 7, 30, 180 (or 1D, 1W, 1M, 1Y)"
            );
        }

        return coinGeckoClient.getMarketChart(coinId, days);
    }

}
