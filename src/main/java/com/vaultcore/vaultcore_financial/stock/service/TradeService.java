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
            UserRepository userRepository
    ) {
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

        User user = getCurrentUser();

        BigDecimal price = coinGeckoClient
                .getCoinDetails(request.getSymbol())
                .getCurrentPrice();

        BigDecimal amount = BigDecimal.valueOf(request.getAmount());

        int quantity = amount
                .divide(price, 0, RoundingMode.DOWN)
                .intValue();

        if (quantity <= 0) {
            throw new IllegalStateException("Amount too small to buy");
        }

        walletService.debit(request.getAmount());

        StockHolding holding = stockHoldingRepository
                .findByUserAndSymbol(user, request.getSymbol())
                .orElseGet(() -> {
                    StockHolding h = new StockHolding();
                    h.setUser(user);
                    h.setSymbol(request.getSymbol());
                    h.setQuantity(0);
                    h.setAvgBuyPrice(BigDecimal.ZERO);
                    return h;
                });

        BigDecimal totalCost =
                holding.getAvgBuyPrice()
                        .multiply(BigDecimal.valueOf(holding.getQuantity()))
                        .add(price.multiply(BigDecimal.valueOf(quantity)));

        int newQty = holding.getQuantity() + quantity;

        holding.setQuantity(newQty);
        holding.setAvgBuyPrice(
                totalCost.divide(BigDecimal.valueOf(newQty), 8, RoundingMode.HALF_UP)
        );

        stockHoldingRepository.save(holding);

        StockTrade trade = new StockTrade();
        trade.setUser(user);
        trade.setSymbol(request.getSymbol());
        trade.setQuantity(quantity);
        trade.setPrice(price);
        trade.setType(TradeType.BUY);

        stockTradeRepository.save(trade);

        return new TradeResponse(
                request.getSymbol(),
                TradeType.BUY.name(),
                (double) quantity,
                price.doubleValue(),
                "BUY order executed successfully"
        );
    }

    /* ========================= SELL ========================= */
    @Transactional
    public TradeResponse sell(SellRequest request) {

        User user = getCurrentUser();

        StockHolding holding = stockHoldingRepository
                .findByUserAndSymbol(user, request.getSymbol())
                .orElseThrow(() -> new IllegalStateException("No holdings found"));

        int sellQty = request.getQuantity().intValue();

        if (holding.getQuantity() < sellQty) {
            throw new IllegalStateException("Insufficient quantity");
        }

        BigDecimal price = coinGeckoClient
                .getCoinDetails(request.getSymbol())
                .getCurrentPrice();

        BigDecimal sellAmount =
                price.multiply(BigDecimal.valueOf(sellQty));

        holding.setQuantity(holding.getQuantity() - sellQty);

        if (holding.getQuantity() == 0) {
            stockHoldingRepository.delete(holding);
        } else {
            stockHoldingRepository.save(holding);
        }

        walletService.credit(sellAmount.doubleValue());

        StockTrade trade = new StockTrade();
        trade.setUser(user);
        trade.setSymbol(request.getSymbol());
        trade.setQuantity(sellQty);
        trade.setPrice(price);
        trade.setType(TradeType.SELL);

        stockTradeRepository.save(trade);

        return new TradeResponse(
                request.getSymbol(),
                TradeType.SELL.name(),
                (double) sellQty,
                price.doubleValue(),
                "SELL order executed successfully"
        );
    }

    /* ========================= HISTORY ========================= */
    public List<StockTrade> getTradeHistory() {
        return stockTradeRepository
                .findByUserOrderByCreatedAtDesc(getCurrentUser());
    }
}
