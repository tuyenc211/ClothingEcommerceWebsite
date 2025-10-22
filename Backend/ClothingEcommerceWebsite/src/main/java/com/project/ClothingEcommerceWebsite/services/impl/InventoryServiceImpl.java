package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.dtos.request.UpdateInventoryRequest;
import com.project.ClothingEcommerceWebsite.models.Inventory;
import com.project.ClothingEcommerceWebsite.repositories.InventoryRepository;
import com.project.ClothingEcommerceWebsite.services.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final InventoryRepository inventoryRepository;
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
    public Inventory updateInventory(UpdateInventoryRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId())
                .orElse(Inventory.builder()
                        .variantId(request.getVariantId())
                        .quantity(0)
                        .build());

        inventory.setQuantity(request.getQuantity());
        return inventoryRepository.save(inventory);
    }
}
