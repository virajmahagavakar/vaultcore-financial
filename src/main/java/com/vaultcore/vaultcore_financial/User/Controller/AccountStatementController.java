package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Service.AccountStatementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/account/statements")
public class AccountStatementController {

    private final AccountStatementService statementService;

    public AccountStatementController(
            AccountStatementService statementService
    ) {
        this.statementService = statementService;
    }

    @GetMapping("/total-debit")
    public ResponseEntity<BigDecimal> getTotalDebit(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                statementService.getTotalDebit(jwt.getSubject())
        );
    }

    @GetMapping("/total-credit")
    public ResponseEntity<BigDecimal> getTotalCredit(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                statementService.getTotalCredit(jwt.getSubject())
        );
    }
}

