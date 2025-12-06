package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.ForgotPassWordRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.LoginRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.ResetPasswordRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.MessageResponse;
import com.project.ClothingEcommerceWebsite.exception.NotFoundException;
import com.project.ClothingEcommerceWebsite.exception.UnauthorizedException;
import com.project.ClothingEcommerceWebsite.models.User;
import com.project.ClothingEcommerceWebsite.services.UserService;
import com.project.ClothingEcommerceWebsite.utils.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Autowired
    private final SecurityUtil securityUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        Optional<User> user = userService.getUserByEmail(loginRequest.getEmail());
        if (user.isEmpty()) {
            throw new NotFoundException("Email chưa được đăng ký!!");
        }
        if(user.get().getIsActive() == false) {
            throw new NotFoundException("Email đã được đăng ký. Vui lòng xác thực email qua hộp thư!!");
        }
        try {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword());
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            String accessToken = securityUtil.createAccessToken(authentication);
            String refreshToken = securityUtil.createRefreshToken(authentication);
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(86400)
                    .sameSite("None")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            HashMap<String, Object> map = new HashMap<>();
            map.put("user", user);
            map.put("accesstoken", accessToken);
            return ResponseEntity.ok().body(map);
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }
    }

    @GetMapping("/refresh")
    public ResponseEntity<?> getRefreshToken(@CookieValue(name = "refreshToken") String refreshToken, HttpServletResponse response) {
        Jwt decodeToken = securityUtil.checkValidRefreshToken(refreshToken);
        String email = decodeToken.getSubject();
        User user = userService.getUserByEmail(email).orElseThrow(() -> new NotFoundException("Email not found!"));
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, new java.util.ArrayList<>());

        String newAccessToken = securityUtil.createAccessToken(auth);
        String newRefreshToken = securityUtil.createRefreshToken(auth);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(86400)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        HashMap<String, Object> map = new HashMap<>();
        map.put("user", user);
        map.put("accesstoken", newAccessToken);
        return ResponseEntity.ok().body(map);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserRequest request) {
        String hashPassword = this.passwordEncoder.encode(request.getPassword());
        request.setPassword(hashPassword);
        User newUser = userService.createUser(request);
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie clearAccess = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearAccess.toString())
                .build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPassWordRequest request) {
        MessageResponse response = userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok().body(response);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        MessageResponse response = userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().body(response);
    }
    @GetMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam String token) {
        MessageResponse response = userService.confirmEmail(token);
        return ResponseEntity.ok().body(response);
    }
}
