package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateAddressRequest;
import com.project.ClothingEcommerceWebsite.models.Address;

import java.util.List;

public interface AddressService {
    Address createAddress(CreateAddressRequest request);
    List<Address> getAddressesByUser(Long userId);
    Address updateAddress(Long id, CreateAddressRequest request);
    Address setDefaultAddress(Long id);
    void deleteAddress(Long id);
}
