package com.vaultcore.vaultcore_financial.stock.dto;

public class SellRequest {

    private String coinId;
    private int quantity;

    public String getCoinId() {
        return coinId;
    }
    public void setCoinId(String coinId) {
        this.coinId = coinId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
