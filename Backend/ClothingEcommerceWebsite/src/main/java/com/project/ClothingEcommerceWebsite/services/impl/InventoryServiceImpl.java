package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.UpdateInventoryRequest;
import com.project.ClothingEcommerceWebsite.models.Inventory;
import com.project.ClothingEcommerceWebsite.models.ProductVariant;
import com.project.ClothingEcommerceWebsite.repositories.InventoryRepository;
import com.project.ClothingEcommerceWebsite.repositories.ProductVariantRepository;
import com.project.ClothingEcommerceWebsite.services.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final InventoryRepository inventoryRepository;

    private final ProductVariantRepository productVariantRepository;
    @Override
    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    @Override
    public Inventory getByVariantId(Long variantId) {
        return inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new RuntimeException("No inventory found for variant id: " + variantId));
    }

    @Override
    public List<Inventory> getByProductId(Long productId) {
        List<ProductVariant> variants = productVariantRepository.findAllByProductId(productId);
        if (variants.isEmpty()) {
            throw new RuntimeException("No variants found for product id: " + productId);
        }

        List<Long> variantIds = variants.stream()
                .map(ProductVariant::getId)
                .toList();

        // Lọc inventory theo variantId
        return inventoryRepository.findAll()
                .stream()
                .filter(inv -> variantIds.contains(inv.getId()))
                .toList();
    }

    @Override
    public Inventory updateInventory(UpdateInventoryRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId()).get();
        inventory.setQuantity(request.getQuantity());
        return inventoryRepository.save(inventory);
    }
}
