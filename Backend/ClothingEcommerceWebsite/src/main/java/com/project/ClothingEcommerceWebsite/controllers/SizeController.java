package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateSizeRequest;
import com.project.ClothingEcommerceWebsite.models.Size;
import com.project.ClothingEcommerceWebsite.services.SizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/sizes")
@RequiredArgsConstructor
public class SizeController {
    private final SizeService sizeService;

    @PostMapping("")
    public ResponseEntity<?> createSize(@Valid @RequestBody CreateSizeRequest request) {
        Size size = sizeService.createSize(request);
        return ResponseEntity.ok(size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSizeById(@PathVariable Long id) {
        Size size = sizeService.getSizeById(id);
        return ResponseEntity.ok(size);
    }

    @GetMapping("")
    public ResponseEntity<?> getAllSizes() {
        return ResponseEntity.ok().body(sizeService.getAllSizes());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSize(@PathVariable Long id, @Valid @RequestBody CreateSizeRequest request) {
        Size updated = sizeService.updateSize(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSize(@PathVariable Long id) {
        sizeService.deleteSize(id);
        return ResponseEntity.ok("Deleted size with id: " + id);
    }

}
