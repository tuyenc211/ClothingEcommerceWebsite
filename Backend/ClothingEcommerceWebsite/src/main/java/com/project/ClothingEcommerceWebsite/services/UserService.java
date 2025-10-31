package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.ChangePasswordRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.ChangeUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.request.CreateUserRequest;
import com.project.ClothingEcommerceWebsite.dtos.respond.MessageResponse;
import com.project.ClothingEcommerceWebsite.models.Role;
import com.project.ClothingEcommerceWebsite.models.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    User createUser(CreateUserRequest request);

    List<User> getAllUsers();

    Optional<User> getUserById(Long id);

    Optional<User> getUserByEmail(String email);

    void updateUserRoles(Long id, Role role);

    void changeUser(Long id, ChangeUserRequest request);

    void deleteUser(Long id);

    void lockUser(Long userId);

    void unlockUser(Long userId);

    void changePassword(ChangePasswordRequest request);

    MessageResponse forgotPassword(String email);

    MessageResponse resetPassword(String token, String password);

    MessageResponse confirmEmail(String token);
}
