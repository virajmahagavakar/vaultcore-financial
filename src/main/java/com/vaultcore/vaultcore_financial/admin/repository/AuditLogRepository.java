package com.vaultcore.vaultcore_financial.admin.repository;

import com.vaultcore.vaultcore_financial.admin.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    // Add custom query methods if needed
}
