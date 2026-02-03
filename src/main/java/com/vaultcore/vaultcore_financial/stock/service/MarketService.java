package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.MarketChartDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDetailDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDto;
import org.springframework.stereotype.Service;

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
       MARKET LISTS (HOME PAGE)
       ========================= */

    public List<MarketCoinDto> getAllCoins() {
        return coinGeckoClient.getMarketCoins();
    }

    public List<MarketCoinDto> getTop50Coins() {
        return coinGeckoClient.getMarketCoins()
                .stream()
                .limit(50)
                .collect(Collectors.toList());
    }

    public List<MarketCoinDto> getTopGainers() {
        return coinGeckoClient.getMarketCoins()
                .stream()
                .filter(c -> c.getPriceChangePercentage24h() != null)
                .sorted(Comparator.comparing(
                        MarketCoinDto::getPriceChangePercentage24h
                ).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<MarketCoinDto> getTopLosers() {
        return coinGeckoClient.getMarketCoins()
                .stream()
                .filter(c -> c.getPriceChangePercentage24h() != null)
                .sorted(Comparator.comparing(
                        MarketCoinDto::getPriceChangePercentage24h
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    /* =========================
       COIN DETAILS PAGE
       ========================= */

    public MarketCoinDetailDto getCoinDetails(String symbol) {
        return coinGeckoClient.getCoinDetails(symbol);
    }

    /* =========================
       PRICE CHART
       range = 1D | 1W | 1M
       ========================= */

    public MarketChartDto getChart(String symbol, String range) {

        int days;

        switch (range.toUpperCase()) {
            case "1D":
                days = 1;
                break;
            case "1W":
                days = 7;
                break;
            case "1M":
                days = 30;
                break;
            default:
                throw new IllegalArgumentException(
                        "Invalid range. Use 1D, 1W, or 1M"
                );
        }

        return coinGeckoClient.getMarketChart(symbol, days);
    }
}
