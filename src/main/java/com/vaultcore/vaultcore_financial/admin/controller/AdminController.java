package com.vaultcore.vaultcore_financial.admin.controller;

import com.vaultcore.vaultcore_financial.User.Entity.Transaction;
import com.vaultcore.vaultcore_financial.User.Entity.User;
import com.vaultcore.vaultcore_financial.admin.dto.DashboardSummaryDto;
import com.vaultcore.vaultcore_financial.admin.dto.TradingStatsDto;
import com.vaultcore.vaultcore_financial.admin.service.AdminService;
import com.vaultcore.vaultcore_financial.admin.service.ExportService;
import com.vaultcore.vaultcore_financial.admin.service.TradingOversightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminService adminService;
    private final ExportService exportService;
    private final TradingOversightService tradingOversightService;

    // 1. Dashboard
    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    // 2. User Management
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String status = payload.get("status");
        if (status == null || (!status.equals("ACTIVE") && !status.equals("BANNED"))) {
            return ResponseEntity.badRequest().body("Invalid status. Must be ACTIVE or BANNED");
        }

        String adminId = authentication.getName();
        adminService.updateUserStatus(id, status, adminId);
        return ResponseEntity.ok().build();
    }

    // 3. Reporting
    @GetMapping("/reports/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAuditLogs(@RequestParam(defaultValue = "pdf") String format) {
        try {
            var logs = adminService.getAllAuditLogs();
            byte[] data;
            String contentType;
            String filename;

            if ("csv".equalsIgnoreCase(format)) {
                data = exportService.exportAuditLogsToCsv(logs);
                contentType = "text/csv";
                filename = "audit_logs.csv";
            } else {
                data = exportService.exportAuditLogsToPdf(logs);
                contentType = "application/pdf";
                filename = "audit_logs.pdf";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/reports/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportTransactions(@RequestParam(defaultValue = "pdf") String format) {
        try {
            var transactions = adminService.getAllTransactions();
            byte[] data;
            String contentType;
            String filename;

            if ("csv".equalsIgnoreCase(format)) {
                data = exportService.exportTransactionsToCsv(transactions);
                contentType = "text/csv";
                filename = "transactions.csv";
            } else {
                data = exportService.exportTransactionsToPdf(transactions);
                contentType = "application/pdf";
                filename = "transactions.pdf";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 4. Trading Oversight
    @GetMapping("/trading/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TradingStatsDto> getTradingStats() {
        return ResponseEntity.ok(tradingOversightService.getTradingStats());
    }

    // 5. Fraud Management
    @GetMapping("/fraud/flagged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getFlaggedTransactions() {
        return ResponseEntity.ok(adminService.getFlaggedTransactions());
    }

    @PutMapping("/fraud/{id}/flag")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setTransactionFlag(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> payload,
            Authentication authentication) {
        Boolean isFlagged = payload.get("isFlagged");
        if (isFlagged == null) {
            return ResponseEntity.badRequest().body("isFlagged is required");
        }

        String adminId = authentication.getName();
        adminService.setTransactionFlag(id, isFlagged, adminId);
        return ResponseEntity.ok().build();
    }
}
