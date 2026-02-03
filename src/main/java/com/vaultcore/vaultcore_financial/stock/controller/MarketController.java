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
       HOME / LISTING ENDPOINTS
       ========================= */

    @GetMapping("/all")
    public List<MarketCoinDto> allCoins() {
        return marketService.getAllCoins();
    }

    @GetMapping("/top50")
    public List<MarketCoinDto> top50() {
        return marketService.getTop50Coins();
    }

    @GetMapping("/gainers")
    public List<MarketCoinDto> topGainers() {
        return marketService.getTopGainers();
    }

    @GetMapping("/losers")
    public List<MarketCoinDto> topLosers() {
        return marketService.getTopLosers();
    }

    /* =========================
       COIN DETAILS
       ========================= */

    @GetMapping("/{symbol}")
    public MarketCoinDetailDto coinDetails(@PathVariable String symbol)
    {
        return marketService.getCoinDetails(symbol);
    }

    /* =========================
       CHART DATA
       ========================= */

    @GetMapping("/{symbol}/chart")
    public MarketChartDto chart(
            @PathVariable String symbol,
            @RequestParam String range
    ) {
        return marketService.getChart(symbol, range);
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