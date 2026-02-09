package com.vaultcore.vaultcore_financial.stock.dto;

public class TradeResponse {

    private String coinId;
    private String tradeType;
    private int quantity;
    private double price;
    private String message;

    public TradeResponse(
            String coinId,
            String tradeType,
            int quantity,
            double price,
            String message
    ) {
        this.coinId = coinId;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.price = price;
        this.message = message;
    }

    public String getCoinId() {
        return coinId;
    }

    public String getTradeType() {
        return tradeType;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getPrice() {
        return price;
    }

    public String getMessage() {
        return message;
    }
}
