package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.UserRepository;
import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.WatchlistDto;
import com.vaultcore.vaultcore_financial.stock.entity.Watchlist;
import com.vaultcore.vaultcore_financial.stock.repository.WatchlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final CoinGeckoClient coinGeckoClient;

    public WatchlistService(
            WatchlistRepository watchlistRepository,
            UserRepository userRepository,
            CoinGeckoClient coinGeckoClient
    ) {
        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
        this.coinGeckoClient = coinGeckoClient;
    }

    /* =========================
       CURRENT USER
       ========================= */
    private User getCurrentUser() {
        String keycloakId = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /* =========================
       ADD / REMOVE
       ========================= */
    public void add(String coinId) {
        User user = getCurrentUser();

        if (watchlistRepository.findByUserAndSymbol(user, coinId).isPresent()) {
            return;
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setSymbol(coinId);

        watchlistRepository.save(watchlist);
    }

    public void remove(String coinId) {
        User user = getCurrentUser();

        watchlistRepository.findByUserAndSymbol(user, coinId)
                .ifPresent(watchlistRepository::delete);
    }

    /* =========================
       GET WATCHLIST (BATCHED)
       ========================= */
    public List<WatchlistDto> getWatchlist() {

        User user = getCurrentUser();
        List<Watchlist> watchlist = watchlistRepository.findByUser(user);

        if (watchlist.isEmpty()) {
            return List.of();
        }

        // Collect all coin IDs
        Set<String> coinIds = watchlist.stream()
                .map(Watchlist::getSymbol)
                .collect(Collectors.toSet());

        // SINGLE CoinGecko call with Null Safety
        Map<String, BigDecimal> prices = Map.of();
        try {
            Map<String, BigDecimal> fetchedPrices = coinGeckoClient.getCurrentPrices(coinIds);
            if (fetchedPrices != null) {
                prices = fetchedPrices;
            }
        } catch (Exception ex) {
            // Log if needed, but safe to ignore and generic catch is already there
            prices = Map.of();
        }

        List<WatchlistDto> result = new ArrayList<>();

        for (Watchlist w : watchlist) {
            WatchlistDto dto = new WatchlistDto();
            dto.setCoinId(w.getSymbol());

            BigDecimal price = prices.get(w.getSymbol());

            dto.setCurrentPrice(
                    price != null ? price.doubleValue() : 0.0
            );

            result.add(dto);
        }

        return result;
    }
}
