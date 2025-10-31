package com.project.ClothingEcommerceWebsite.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    private static final long RESET_EXPIRATION = 15 * 60L;
    private static final long CONFIRM_EXPIRATION = 24 * 60 * 60L;

    public String generateResetToken(String email) {
        return generateToken(email, "reset", RESET_EXPIRATION);
    }

    public String generateConfirmToken(String email) {
        return generateToken(email, "confirm", CONFIRM_EXPIRATION);
    }

    private String generateToken(String email, String type, long expirationSeconds) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(email)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expirationSeconds))
                .claim("type", type)
                .build();

        JwsHeader headers = JwsHeader.with(SecurityUtil.JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }

    public boolean validateResetToken(String token) {
        return validateTokenType(token, "reset");
    }

    public boolean validateConfirmToken(String token) {
        return validateTokenType(token, "confirm");
    }

    private boolean validateTokenType(String token, String expectedType) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            String type = jwt.getClaim("type");
            return expectedType.equals(type) && jwt.getExpiresAt().isAfter(Instant.now());
        } catch (JwtException e) {
            System.out.println("⚠ Invalid token: " + e.getMessage());
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getSubject();
        } catch (JwtException e) {
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }
}
