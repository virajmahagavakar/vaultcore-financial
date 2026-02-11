package com.vaultcore.vaultcore_financial.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryDto {
    private long totalUsers;
    private long activeUsers;
    private long newUsers24h;
    private long totalTransactions24h;
    private long failedTransactions;
}
