package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.dto.WatchlistDto;
import com.vaultcore.vaultcore_financial.stock.service.WatchlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    /* =========================
       ADD TO WATCHLIST
       ========================= */
    @PostMapping("/{coinId}")
    public ResponseEntity<Void> add(@PathVariable String coinId) {
        watchlistService.add(coinId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /* =========================
       REMOVE FROM WATCHLIST
       ========================= */
    @DeleteMapping("/{coinId}")
    public ResponseEntity<Void> remove(@PathVariable String coinId) {
        watchlistService.remove(coinId);
        return ResponseEntity.noContent().build();
    }

    /* =========================
       GET WATCHLIST (SAFE)
       ========================= */
    @GetMapping
    public ResponseEntity<List<WatchlistDto>> getWatchlist() {
        try {
            return ResponseEntity.ok(watchlistService.getWatchlist());
        } catch (Exception ex) {
            // ⛑️ NEVER break frontend rendering
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}
