package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.MarketChartDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final CoinGeckoClient coinGeckoClient;

    public List<MarketCoinDto> getMarketCoins() {
        return coinGeckoClient.getMarketCoins();
    }

    public MarketChartDto getCoinChart(String coinId, int days) {
        return coinGeckoClient.getMarketChart(coinId, days);
    }
}
