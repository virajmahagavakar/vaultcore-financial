package com.vaultcore.vaultcore_financial.Service;

import com.vaultcore.vaultcore_financial.Entity.Account;
import com.vaultcore.vaultcore_financial.Entity.User;
import com.vaultcore.vaultcore_financial.Repository.AccountRepository;
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

    public Account getAccountForUser(String keycloakUserId) {
        return accountRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new AccountNotFoundException("Account not created yet"));
    }


    public Account createAccount(User user, String pin) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setUser(user);
        account.setKeycloakUserId(user.getKeycloakId());
        account.setAccountNumber("VC-" + System.currentTimeMillis());
        account.setBalance(BigDecimal.ZERO);
        account.setPin(pin); // ideally hashed
        account.setNickname("My Account");
        account.setNotificationPreference("EMAIL");
        account.setDailyLimit(BigDecimal.valueOf(10000));
        account.setStatus("ACTIVE");

        return accountRepository.save(account);
    }

    public BigDecimal getBalance(Account account) {
        return account.getBalance();
    }

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

    public boolean verifyPin(Account account, String pin) {
        return account.getPin().equals(pin); // in real app, use hash comparison
    }
}
