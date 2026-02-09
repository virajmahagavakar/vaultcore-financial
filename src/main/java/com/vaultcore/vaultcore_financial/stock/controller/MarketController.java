package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.dto.MarketChartDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDetailDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDto;
import com.vaultcore.vaultcore_financial.stock.service.MarketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    /* =========================
       MARKET LISTS
       ========================= */

    @GetMapping("/coins")
    public List<MarketCoinDto> getAllCoins() {
        return marketService.getAllCoins();
    }

    @GetMapping("/coins/top50")
    public List<MarketCoinDto> getTop50Coins() {
        return marketService.getTop50Coins();
    }

    @GetMapping("/coins/gainers")
    public List<MarketCoinDto> getTopGainers() {
        return marketService.getTopGainers();
    }

    @GetMapping("/coins/losers")
    public List<MarketCoinDto> getTopLosers() {
        return marketService.getTopLosers();
    }

    /* =========================
       COIN DETAILS
       ========================= */

    @GetMapping("/coins/{coinId}")
    public MarketCoinDetailDto coinDetails(@PathVariable String coinId) {
        return marketService.getCoinDetails(coinId);
    }

    /* =========================
       PRICE CHART
       ========================= */

    @GetMapping("/coins/{coinId}/chart")
    public MarketChartDto chart(
            @PathVariable String coinId,
            @RequestParam String range
    ) {
        return marketService.getChart(coinId, range);
    }
}

//✅ UI features fully backed (Market)
//
//✔ Home page coin list
//✔ Top 50
//        ✔ Top gainers
//✔ Top losers
//✔ Live price, % change, market cap
//✔ Coin details page
//✔ Chart (1D / 1W / 1M)
//✔ Stateless & scalable
//✔ No auth leakage (market data is public)