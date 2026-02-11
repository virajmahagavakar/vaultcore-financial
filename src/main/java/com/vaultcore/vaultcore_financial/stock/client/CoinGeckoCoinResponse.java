package com.vaultcore.vaultcore_financial.stock.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class CoinGeckoCoinResponse {

    public String id;
    public String symbol;
    public String name;

    public Image image;

    @JsonProperty("market_data")
    public MarketData marketData;

    @JsonProperty("last_updated")
    public String lastUpdated;

    public static class Image {
        public String large;
    }

    public static class MarketData {

        @JsonProperty("current_price")
        public Price currentPrice;

        @JsonProperty("market_cap")
        public Price marketCap;

        @JsonProperty("fully_diluted_valuation")
        public Price fullyDilutedValuation;

        @JsonProperty("total_volume")
        public Price totalVolume;

        @JsonProperty("circulating_supply")
        public BigDecimal circulatingSupply;

        @JsonProperty("total_supply")
        public BigDecimal totalSupply;

        @JsonProperty("max_supply")
        public BigDecimal maxSupply;

        @JsonProperty("high_24h")
        public Price high24h;

        @JsonProperty("low_24h")
        public Price low24h;

        @JsonProperty("price_change_percentage_24h")
        public BigDecimal priceChangePercentage24h;

        public Price ath;
        public Price atl;

        @JsonProperty("ath_change_percentage")
        public Price athChangePercentage;

        @JsonProperty("atl_change_percentage")
        public Price atlChangePercentage;

        @JsonProperty("ath_date")
        public Date athDate;

        @JsonProperty("atl_date")
        public Date atlDate;
    }

    public static class Price {
        public BigDecimal usd;
    }

    public static class Date {
        public String usd;
    }
}
