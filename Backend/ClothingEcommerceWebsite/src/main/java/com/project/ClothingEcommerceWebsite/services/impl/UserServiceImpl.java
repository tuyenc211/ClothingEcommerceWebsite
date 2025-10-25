package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.ChangePasswordRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.ChangeUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.MessageResponse;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.exception.NotFoundException;
import com.project.ClothingEcommerceWebsite.models.Role;
import com.project.ClothingEcommerceWebsite.models.User;
import com.project.ClothingEcommerceWebsite.repositories.RoleRepository;
import com.project.ClothingEcommerceWebsite.repositories.UserRepository;
import com.project.ClothingEcommerceWebsite.services.EmailService;
import com.project.ClothingEcommerceWebsite.services.UserService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final RoleRepository roleRepository;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final EmailService emailService;

    @Override
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Set<Role> roles = new HashSet<>();
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            List<Role> requestedRoles = roleRepository.findAllById(request.getRoleIds());
            if (requestedRoles.isEmpty()) {
                throw new RuntimeException("Invalid role IDs");
            }
            roles.addAll(requestedRoles);
        } else {
            Role customerRole = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Default role CUSTOMER not found"));
            roles.add(customerRole);
        }
        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .password(request.getPassword())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .roles(roles)
                .build();

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void updateUserRoles(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role newRole = roleRepository.findByName(role.getName())
                .orElseThrow(() -> new RuntimeException("Role " + role.getName() + " not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(newRole);
        user.setRoles(roles);
        userRepository.save(user);
    }

    @Override
    public void changeUser(Long id, ChangeUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public void lockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public void unlockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }

//    @Override
//    public MessageResponse forgotPassword(String email) {
//        User user = userRepository.findByEmail(email).orElseThrow(() -> new ChangeSetPersister.NotFoundException("Not found user"));
//        String token = jwtUtils.generateResetToken(user.getEmail());
//        String resetLink = "http://localhost:3000/reset-password?token=" + token;
//        emailService.sendResetPasswordEmail("Đặt lại mật khẩu", user.getEmail(), resetLink);
//        return new MessageResponse("Email da duoc gui!");
//    }
//
//    @Override
//    public MessageResponse resetPassword(String token, String password) {
//        // Kiểm tra token hợp lệ
//        if (!jwtUtils.validateResetToken(token)) {
//            throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
//        }
//
//        // Lấy email từ token
//        String email = jwtUtils.getEmailFromToken(token);
//        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
//
//        // Cập nhật mật khẩu mới
//        user.setPassword(passwordEncoder.encode(password));
//        userRepository.save(user);
//
//        return new MessageResponse("Mat khau thay doi thanh cong!");
//    }
//
//    @Override
//    public MessageResponse confirmEmail(String token) {
//        if (!jwtUtils.validateConfirmToken(token)) {
//            throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
//        }
//        String email = jwtUtils.getEmailFromToken(token);
//        User user = userRepository.findByEmail(email).orElseThrow(() -> new ChangeSetPersister.NotFoundException("Không tìm thấy người dùng"));
//        user.setIsActive(true);
//        userRepository.save(user);
//        return new MessageResponse("Account verified. You can now login.");
//    }
}
