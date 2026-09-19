package com.railgo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RailGoApplication {

    public static void main(String[] args) {
        SpringApplication.run(RailGoApplication.class, args);
    }
}
