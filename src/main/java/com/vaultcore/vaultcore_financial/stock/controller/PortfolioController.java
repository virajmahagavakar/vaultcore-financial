package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.dto.PortfolioResponse;
import com.vaultcore.vaultcore_financial.stock.service.StockPortfolioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final StockPortfolioService portfolioService;

    public PortfolioController(StockPortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public PortfolioResponse getPortfolio() {
        return portfolioService.getPortfolio();
    }
}

//✅ What UI features this fully supports
//
//✔ Portfolio holdings table
//✔ Avg buy price
//✔ Quantity
//✔ Live current price
//✔ Invested value
//✔ Current value
//✔ Profit / Loss per coin
//✔ Total invested
//✔ Total portfolio value
//✔ Net P/L
//✔ User-specific (Keycloak isolated)