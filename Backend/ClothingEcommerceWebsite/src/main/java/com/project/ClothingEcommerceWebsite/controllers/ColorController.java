package com.project.ClothingEcommerceWebsite.controllers;

import com.project.ClothingEcommerceWebsite.dtos.request.CreateColorRequest;
import com.project.ClothingEcommerceWebsite.models.Color;
import com.project.ClothingEcommerceWebsite.services.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("${api.prefix}/colors")
@RequiredArgsConstructor
public class ColorController {
    private final ColorService colorService;

    @PostMapping("")
    public ResponseEntity<?> createColor(@Valid @RequestBody CreateColorRequest request) {
        Color color = colorService.createColor(request);
        return ResponseEntity.ok(color);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getColorById(@PathVariable Long id) {
        Color color = colorService.getColorById(id);
        return ResponseEntity.ok(color);
    }

    @GetMapping("")
    public ResponseEntity<?> getAllColors() {
        return ResponseEntity.ok(colorService.getAllColors());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateColor(@PathVariable Long id, @Valid @RequestBody CreateColorRequest request) {
        Color updated = colorService.updateColor(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ResponseEntity.ok("Deleted color with id: " + id);
    }
}
