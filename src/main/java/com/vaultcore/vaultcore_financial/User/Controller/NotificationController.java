package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import com.vaultcore.vaultcore_financial.User.Service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AccountService accountService;

    public NotificationController(
            NotificationService notificationService,
            AccountService accountService
    ) {
        this.notificationService = notificationService;
        this.accountService = accountService;
    }

    @PostMapping("/test-transaction-alert")
    public ResponseEntity<String> sendTestNotification(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Account account = accountService
                .getAccountForUser(jwt.getSubject());

        notificationService.sendTransactionAlert(
                account,
                BigDecimal.valueOf(100),
                "TEST"
        );

        return ResponseEntity.ok("Notification sent");
    }
}

