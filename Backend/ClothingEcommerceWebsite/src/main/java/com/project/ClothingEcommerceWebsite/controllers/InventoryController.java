package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.UpdateInventoryRequest;
import com.project.ClothingEcommerceWebsite.models.Inventory;
import com.project.ClothingEcommerceWebsite.services.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/inventories")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{variantId}")
    public ResponseEntity<Inventory> getByVariantId(@PathVariable Long variantId) {
        return ResponseEntity.ok(inventoryService.getByVariantId(variantId));
    }

    @PutMapping("/update")
    public ResponseEntity<Inventory> updateInventory(@RequestBody UpdateInventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(request));
    }
}
