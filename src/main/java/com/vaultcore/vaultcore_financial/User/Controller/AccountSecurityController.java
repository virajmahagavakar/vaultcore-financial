package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Service.AccountSecurityService;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import com.vaultcore.vaultcore_financial.User.dto.ChangePinRequestDto;
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

    /* ---------------- VERIFY PIN ---------------- */

    @PostMapping("/verify-pin")
    public ResponseEntity<?> verifyPin(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String pin
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        securityService.verifyPin(account, pin);

        return ResponseEntity.ok(
                java.util.Map.of("message", "PIN verified")
        );
    }

    /* ---------------- CHANGE PIN ---------------- */

    @PutMapping("/change-pin")
    public ResponseEntity<?> changePin(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ChangePinRequestDto request
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        securityService.changePin(
                account,
                request.getOldPin(),
                request.getNewPin()
        );

        return ResponseEntity.ok(
                java.util.Map.of("message", "PIN changed successfully")
        );
    }
}

