package com.vaultcore.vaultcore_financial.User.Service;


import com.vaultcore.vaultcore_financial.User.Entity.Account;
import org.springframework.stereotype.Service;

@Service
public class AccountSecurityService {

    public void verifyPin(Account account, String pin) {
        if (!account.getPin().equals(pin)) {
            throw new SecurityException("Invalid PIN");
        }
    }

    public void ensureAccountActive(Account account) {
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalStateException("Account is not active");
        }
    }

    public void changePin(Account account, String oldPin, String newPin) {
        if (!account.getPin().equals(oldPin)) {
            throw new SecurityException("Old PIN incorrect");
        }
        account.setPin(newPin); // hash later
    }
}

