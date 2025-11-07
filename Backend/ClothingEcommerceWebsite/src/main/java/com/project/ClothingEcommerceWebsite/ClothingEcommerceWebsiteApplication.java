package com.project.ClothingEcommerceWebsite;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ClothingEcommerceWebsiteApplication {
	public static void main(String[] args) {
		SpringApplication.run(ClothingEcommerceWebsiteApplication.class, args);
	}

}

