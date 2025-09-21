package com.personalphotomap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * PhotoMapApplication
 *
 * Main entry point of the Personal Photo Map application.
 *
 * Responsibilities:
 * - Bootstraps the Spring Boot application.
 * - Enables asynchronous method execution via @EnableAsync.
 *
 * This class is executed when the application starts, initializing all configured beans and services.
 */

@SpringBootApplication
@EnableAsync
public class PhotoMapApplication {
    public static void main(String[] args) {
        SpringApplication.run(PhotoMapApplication.class, args);
    }
}
