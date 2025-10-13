package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateUserRequest;
import com.project.ClothingEcommerceWebsite.models.User;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserService {

    User createUser(CreateUserRequest request);

    List<User> getAllUsers();

    Optional<User> getUserById(Long id);

    Optional<User> getUserByEmail(String email);

    void updateUserRoles(Long userId, Set<String> roleNames);

    void deleteUser(Long id);
}
