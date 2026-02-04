package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class NotificationService {

    public void sendTransactionAlert(
            Account account,
            BigDecimal amount,
            String type
    ) {
        // Later: email / push
        System.out.println(
                "Notification: " + type + " of " + amount +
                        " for account " + account.getAccountNumber()
        );
    }

    public void sendLowBalanceAlert(Account account) {
        System.out.println(
                "Low balance alert for " + account.getAccountNumber()
        );
    }
}

