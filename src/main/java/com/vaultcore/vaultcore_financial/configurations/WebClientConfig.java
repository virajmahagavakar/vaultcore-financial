package com.vaultcore.vaultcore_financial.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient coinGeckoWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.coingecko.com/api/v3")
                .defaultHeader("Accept", "application/json")
                .build();
    }
}
