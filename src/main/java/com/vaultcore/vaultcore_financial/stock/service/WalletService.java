package com.vaultcore.vaultcore_financial.stock.service;

import com.vaultcore.vaultcore_financial.stock.dto.DepositRequest;
import com.vaultcore.vaultcore_financial.stock.dto.WalletResponse;
import com.vaultcore.vaultcore_financial.stock.dto.WithdrawRequest;
import com.vaultcore.vaultcore_financial.stock.entity.Wallet;
import com.vaultcore.vaultcore_financial.stock.entity.WalletTransaction;
import com.vaultcore.vaultcore_financial.stock.repository.WalletRepository;
import com.vaultcore.vaultcore_financial.stock.repository.WalletTransactionRepository;
import com.vaultcore.vaultcore_financial.User.Service.AccountService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTxnRepo;
    private final AccountService accountService;

    public WalletService(
            WalletRepository walletRepository,
            WalletTransactionRepository walletTxnRepo,
            AccountService accountService
    ) {
        this.walletRepository = walletRepository;
        this.walletTxnRepo = walletTxnRepo;
        this.accountService = accountService;
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
                    wallet.setBalance(BigDecimal.ZERO);
                    return walletRepository.save(wallet);
                });
    }

    /* ================= VIEW ================= */

    public WalletResponse getWallet() {
        Wallet wallet = getOrCreateWallet(getUserId());
        return new WalletResponse(wallet.getBalance());
    }

    /* ================= DEPOSIT ================= */

    @Transactional
    public WalletResponse deposit(DepositRequest request) {

        if (request == null || request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid deposit amount");
        }

        String userId = getUserId();
        Wallet wallet = getOrCreateWallet(userId);

        // Debit bank
        accountService.debit(userId, request.getAmount());

        // Credit wallet
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        walletTxnRepo.save(
                WalletTransaction.credit(
                        wallet.getId(),
                        request.getAmount(),
                        "DEPOSIT"
                )
        );

        return new WalletResponse(wallet.getBalance());
    }

    /* ================= WITHDRAW ================= */

    @Transactional
    public WalletResponse withdraw(WithdrawRequest request) {

        if (request == null || request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid withdrawal amount");
        }

        String userId = getUserId();
        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        // Debit wallet
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        // Credit bank
        accountService.credit(userId, request.getAmount());

        walletTxnRepo.save(
                WalletTransaction.debit(
                        wallet.getId(),
                        request.getAmount(),
                        "WITHDRAW"
                )
        );

        return new WalletResponse(wallet.getBalance());
    }

    /* ================= INTERNAL (STOCK) ================= */

    @Transactional
    public void debitForTrade(String userId, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid trade amount");
        }

        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        walletTxnRepo.save(
                WalletTransaction.debit(
                        wallet.getId(),
                        amount,
                        "STOCK_BUY"
                )
        );
    }

    @Transactional
    public void creditForTrade(String userId, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid trade amount");
        }

        Wallet wallet = getOrCreateWallet(userId);

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        walletTxnRepo.save(
                WalletTransaction.credit(
                        wallet.getId(),
                        amount,
                        "STOCK_SELL"
                )
        );
    }
}
