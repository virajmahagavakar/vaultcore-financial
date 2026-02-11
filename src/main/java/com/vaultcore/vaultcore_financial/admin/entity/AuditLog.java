package com.vaultcore.vaultcore_financial.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "admin_id", nullable = false)
    private String adminId; // Keycloak ID of the admin

    @Column(nullable = false)
    private String action; // e.g., "BAN_USER", "VIEW_TRANSACTIONS"

    @Column(name = "target_type")
    private String targetType; // e.g., "USER", "TRANSACTION"

    @Column(name = "target_id")
    private String targetId; // ID of the user or transaction afected

    @Column(columnDefinition = "TEXT")
    private String details; // JSON or text details of the change

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
