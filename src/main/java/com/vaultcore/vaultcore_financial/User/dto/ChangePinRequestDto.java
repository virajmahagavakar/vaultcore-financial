package com.vaultcore.vaultcore_financial.User.dto;

import jakarta.validation.constraints.NotBlank;

public class ChangePinRequestDto {

    @NotBlank
    private String oldPin;

    @NotBlank
    private String newPin;

    public String getOldPin() {
        return oldPin;
    }

    public String getNewPin() {
        return newPin;
    }
}
