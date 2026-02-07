package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import com.vaultcore.vaultcore_financial.User.Service.UserService;
import com.vaultcore.vaultcore_financial.User.dto.AccountResponseDto;
import com.vaultcore.vaultcore_financial.User.dto.CreateAccountRequestDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    public AccountController(
            AccountService accountService,
            UserService userService
    ) {
        this.accountService = accountService;
        this.userService = userService;
    }

    /* ---------------- CREATE ACCOUNT ---------------- */

    @PostMapping("/create")
    public AccountResponseDto createAccount(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateAccountRequestDto request
    ) {
        User user = userService.getOrCreateUser(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("name")
        );

        Account account = accountService.createAccount(
                user,
                request.getPin(),
                request.getPhone(),
                request.getAge()
        );

        return AccountResponseDto.from(account);
    }


    /* ---------------- GET ACCOUNT ---------------- */

    @GetMapping("/me")
    public AccountResponseDto getMyAccount(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        return AccountResponseDto.from(account);
    }

    /* ---------------- UPDATE NICKNAME ---------------- */

    @PutMapping("/nickname")
    public AccountResponseDto updateNickname(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String nickname
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        return AccountResponseDto.from(
                accountService.updateNickname(account, nickname)
        );
    }

    /* ---------------- UPDATE DAILY LIMIT ---------------- */

    @PutMapping("/daily-limit")
    public AccountResponseDto updateDailyLimit(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam BigDecimal limit
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        return AccountResponseDto.from(
                accountService.updateDailyLimit(account, limit)
        );
    }

    /* ---------------- FREEZE / UNFREEZE ---------------- */

    @PutMapping("/freeze")
    public AccountResponseDto freezeAccount(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        return AccountResponseDto.from(
                accountService.freezeAccount(account)
        );
    }

    @PutMapping("/unfreeze")
    public AccountResponseDto unfreezeAccount(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Account account =
                accountService.getAccountForUser(jwt.getSubject());

        return AccountResponseDto.from(
                accountService.unfreezeAccount(account)
        );
    }
}
