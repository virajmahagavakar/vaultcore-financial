package com.vaultcore.vaultcore_financial.stock.client;

import java.math.BigDecimal;
import java.util.Map;

class CoinGeckoCoinResponse {
    String id;
    String symbol;
    String name;
    Image image;
    MarketData marketData;
    String lastUpdated;

    static class Image {
        String large;
    }

    static class MarketData {
        Price currentPrice;
        Price marketCap;
        Price fullyDilutedValuation;
        Price totalVolume;

        BigDecimal circulatingSupply;
        BigDecimal totalSupply;
        BigDecimal maxSupply;

        Price ath;
        Price atl;

        Price athChangePercentage;
        Price atlChangePercentage;

        Date athDate;
        Date atlDate;
    }

    static class Price {
        BigDecimal usd;
    }

    static class Date {
        String usd;
    }
}
