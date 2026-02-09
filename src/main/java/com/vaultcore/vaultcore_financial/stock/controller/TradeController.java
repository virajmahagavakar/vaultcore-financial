package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.dto.BuyRequest;
import com.vaultcore.vaultcore_financial.stock.dto.SellRequest;
import com.vaultcore.vaultcore_financial.stock.dto.TradeResponse;
import com.vaultcore.vaultcore_financial.stock.entity.StockTrade;
import com.vaultcore.vaultcore_financial.stock.service.TradeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    /* ========================= BUY ========================= */

    @PostMapping("/buy")
    public TradeResponse buy(@RequestBody BuyRequest request) {
        return tradeService.buy(request);
    }

    /* ========================= SELL ========================= */

    @PostMapping("/sell")
    public TradeResponse sell(@RequestBody SellRequest request) {
        return tradeService.sell(request);
    }

    /* ========================= HISTORY ========================= */

    @GetMapping("/history")
    public List<StockTrade> history() {
        return tradeService.getTradeHistory();
    }
}

