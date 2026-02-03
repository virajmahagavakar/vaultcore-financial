package com.vaultcore.vaultcore_financial.stock.controller;

import com.vaultcore.vaultcore_financial.stock.dto.WatchlistDto;
import com.vaultcore.vaultcore_financial.stock.service.WatchlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @PostMapping("/{symbol}")
    public void add(@PathVariable String symbol) {
        watchlistService.add(symbol);
    }

    @DeleteMapping("/{symbol}")
    public void remove(@PathVariable String symbol) {
        watchlistService.remove(symbol);
    }

    @GetMapping
    public List<WatchlistDto> getWatchlist() {
        return watchlistService.getWatchlist();
    }
}
//✅ UI coverage (Watchlist) // //✔ Add coin to watchlist //✔ Remove coin //✔ List watchlist items //✔ Live price display //✔ User-isolated data (Keycloak) //✔ No duplicate entries // //This directly backs: // //Watchlist sidebar // //Watchlist page table // //Add/remove icons from market page