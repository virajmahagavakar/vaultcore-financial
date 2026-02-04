package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class TransactionLimitService {

    public void validateDailyLimit(Account account, BigDecimal amount) {
        if (amount.compareTo(account.getDailyLimit()) > 0) {
            throw new IllegalStateException("Daily transaction limit exceeded");
        }
    }
}
