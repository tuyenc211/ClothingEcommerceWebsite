package com.project.ClothingEcommerceWebsite.repositories;

import com.project.ClothingEcommerceWebsite.models.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}

