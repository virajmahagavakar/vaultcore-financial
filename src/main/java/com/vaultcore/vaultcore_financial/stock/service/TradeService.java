package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.UserRepository;
import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.BuyRequest;
import com.vaultcore.vaultcore_financial.stock.dto.SellRequest;
import com.vaultcore.vaultcore_financial.stock.dto.TradeResponse;
import com.vaultcore.vaultcore_financial.stock.entity.StockHolding;
import com.vaultcore.vaultcore_financial.stock.entity.StockTrade;
import com.vaultcore.vaultcore_financial.stock.entity.TradeType;
import com.vaultcore.vaultcore_financial.stock.repository.StockHoldingRepository;
import com.vaultcore.vaultcore_financial.stock.repository.StockTradeRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TradeService {

    private final StockTradeRepository stockTradeRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final CoinGeckoClient coinGeckoClient;
    private final WalletService walletService;
    private final UserRepository userRepository;

    public TradeService(
            StockTradeRepository stockTradeRepository,
            StockHoldingRepository stockHoldingRepository,
            CoinGeckoClient coinGeckoClient,
            WalletService walletService,
            UserRepository userRepository) {
        this.stockTradeRepository = stockTradeRepository;
        this.stockHoldingRepository = stockHoldingRepository;
        this.coinGeckoClient = coinGeckoClient;
        this.walletService = walletService;
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

    /* ========================= BUY ========================= */

    @Transactional
    public TradeResponse buy(BuyRequest request) {

        if (request == null || request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid buy amount");
        }

        User user = getCurrentUser();
        String coinId = request.getCoinId();

        BigDecimal price = coinGeckoClient.getCurrentPrice(coinId);
        if (price == null) {
            throw new IllegalStateException("Failed to fetch current price for coin: " + coinId);
        }
        BigDecimal amount = request.getAmount();

        int quantity = amount.divide(price, 0, RoundingMode.DOWN).intValue();
        if (quantity <= 0) {
            throw new IllegalStateException("Amount too small to buy");
        }

        BigDecimal totalCost = price.multiply(BigDecimal.valueOf(quantity));

        // ✅ CORRECT WALLET CALL
        walletService.debitForTrade(user.getKeycloakId(), totalCost);

        StockHolding holding = stockHoldingRepository
                .findByUserAndSymbol(user, coinId)
                .orElseGet(() -> {
                    StockHolding h = new StockHolding();
                    h.setUser(user);
                    h.setSymbol(coinId);
                    h.setQuantity(0);
                    h.setAvgBuyPrice(BigDecimal.ZERO);
                    return h;
                });

        BigDecimal existingValue = holding.getAvgBuyPrice()
                .multiply(BigDecimal.valueOf(holding.getQuantity()));

        BigDecimal newValue = existingValue.add(totalCost);
        int newQty = holding.getQuantity() + quantity;

        holding.setQuantity(newQty);
        holding.setAvgBuyPrice(
                newValue.divide(BigDecimal.valueOf(newQty), 8, RoundingMode.HALF_UP));

        stockHoldingRepository.save(holding);

        StockTrade trade = new StockTrade();
        trade.setUser(user);
        trade.setSymbol(coinId);
        trade.setQuantity(quantity);
        trade.setPrice(price);
        trade.setType(TradeType.BUY);

        stockTradeRepository.save(trade);

        return new TradeResponse(
                coinId,
                TradeType.BUY.name(),
                quantity,
                price.doubleValue(),
                "BUY order executed successfully");
    }

    /* ========================= SELL ========================= */

    @Transactional
    public TradeResponse sell(SellRequest request) {

        User user = getCurrentUser();
        String coinId = request.getCoinId();

        int sellQty = request.getQuantity();

        if (sellQty <= 0) {
            throw new IllegalArgumentException("Invalid sell quantity");
        }

        StockHolding holding = stockHoldingRepository
                .findByUserAndSymbol(user, coinId)
                .orElseThrow(() -> new IllegalStateException("No holdings found"));

        if (holding.getQuantity() < sellQty) {
            throw new IllegalStateException("Insufficient quantity");
        }

        BigDecimal price = coinGeckoClient.getCurrentPrice(coinId);
        if (price == null) {
            throw new IllegalStateException("Failed to fetch current price for coin: " + coinId);
        }
        BigDecimal sellAmount = price.multiply(BigDecimal.valueOf(sellQty));

        holding.setQuantity(holding.getQuantity() - sellQty);

        if (holding.getQuantity() == 0) {
            stockHoldingRepository.delete(holding);
        } else {
            stockHoldingRepository.save(holding);
        }

        // ✅ CORRECT WALLET CALL
        walletService.creditForTrade(user.getKeycloakId(), sellAmount);

        StockTrade trade = new StockTrade();
        trade.setUser(user);
        trade.setSymbol(coinId);
        trade.setQuantity(sellQty);
        trade.setPrice(price);
        trade.setType(TradeType.SELL);

        stockTradeRepository.save(trade);

        return new TradeResponse(
                coinId,
                TradeType.SELL.name(),
                sellQty,
                price.doubleValue(),
                "SELL order executed successfully");
    }

    public List<StockTrade> getTradeHistory() {
        return stockTradeRepository
                .findByUserOrderByCreatedAtDesc(getCurrentUser());
    }
}
