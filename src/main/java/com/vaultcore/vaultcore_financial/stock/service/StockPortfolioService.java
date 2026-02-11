package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.UserRepository;
import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.HoldingResponse;
import com.vaultcore.vaultcore_financial.stock.dto.PortfolioResponse;
import com.vaultcore.vaultcore_financial.stock.entity.StockHolding;
import com.vaultcore.vaultcore_financial.stock.repository.StockHoldingRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockPortfolioService {

    private final StockHoldingRepository stockHoldingRepository;
    private final CoinGeckoClient coinGeckoClient;
    private final UserRepository userRepository;

    public StockPortfolioService(
            StockHoldingRepository stockHoldingRepository,
            CoinGeckoClient coinGeckoClient,
            UserRepository userRepository
    ) {
        this.stockHoldingRepository = stockHoldingRepository;
        this.coinGeckoClient = coinGeckoClient;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String keycloakId = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PortfolioResponse getPortfolio() {

        User user = getCurrentUser();
        List<StockHolding> holdings =
                stockHoldingRepository.findByUser(user);

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        List<HoldingResponse> holdingDtos = new ArrayList<>();


        // 1. Collect all Unique Coin IDs
        java.util.Set<String> coinIds = holdings.stream()
                .map(StockHolding::getSymbol)
                .collect(java.util.stream.Collectors.toSet());

        // 2. Batch Fetch Prices (Much more efficient)
        java.util.Map<String, BigDecimal> currentPrices;
        try {
            currentPrices = coinGeckoClient.getCurrentPrices(coinIds);
        } catch (Exception ex) {
            System.out.println("Rate limit or API error fetching prices, defaulting to 0: " + ex.getMessage());
            currentPrices = java.util.Collections.emptyMap();
        }

        for (StockHolding holding : holdings) {
            if (holding == null || holding.getQuantity() <= 0) continue;

            String symbol = holding.getSymbol();
            BigDecimal price = currentPrices.getOrDefault(symbol, BigDecimal.ZERO);

            // Fallback: If current price is 0, maybe use avg buy price to show *something* or just 0
            // But strict 0 is better than hiding the asset.

            BigDecimal quantity = BigDecimal.valueOf(holding.getQuantity());
            BigDecimal investedValue = holding.getAvgBuyPrice().multiply(quantity);
            BigDecimal currentHoldingValue = price.multiply(quantity);

            totalInvested = totalInvested.add(investedValue);
            currentValue = currentValue.add(currentHoldingValue);

            HoldingResponse dto = new HoldingResponse();
            dto.setCoinId(symbol);
            dto.setQuantity(quantity.doubleValue());
            dto.setAvgBuyPrice(holding.getAvgBuyPrice().doubleValue());
            dto.setCurrentPrice(price.doubleValue());
            dto.setInvestedValue(investedValue.doubleValue());
            dto.setCurrentValue(currentHoldingValue.doubleValue());
            dto.setProfitLoss(
                    currentHoldingValue.subtract(investedValue).doubleValue()
            );

            holdingDtos.add(dto);
        }

        PortfolioResponse response = new PortfolioResponse();
        response.setHoldings(holdingDtos);
        response.setTotalInvested(totalInvested.doubleValue());
        response.setCurrentValue(currentValue.doubleValue());
        response.setProfitLoss(
                currentValue.subtract(totalInvested).doubleValue()
        );

        return response;
    }
}
