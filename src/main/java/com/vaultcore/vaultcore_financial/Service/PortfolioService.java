package com.vaultcore.vaultcore_financial.Service;

import com.vaultcore.vaultcore_financial.Entity.Portfolio;
import com.vaultcore.vaultcore_financial.Entity.User;
import com.vaultcore.vaultcore_financial.Repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    public PortfolioService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    // 🔹 Get full portfolio of logged-in user
    public List<Portfolio> getUserPortfolio(User user) {
        return portfolioRepository.findByUser(user);
    }

    // 🔹 Add stock to portfolio (used during BUY)
    public Portfolio addStock(
            User user,
            String stockSymbol,
            int quantity,
            double buyPrice
    ) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(UUID.randomUUID());
        portfolio.setUser(user);
        portfolio.setStockSymbol(stockSymbol);
        portfolio.setQuantity(quantity);
        portfolio.setAvgBuyPrice(
                java.math.BigDecimal.valueOf(buyPrice)
        );

        return portfolioRepository.save(portfolio);
    }

    // 🔹 Update portfolio after SELL
    public Portfolio updateStock(
            Portfolio portfolio,
            int newQuantity,
            double newAvgPrice
    ) {
        portfolio.setQuantity(newQuantity);
        portfolio.setAvgBuyPrice(
                java.math.BigDecimal.valueOf(newAvgPrice)
        );
        return portfolioRepository.save(portfolio);
    }
}
