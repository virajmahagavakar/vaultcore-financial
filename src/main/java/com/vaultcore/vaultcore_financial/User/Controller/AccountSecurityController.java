package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Service.AccountSecurityService;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account/security")
public class AccountSecurityController {

    private final AccountService accountService;
    private final AccountSecurityService securityService;

    public AccountSecurityController(
            AccountService accountService,
            AccountSecurityService securityService
    ) {
        this.accountService = accountService;
        this.securityService = securityService;
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<String> verifyPin(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String pin
    ) {
        Account account = accountService
                .getAccountForUser(jwt.getSubject());

        securityService.verifyPin(account, pin);

        return ResponseEntity.ok("PIN verified");
    }

    @PutMapping("/change-pin")
    public ResponseEntity<String> changePin(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String oldPin,
            @RequestParam String newPin
    ) {
        Account account = accountService
                .getAccountForUser(jwt.getSubject());

        securityService.changePin(account, oldPin, newPin);

        return ResponseEntity.ok("PIN changed successfully");
    }
}
