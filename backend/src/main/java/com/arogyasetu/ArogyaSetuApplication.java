package com.arogyasetu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ArogyaSetuApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArogyaSetuApplication.class, args);
    }
}
