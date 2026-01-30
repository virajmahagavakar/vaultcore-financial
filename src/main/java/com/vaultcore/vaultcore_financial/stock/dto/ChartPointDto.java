package com.vaultcore.vaultcore_financial.stock.dto;

import java.math.BigDecimal;

public class ChartPointDto {

    private long timestamp;
    private BigDecimal price;

    public ChartPointDto(long timestamp, BigDecimal price) {
        this.timestamp = timestamp;
        this.price = price;
    }

    public long getTimestamp() { return timestamp; }
    public BigDecimal getPrice() { return price; }
}
