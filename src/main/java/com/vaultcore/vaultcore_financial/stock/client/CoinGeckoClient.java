package com.vaultcore.vaultcore_financial.stock.client;

import com.vaultcore.vaultcore_financial.stock.dto.MarketChartDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDetailDto;
import com.vaultcore.vaultcore_financial.stock.dto.MarketCoinDto;
import com.vaultcore.vaultcore_financial.stock.dto.ChartPointDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
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
    public List<MarketCoinDto> getMarketCoins() {
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
    }

    /* =========================
       COIN DETAILS PAGE
       ========================= */
    public MarketCoinDetailDto getCoinDetails(String coinId) {
        return webClient.get()
                .uri("/coins/{id}", coinId)
                .retrieve()
                .bodyToMono(CoinGeckoCoinResponse.class)
                .map(this::mapToDetailDto)
                .block();
    }

    /* =========================
       PRICE CHART
       ========================= */
    public MarketChartDto getMarketChart(String coinId, int days) {
        CoinGeckoChartResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/coins/{id}/market_chart")
                        .queryParam("vs_currency", "usd")
                        .queryParam("days", days)
                        .build(coinId))
                .retrieve()
                .bodyToMono(CoinGeckoChartResponse.class)
                .block();

        List<ChartPointDto> points = response.prices.stream()
                .map(p -> new ChartPointDto(
                        p.get(0).longValue(),
                        BigDecimal.valueOf(p.get(1))
                ))
                .collect(Collectors.toList());

        MarketChartDto dto = new MarketChartDto();
        dto.setCoinId(coinId);
        dto.setPrices(points);
        return dto;
    }

    /* =========================
       INTERNAL MAPPING
       ========================= */
    private MarketCoinDetailDto mapToDetailDto(CoinGeckoCoinResponse r) {
        MarketCoinDetailDto dto = new MarketCoinDetailDto();

        dto.setId(r.id);
        dto.setSymbol(r.symbol);
        dto.setName(r.name);
        dto.setImage(r.image.large);

        dto.setCurrentPrice(r.marketData.currentPrice.usd);
        dto.setMarketCap(r.marketData.marketCap.usd);
        dto.setFullyDilutedValuation(r.marketData.fullyDilutedValuation.usd);
        dto.setTotalVolume(r.marketData.totalVolume.usd);

        dto.setCirculatingSupply(r.marketData.circulatingSupply);
        dto.setTotalSupply(r.marketData.totalSupply);
        dto.setMaxSupply(r.marketData.maxSupply);

        dto.setAth(r.marketData.ath.usd);
        dto.setAthChangePercentage(r.marketData.athChangePercentage.usd);
        dto.setAthDate(Instant.parse(r.marketData.athDate.usd));

        dto.setAtl(r.marketData.atl.usd);
        dto.setAtlChangePercentage(r.marketData.atlChangePercentage.usd);
        dto.setAtlDate(Instant.parse(r.marketData.atlDate.usd));

        dto.setLastUpdated(Instant.parse(r.lastUpdated));

        return dto;
    }
}
