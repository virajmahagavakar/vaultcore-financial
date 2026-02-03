package com.vaultcore.vaultcore_financial.stock.controller;
import com.vaultcore.vaultcore_financial.stock.dto.DepositRequest;
import com.vaultcore.vaultcore_financial.stock.dto.WalletResponse;
import com.vaultcore.vaultcore_financial.stock.dto.WithdrawRequest;
import com.vaultcore.vaultcore_financial.stock.service.WalletService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public WalletResponse wallet() {
        return walletService.getWallet();
    }

    @PostMapping("/deposit")
    public WalletResponse deposit(@RequestBody DepositRequest request) {
        return walletService.deposit(request);
    }

    @PostMapping("/withdraw")
    public WalletResponse withdraw(@RequestBody WithdrawRequest request) {
        return walletService.withdraw(request);
    }
}

//✅ UI FEATURES NOW BACKED (Wallet / Banking)
//
//✔ Wallet balance
//✔ Deposit
//✔ Withdraw
//✔ Balance validation
//✔ User-specific wallet
//✔ Transaction-safe
//✔ Ready to integrate with BUY/SELL debit/credit