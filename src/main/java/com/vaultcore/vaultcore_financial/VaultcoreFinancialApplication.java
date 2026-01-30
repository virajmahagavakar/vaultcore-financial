package com.vaultcore.vaultcore_financial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class 	VaultcoreFinancialApplication {

	public static void main(String[] args) {
		SpringApplication.run(VaultcoreFinancialApplication.class, args);
	}

}
