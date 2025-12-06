package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.ChangePasswordRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.ChangeUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.MessageResponse;
import com.project.ClothingEcommerceWebsite.exception.BadRequestException;
import com.project.ClothingEcommerceWebsite.exception.NotFoundException;
import com.project.ClothingEcommerceWebsite.models.*;
import com.project.ClothingEcommerceWebsite.repositories.*;
import com.project.ClothingEcommerceWebsite.services.EmailService;
import com.project.ClothingEcommerceWebsite.services.UserService;
import com.project.ClothingEcommerceWebsite.utils.JwtUtil;
import jakarta.transaction.Transactional;
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
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final CartItemRepository cartItemRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final JwtUtil jwtUtil;

    @Override
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!!");
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
                .isActive(false)
                .roles(roles)
                .build();
        userRepository.save(user);
        String confirmToken = jwtUtil.generateConfirmToken(user.getEmail());
        String confirmLink = "http://localhost:3000/user/authenticate?token=" + confirmToken;
        // String confirmLink = "http://clothing-ecommerce-website-client.vercel.app/user/authenticate?token=" + confirmToken;
        emailService.sendConfirmEmail("Xác thực email", user.getEmail(), confirmLink);

        System.out.println("✅ Đã gửi email xác thực tới: " + user.getEmail());
        return user;
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
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        List<Order> orders = orderRepository.findByUserId(id);

        if (!orders.isEmpty()) {
            userRepository.save(user);
            throw new RuntimeException(
                    "Không thể xóa tài khoản có " + orders.size() +
                            " đơn hàng."
            );
        }
        Optional<Cart> cart = cartRepository.findByUserId(id);
        if (cart.isPresent()) {
            cartItemRepository.deleteByCartId(cart.get().getId());
        }
        cartRepository.deleteByUserId(id);
        addressRepository.deleteByUserId(id);
        reviewRepository.deleteAllByUserId(id);
        couponRedemptionRepository.deleteByUserId(id);
        user.setRoles(new HashSet<>());
        userRepository.save(user);
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
            throw new BadRequestException("Mật khẩu cũ không đúng!!");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu mới phải khác với mật khẩu cũ!!");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public MessageResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Not found user"));
        String resetToken = jwtUtil.generateResetToken(user.getEmail());
        String resetLink = "http://localhost:3000/user/reset-password?token=" + resetToken;
        // String resetLink = "http://clothing-ecommerce-website-client.vercel.app/user/reset-password?token=" + resetToken;
        emailService.sendResetPasswordEmail("Đặt lại mật khẩu", user.getEmail(), resetLink);
        return new MessageResponse("Email da duoc gui!");
    }

    @Override
    public MessageResponse resetPassword(String token, String password) {
        // Kiểm tra token hợp lệ
        if (!jwtUtil.validateResetToken(token)) {
            throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
        }

        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return new MessageResponse("Mật khẩu thay đổi thành công!!");
    }

    @Override
    public MessageResponse confirmEmail(String token) {
        if (!jwtUtil.validateConfirmToken(token)) {
            throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn.");
        }
        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
        user.setIsActive(true);
        userRepository.save(user);
        return new MessageResponse("Account verified. You can now login.");
    }
}

