package com.vaultcore.vaultcore_financial.stock.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class MarketCoinDetailDto {

    private String id;
    private String symbol;
    private String name;
    private String image;

    private BigDecimal currentPrice;

    private BigDecimal marketCap;
    private BigDecimal fullyDilutedValuation;
    private BigDecimal totalVolume;

    private BigDecimal circulatingSupply;
    private BigDecimal totalSupply;
    private BigDecimal maxSupply;

    private BigDecimal ath;
    private BigDecimal athChangePercentage;
    private Instant athDate;

    private BigDecimal atl;
    private BigDecimal atlChangePercentage;
    private Instant atlDate;

    private Instant lastUpdated;

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

    public BigDecimal getMarketCap() { return marketCap; }
    public void setMarketCap(BigDecimal marketCap) { this.marketCap = marketCap; }

    public BigDecimal getFullyDilutedValuation() { return fullyDilutedValuation; }
    public void setFullyDilutedValuation(BigDecimal fullyDilutedValuation) {
        this.fullyDilutedValuation = fullyDilutedValuation;
    }

    public BigDecimal getTotalVolume() { return totalVolume; }
    public void setTotalVolume(BigDecimal totalVolume) { this.totalVolume = totalVolume; }

    public BigDecimal getCirculatingSupply() { return circulatingSupply; }
    public void setCirculatingSupply(BigDecimal circulatingSupply) {
        this.circulatingSupply = circulatingSupply;
    }

    public BigDecimal getTotalSupply() { return totalSupply; }
    public void setTotalSupply(BigDecimal totalSupply) { this.totalSupply = totalSupply; }

    public BigDecimal getMaxSupply() { return maxSupply; }
    public void setMaxSupply(BigDecimal maxSupply) { this.maxSupply = maxSupply; }

    public BigDecimal getAth() { return ath; }
    public void setAth(BigDecimal ath) { this.ath = ath; }

    public BigDecimal getAthChangePercentage() { return athChangePercentage; }
    public void setAthChangePercentage(BigDecimal athChangePercentage) {
        this.athChangePercentage = athChangePercentage;
    }

    public Instant getAthDate() { return athDate; }
    public void setAthDate(Instant athDate) { this.athDate = athDate; }

    public BigDecimal getAtl() { return atl; }
    public void setAtl(BigDecimal atl) { this.atl = atl; }

    public BigDecimal getAtlChangePercentage() { return atlChangePercentage; }
    public void setAtlChangePercentage(BigDecimal atlChangePercentage) {
        this.atlChangePercentage = atlChangePercentage;
    }

    public Instant getAtlDate() { return atlDate; }
    public void setAtlDate(Instant atlDate) { this.atlDate = atlDate; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
}
