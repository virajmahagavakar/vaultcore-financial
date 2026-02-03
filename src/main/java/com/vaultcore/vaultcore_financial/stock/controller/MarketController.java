package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.dto.MarketChartDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDto;
import com.vaultcore.vaultcore_financial.stock.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/coins")
    public List<MarketCoinDto> getCoins() {
        return marketService.getMarketCoins();
    }

    @GetMapping("/chart/{coinId}")
    public MarketChartDto getChart(
            @PathVariable String coinId,
            @RequestParam(defaultValue = "1") int days
    ) {
        return marketService.getCoinChart(coinId, days);
    }
}
