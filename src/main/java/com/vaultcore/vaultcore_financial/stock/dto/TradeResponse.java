package com.vaultcore.vaultcore_financial.stock.dto;

public class TradeResponse {

    private String symbol;
    private String tradeType;
    private Double quantity;
    private Double price;
    private String message;

    public TradeResponse() {
    }

    public TradeResponse(
            String symbol,
            String tradeType,
            Double quantity,
            Double price,
            String message
    ) {
        this.symbol = symbol;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.price = price;
        this.message = message;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getTradeType() {
        return tradeType;
    }

    public Double getQuantity() {
        return quantity;
    }

    public Double getPrice() {
        return price;
    }

    public String getMessage() {
        return message;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public void setTradeType(String tradeType) {
        this.tradeType = tradeType;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

