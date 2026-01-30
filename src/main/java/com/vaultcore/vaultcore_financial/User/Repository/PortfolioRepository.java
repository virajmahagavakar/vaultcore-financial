package com.vaultcore.vaultcore_financial.User.Repository;

import com.vaultcore.vaultcore_financial.User.Entity.Portfolio;
import com.vaultcore.vaultcore_financial.User.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUser(User user);
}
