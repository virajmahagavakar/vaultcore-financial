package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.entity.Watchlist;
import com.vaultcore.vaultcore_financial.stock.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping("/{userId}")
    public List<Watchlist> getWatchlist(@PathVariable UUID userId) {
        return watchlistService.getUserWatchlist(userId);
    }

    @PostMapping("/{userId}")
    public Watchlist addToWatchlist(
            @PathVariable UUID userId,
            @RequestParam String coinId,
            @RequestParam String symbol
    ) {
        return watchlistService.addToWatchlist(userId, coinId, symbol);
    }

    @DeleteMapping("/{userId}/{coinId}")
    public void removeFromWatchlist(
            @PathVariable UUID userId,
            @PathVariable String coinId
    ) {
        watchlistService.removeFromWatchlist(userId, coinId);
    }
}
