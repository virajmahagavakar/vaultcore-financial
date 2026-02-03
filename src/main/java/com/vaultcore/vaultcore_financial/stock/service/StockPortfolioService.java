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

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName(); // Keycloak ID
    }

    public PortfolioResponse getPortfolio() {

        String keycloakId = getCurrentUserId();

        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<StockHolding> holdings = stockHoldingRepository.findByUser(user);

        double totalInvested = 0.0;
        double currentValue = 0.0;

        List<HoldingResponse> holdingDtos = new ArrayList<>();

        for (StockHolding holding : holdings) {

            double livePrice =
                    coinGeckoClient
                            .getCurrentPrice(holding.getSymbol())
                            .doubleValue();

            double investedValue =
                    holding.getAvgBuyPrice()
                            .multiply(BigDecimal.valueOf(holding.getQuantity()))
                            .doubleValue();

            double currentHoldingValue =
                    holding.getQuantity() * livePrice;

            totalInvested += investedValue;
            currentValue += currentHoldingValue;

            HoldingResponse dto = new HoldingResponse();
            dto.setSymbol(holding.getSymbol());
            dto.setQuantity((double) holding.getQuantity());
            dto.setAvgBuyPrice(holding.getAvgBuyPrice().doubleValue());
            dto.setCurrentPrice(livePrice);
            dto.setInvestedValue(investedValue);
            dto.setCurrentValue(currentHoldingValue);
            dto.setProfitLoss(currentHoldingValue - investedValue);

            holdingDtos.add(dto);
        }

        PortfolioResponse response = new PortfolioResponse();
        response.setHoldings(holdingDtos);
        response.setTotalInvested(totalInvested);
        response.setCurrentValue(currentValue);
        response.setProfitLoss(currentValue - totalInvested);

        return response;
    }
}
