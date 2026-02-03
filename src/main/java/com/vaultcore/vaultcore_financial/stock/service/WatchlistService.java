package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.stock.entity.Watchlist;
import com.vaultcore.vaultcore_financial.stock.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public List<Watchlist> getUserWatchlist(UUID userId) {
        return watchlistRepository.findByUserId(userId);
    }

    public Watchlist addToWatchlist(UUID userId, String coinId, String symbol) {

        boolean exists = watchlistRepository
                .existsByUserIdAndCoinId(userId, coinId);

        if (exists) {
            throw new RuntimeException("Coin already in watchlist");
        }

        Watchlist watchlist = Watchlist.builder()
                .userId(userId)
                .coinId(coinId)
                .symbol(symbol)
                .build();

        return watchlistRepository.save(watchlist);
    }

    public void removeFromWatchlist(UUID userId, String coinId) {
        watchlistRepository.deleteByUserIdAndCoinId(userId, coinId);
    }
}

