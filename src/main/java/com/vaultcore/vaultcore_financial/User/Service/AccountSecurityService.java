package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Repository.AccountRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountSecurityService {

    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AccountSecurityService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /* ---------------- VERIFY PIN ---------------- */

    public void verifyPin(Account account, String pin) {
        ensureAccountActive(account);

        if (!passwordEncoder.matches(pin, account.getPin())) {
            throw new SecurityException("Invalid PIN");
        }
    }

    /* ---------------- ACCOUNT STATUS ---------------- */

    public void ensureAccountActive(Account account) {
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalStateException("Account is not active");
        }
    }

    /* ---------------- CHANGE PIN ---------------- */

    public void changePin(Account account, String oldPin, String newPin) {
        ensureAccountActive(account);

        if (!passwordEncoder.matches(oldPin, account.getPin())) {
            throw new SecurityException("Old PIN incorrect");
        }

        if (oldPin.equals(newPin)) {
            throw new IllegalArgumentException(
                    "New PIN must be different from old PIN"
            );
        }

        account.setPin(passwordEncoder.encode(newPin));
        accountRepository.save(account); // 🔴 REQUIRED
    }
}
