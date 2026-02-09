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

        for (StockHolding holding : holdings) {

            // ===== HARD SAFETY CHECKS =====
            if (holding == null) continue;
            if (holding.getQuantity() <= 0) continue;
            if (holding.getAvgBuyPrice() == null) continue;
            if (holding.getSymbol() == null) continue;

            BigDecimal price;

            try {
                price = coinGeckoClient.getCurrentPrice(holding.getSymbol());
            } catch (Exception ex) {
                // CoinGecko failed (timeout / rate limit / bad response)
                continue;
            }

            // ABSOLUTE GUARANTEE
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal quantity =
                    BigDecimal.valueOf(holding.getQuantity());

            BigDecimal investedValue =
                    holding.getAvgBuyPrice().multiply(quantity);

            BigDecimal currentHoldingValue =
                    price.multiply(quantity);

            totalInvested = totalInvested.add(investedValue);
            currentValue = currentValue.add(currentHoldingValue);

            HoldingResponse dto = new HoldingResponse();
            dto.setCoinId(holding.getSymbol());
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
