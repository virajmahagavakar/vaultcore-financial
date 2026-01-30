package com.vaultcore.vaultcore_financial.stock.dto;

import java.math.BigDecimal;

public class MarketCoinDto {

    private String id;
    private String symbol;
    private String name;
    private String image;

    private BigDecimal currentPrice;
    private BigDecimal priceChange24h;
    private BigDecimal priceChangePercentage24h;

    private BigDecimal marketCap;
    private Integer marketCapRank;
    private BigDecimal totalVolume;

    private BigDecimal high24h;
    private BigDecimal low24h;

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public BigDecimal getPriceChange24h() { return priceChange24h; }
    public void setPriceChange24h(BigDecimal priceChange24h) { this.priceChange24h = priceChange24h; }

    public BigDecimal getPriceChangePercentage24h() { return priceChangePercentage24h; }
    public void setPriceChangePercentage24h(BigDecimal priceChangePercentage24h) {
        this.priceChangePercentage24h = priceChangePercentage24h;
    }

    public BigDecimal getMarketCap() { return marketCap; }
    public void setMarketCap(BigDecimal marketCap) { this.marketCap = marketCap; }

    public Integer getMarketCapRank() { return marketCapRank; }
    public void setMarketCapRank(Integer marketCapRank) { this.marketCapRank = marketCapRank; }

    public BigDecimal getTotalVolume() { return totalVolume; }
    public void setTotalVolume(BigDecimal totalVolume) { this.totalVolume = totalVolume; }

    public BigDecimal getHigh24h() { return high24h; }
    public void setHigh24h(BigDecimal high24h) { this.high24h = high24h; }

    public BigDecimal getLow24h() { return low24h; }
    public void setLow24h(BigDecimal low24h) { this.low24h = low24h; }
}
