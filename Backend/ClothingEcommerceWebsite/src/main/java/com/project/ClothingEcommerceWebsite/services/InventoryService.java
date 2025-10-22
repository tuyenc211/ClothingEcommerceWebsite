package com.project.ClothingEcommerceWebsite.services;

import com.project.ClothingEcommerceWebsite.dtos.request.UpdateInventoryRequest;
import com.project.ClothingEcommerceWebsite.models.Inventory;

import java.util.List;

public interface InventoryService {
    List<Inventory> getAllInventories();
    Inventory getByVariantId(Long variantId);
    Inventory updateInventory(UpdateInventoryRequest request);
}
