package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateAddressRequest;
import com.project.ClothingEcommerceWebsite.models.Address;
import com.project.ClothingEcommerceWebsite.models.User;
import com.project.ClothingEcommerceWebsite.repositories.AddressRepository;
import com.project.ClothingEcommerceWebsite.repositories.UserRepository;
import com.project.ClothingEcommerceWebsite.services.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    @Override
    public Address createAddress(CreateAddressRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Nếu địa chỉ mới là mặc định -> set các địa chỉ khác thành false
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Address> existing = addressRepository.findByUserId(user.getId());
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
        }

        Address address = Address.builder()
                .user(user)
                .line(request.getLine())
                .ward(request.getWard())
                .district(request.getDistrict())
                .province(request.getProvince())
                .country(request.getCountry())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();
        addressRepository.save(address);
        return address;
    }

    @Override
    public List<Address> getAddressesByUser(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Override
    public Address updateAddress(Long id, CreateAddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        address.setLine(request.getLine());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setCountry(request.getCountry());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Address> existing = addressRepository.findByUserId(address.getUser().getId());
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    @Override
    public Address setDefaultAddress(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        Long userId = address.getUser().getId();
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> a.setIsDefault(false));
        addressRepository.saveAll(addresses);

        address.setIsDefault(true);
        return addressRepository.save(address);
    }

    @Override
    public void deleteAddress(Long id) {
        addressRepository.deleteById(id);
    }
}
