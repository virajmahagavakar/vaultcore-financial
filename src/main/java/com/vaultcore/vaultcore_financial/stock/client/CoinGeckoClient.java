package com.vaultcore.vaultcore_financial.stock.client;

import com.vaultcore.vaultcore_financial.stock.dto.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class CoinGeckoClient {

    private final WebClient webClient;

    public CoinGeckoClient(WebClient coinGeckoWebClient) {
        this.webClient = coinGeckoWebClient;
    }

    /* =========================
       MARKET LIST (Dashboard)
       ========================= */
    @Cacheable(value = "marketCoins", unless = "#result == null")
    public List<MarketCoinDto> getMarketCoins() {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/coins/markets")
                            .queryParam("vs_currency", "usd")
                            .queryParam("order", "market_cap_desc")
                            .queryParam("per_page", 50)
                            .queryParam("page", 1)
                            .queryParam("sparkline", false)
                            .build())
                    .retrieve()
                    .bodyToFlux(MarketCoinDto.class)
                    .collectList()
                    .block();
        } catch (WebClientResponseException.TooManyRequests ex) {
            throw rateLimitException();
        }
    }

    /* =========================
       COIN DETAILS (single coin)
       ========================= */
    @Cacheable(value = "coinDetails", key = "#coinId", unless = "#result == null")
    public MarketCoinDetailDto getCoinDetails(String coinId) {
        try {
            CoinGeckoCoinResponse response = webClient.get()
                    .uri("/coins/{id}", coinId)
                    .retrieve()
                    .bodyToMono(CoinGeckoCoinResponse.class)
                    .block();

            if (response == null) return null;
            return mapToDetailDto(response);

        } catch (WebClientResponseException.TooManyRequests ex) {
            throw rateLimitException();
        }
    }

    /* =========================
       🔥 BATCH CURRENT PRICES
       ========================= */
    public Map<String, BigDecimal> getCurrentPrices(Set<String> coinIds) {

        if (coinIds == null || coinIds.isEmpty()) {
            return Map.of();
        }

        try {
            String ids = String.join(",", coinIds);

            Map<String, Map<String, Double>> response =
                    webClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/simple/price")
                                    .queryParam("ids", ids)
                                    .queryParam("vs_currencies", "usd")
                                    .build())
                            .retrieve()
                            .bodyToMono(Map.class)
                            .block();

            if (response == null) return Map.of();

            Map<String, BigDecimal> prices = new HashMap<>();

            for (String coinId : coinIds) {
                Double price = Optional.ofNullable(response.get(coinId))
                        .map(m -> m.get("usd"))
                        .orElse(null);

                prices.put(
                        coinId,
                        price != null ? BigDecimal.valueOf(price) : null
                );
            }

            return prices;

        } catch (WebClientResponseException.TooManyRequests ex) {
            throw rateLimitException();
        }
    }

    /* =========================
       LEGACY SINGLE PRICE (SAFE)
       ========================= */
    public BigDecimal getCurrentPrice(String coinId) {
        try {
            Map<String, BigDecimal> prices =
                    getCurrentPrices(Set.of(coinId));
            return prices.get(coinId);
        } catch (Exception ex) {
            return null;
        }
    }

    /* =========================
       PRICE CHART
       ========================= */
    @Cacheable(value = "coinCharts", key = "#coinId + ':' + #days")
    public MarketChartDto getMarketChart(String coinId, int days) {
        try {
            CoinGeckoChartResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/coins/{id}/market_chart")
                            .queryParam("vs_currency", "usd")
                            .queryParam("days", days)
                            .build(coinId))
                    .retrieve()
                    .bodyToMono(CoinGeckoChartResponse.class)
                    .block();

            MarketChartDto dto = new MarketChartDto();
            dto.setCoinId(coinId);

            if (response == null || response.prices == null) {
                dto.setPrices(List.of());
                return dto;
            }

            dto.setPrices(
                    response.prices.stream()
                            .filter(p -> p.size() >= 2)
                            .map(p -> new ChartPointDto(
                                    p.get(0).longValue(),
                                    BigDecimal.valueOf(p.get(1).doubleValue())
                            ))
                            .collect(Collectors.toList())
            );

            return dto;

        } catch (WebClientResponseException.TooManyRequests ex) {
            throw rateLimitException();
        }
    }

    /* =========================
       INTERNAL HELPERS
       ========================= */
    private ResponseStatusException rateLimitException() {
        return new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Market data temporarily unavailable. Please try again later."
        );
    }

    private MarketCoinDetailDto mapToDetailDto(CoinGeckoCoinResponse r) {
        MarketCoinDetailDto dto = new MarketCoinDetailDto();

        dto.setId(r.id);
        dto.setSymbol(r.symbol);
        dto.setName(r.name);
        dto.setImage(r.image != null ? r.image.large : null);

        if (r.marketData != null) {
            dto.setCurrentPrice(
                    r.marketData.currentPrice != null ? r.marketData.currentPrice.usd : null
            );
            dto.setMarketCap(
                    r.marketData.marketCap != null ? r.marketData.marketCap.usd : null
            );
            dto.setFullyDilutedValuation(
                    r.marketData.fullyDilutedValuation != null
                            ? r.marketData.fullyDilutedValuation.usd
                            : null
            );
            dto.setTotalVolume(
                    r.marketData.totalVolume != null ? r.marketData.totalVolume.usd : null
            );

            dto.setCirculatingSupply(r.marketData.circulatingSupply);
            dto.setTotalSupply(r.marketData.totalSupply);
            dto.setMaxSupply(r.marketData.maxSupply);

            if (r.marketData.ath != null)
                dto.setAth(r.marketData.ath.usd);

            if (r.marketData.athChangePercentage != null)
                dto.setAthChangePercentage(r.marketData.athChangePercentage.usd);

            if (r.marketData.athDate != null && r.marketData.athDate.usd != null)
                dto.setAthDate(Instant.parse(r.marketData.athDate.usd));

            if (r.marketData.atl != null)
                dto.setAtl(r.marketData.atl.usd);

            if (r.marketData.atlChangePercentage != null)
                dto.setAtlChangePercentage(r.marketData.atlChangePercentage.usd);

            if (r.marketData.atlDate != null && r.marketData.atlDate.usd != null)
                dto.setAtlDate(Instant.parse(r.marketData.atlDate.usd));
        }

        if (r.lastUpdated != null) {
            dto.setLastUpdated(Instant.parse(r.lastUpdated));
        }

        return dto;
    }
}
