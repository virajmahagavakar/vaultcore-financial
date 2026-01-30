package com.vaultcore.vaultcore_financial.User.Controller;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import com.vaultcore.vaultcore_financial.User.Service.UserService;
import com.vaultcore.vaultcore_financial.keycloak.config.SecurityUtil;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
@Controller
@RestController
@RequestMapping("/api/user/accounts")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    public AccountController(AccountService accountService, UserService userService) {
        this.accountService = accountService;
        this.userService = userService;
    }

    // ------------------- Get Balance -------------------
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/balance")
    public BigDecimal getBalance() {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return account.getBalance();
    }

    // ------------------- Create Account -------------------
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/create")
    public Account createAccount(@RequestParam String pin) {
        var user = userService.getOrCreateUser(
                SecurityUtil.getKeycloakUserId(),
                SecurityUtil.getEmail(),
                SecurityUtil.getName()
        );
        return accountService.createAccount(user, pin);
    }

    // ------------------- Update Nickname -------------------
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/nickname")
    public Account updateNickname(@RequestParam String nickname) {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return accountService.updateNickname(account, nickname);
    }

    // ------------------- Update Notification Preference -------------------
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/notifications")
    public Account updateNotifications(@RequestParam String preference) {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return accountService.updateNotificationPreference(account, preference);
    }

    // ------------------- Update Daily Limit -------------------
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/daily-limit")
    public Account updateDailyLimit(@RequestParam BigDecimal limit) {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return accountService.updateDailyLimit(account, limit);
    }

    // ------------------- Freeze Account -------------------
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/freeze")
    public Account freezeAccount() {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return accountService.freezeAccount(account);
    }

    // ------------------- Unfreeze Account -------------------
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/unfreeze")
    public Account unfreezeAccount() {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return accountService.unfreezeAccount(account);
    }

    // ------------------- Verify PIN -------------------
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/verify-pin")
    public boolean verifyPin(@RequestParam String pin) {
        String keycloakUserId = String.valueOf(SecurityUtil.getKeycloakUserId());
        Account account = accountService.getAccountForUser(keycloakUserId);
        return accountService.verifyPin(account, pin);
    }
}
