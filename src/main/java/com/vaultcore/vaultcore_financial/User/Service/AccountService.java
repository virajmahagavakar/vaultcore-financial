package com.vaultcore.vaultcore_financial.User.Service;

import com.vaultcore.vaultcore_financial.User.Entity.Account;
import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.User.Repository.AccountRepository;
import com.vaultcore.vaultcore_financial.exception.AccountNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /* ---------------- LOOKUPS ---------------- */

    public Account getAccountForUser(String keycloakUserId) {
        return accountRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not created for this user"
                        ));
    }

    public Account getAccountByAccountNumber(String accountNumber) {
        return accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with number: " + accountNumber
                        ));
    }

    public boolean accountExistsForUser(String keycloakUserId) {
        return accountRepository.existsByKeycloakUserId(keycloakUserId);
    }

    public Account getAccountById(UUID accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new AccountNotFoundException("Account not found"));
    }

    /* ---------------- CREATE ---------------- */

    @Transactional
    public Account createAccount(
            User user,
            String pin,
            String phone,
            Integer age
    ) {

        if (accountRepository.existsByKeycloakUserId(user.getKeycloakId())) {
            throw new IllegalStateException("User already has an account");
        }

        Account account = new Account();
        account.setUser(user);
        account.setKeycloakUserId(user.getKeycloakId());
        account.setAccountNumber(generateAccountNumber());
        account.setPhone(phone);
        account.setAge(age);
        account.setPin(pin);
        account.setBalance(BigDecimal.ZERO);
        account.setStatus("ACTIVE");
        account.setNickname("My VaultCore Account");

        return accountRepository.save(account);
    }

    /* ---------------- INTERNAL BALANCE OPS ---------------- */
    /* Used by WalletService ONLY */

    @Transactional
    public void debit(String keycloakUserId, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid debit amount");
        }

        Account account = getAccountForUser(keycloakUserId);

        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient bank balance");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
    }

    @Transactional
    public void credit(String keycloakUserId, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid credit amount");
        }

        Account account = getAccountForUser(keycloakUserId);

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
    }

    /* ---------------- UPDATES ---------------- */

    @Transactional
    public Account updateNickname(Account account, String nickname) {
        account.setNickname(nickname);
        return accountRepository.save(account);
    }

    @Transactional
    public Account updateNotificationPreference(Account account, String preference) {
        account.setNotificationPreference(preference);
        return accountRepository.save(account);
    }

    @Transactional
    public Account updateDailyLimit(Account account, BigDecimal limit) {
        account.setDailyLimit(limit);
        return accountRepository.save(account);
    }

    @Transactional
    public Account freezeAccount(Account account) {
        account.freeze();
        return accountRepository.save(account);
    }

    @Transactional
    public Account unfreezeAccount(Account account) {
        account.unfreeze();
        return accountRepository.save(account);
    }

    /* ---------------- HELPERS ---------------- */

    private String generateAccountNumber() {
        return "VC-" + System.currentTimeMillis();
    }
}
