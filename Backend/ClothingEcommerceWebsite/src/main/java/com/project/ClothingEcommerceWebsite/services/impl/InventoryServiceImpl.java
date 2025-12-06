package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.UpdateInventoryRequest;
import com.project.ClothingEcommerceWebsite.models.Inventory;
import com.project.ClothingEcommerceWebsite.models.ProductVariant;
import com.project.ClothingEcommerceWebsite.repositories.InventoryRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductVariantRepository;
import com.project.ClothingEcommerceWebsite.services.InventoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    @Override
    public Inventory getByVariantId(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        return inventoryRepository.findByProductVariant(variant)
                .orElseThrow(() -> new RuntimeException("No inventory found for variant id: " + variantId));
    }

    @Override
    public List<Inventory> getByProductId(Long productId) {
        return inventoryRepository.findAllByProductVariant_Product_Id(productId);
    }

    @Override
    public Inventory updateInventory(UpdateInventoryRequest request) {
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + request.getVariantId()));

        Inventory inventory = inventoryRepository.findByProductVariant(variant)
                .orElseThrow(() -> new RuntimeException("No inventory found for variant id: " + request.getVariantId()));

        inventory.setQuantity(request.getQuantity());
        return inventoryRepository.save(inventory);
    }
}
