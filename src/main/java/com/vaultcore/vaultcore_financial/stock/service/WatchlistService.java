package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.UserRepository;
import com.vaultcore.vaultcore_financial.stock.client.CoinGeckoClient;
import com.vaultcore.vaultcore_financial.stock.dto.WatchlistDto;
import com.vaultcore.vaultcore_financial.stock.entity.Watchlist;
import com.vaultcore.vaultcore_financial.stock.repository.WatchlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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

    private User getCurrentUser() {
        String keycloakId = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /* =========================
       ADD TO WATCHLIST
       ========================= */
    public void add(String symbol) {
        User user = getCurrentUser();

        if (watchlistRepository.findByUserAndSymbol(user, symbol).isPresent()) {
            return;
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setSymbol(symbol);

        watchlistRepository.save(watchlist);
    }

    /* =========================
       REMOVE FROM WATCHLIST
       ========================= */
    public void remove(String symbol) {
        User user = getCurrentUser();

        watchlistRepository.findByUserAndSymbol(user, symbol)
                .ifPresent(watchlistRepository::delete);
    }

    /* =========================
       GET WATCHLIST
       ========================= */
    public List<WatchlistDto> getWatchlist() {

        User user = getCurrentUser();
        List<WatchlistDto> result = new ArrayList<>();

        for (Watchlist w : watchlistRepository.findByUser(user)) {

            WatchlistDto dto = new WatchlistDto();
            dto.setSymbol(w.getSymbol());
            dto.setCurrentPrice(
                    coinGeckoClient
                            .getCoinDetails(w.getSymbol())
                            .getCurrentPrice()
                            .doubleValue()
            );

            result.add(dto);
        }

        return result;
    }
}
