package com.vaultcore.vaultcore_financial.stock.service;


import com.vaultcore.vaultcore_financial.stock.dto.DepositRequest;
import com.vaultcore.vaultcore_financial.stock.dto.WalletResponse;
import com.vaultcore.vaultcore_financial.stock.dto.WithdrawRequest;
import com.vaultcore.vaultcore_financial.stock.entity.Wallet;
import com.vaultcore.vaultcore_financial.stock.repository.WalletRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    private String getUserId() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    private Wallet getOrCreateWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet wallet = new Wallet();
                    wallet.setUserId(userId);
                    wallet.setBalance(0.0);
                    return walletRepository.save(wallet);
                });
    }

    public WalletResponse getWallet() {
        Wallet wallet = getOrCreateWallet(getUserId());
        return new WalletResponse(wallet.getBalance());
    }

    @Transactional
    public WalletResponse deposit(DepositRequest request) {
        Wallet wallet = getOrCreateWallet(getUserId());
        wallet.setBalance(wallet.getBalance() + request.getAmount());
        walletRepository.save(wallet);
        return new WalletResponse(wallet.getBalance());
    }

    @Transactional
    public WalletResponse withdraw(WithdrawRequest request) {
        Wallet wallet = getOrCreateWallet(getUserId());

        if (wallet.getBalance() < request.getAmount()) {
            throw new IllegalStateException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance() - request.getAmount());
        walletRepository.save(wallet);
        return new WalletResponse(wallet.getBalance());
    }

    /* ===== INTERNAL (TRADE) ===== */

    @Transactional
    public void debit(Double amount) {
        Wallet wallet = getOrCreateWallet(getUserId());

        if (wallet.getBalance() < amount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);
    }

    @Transactional
    public void credit(Double amount) {
        Wallet wallet = getOrCreateWallet(getUserId());
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);
    }
}
