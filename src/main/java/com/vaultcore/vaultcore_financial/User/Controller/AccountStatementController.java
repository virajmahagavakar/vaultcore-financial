package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Service.AccountStatementService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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

    /* ---------------- DASHBOARD TOTALS ---------------- */

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

    /* ---------------- MONTHLY PDF DOWNLOAD ---------------- */

    @GetMapping(
            value = "/monthly-pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> downloadMonthlyStatement(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam int month,
            @RequestParam int year
    ) {

        byte[] pdf =
                statementService.generateMonthlyStatementPdf(
                        jwt.getSubject(),
                        month,
                        year
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=VaultCore-Statement-" + month + "-" + year + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
