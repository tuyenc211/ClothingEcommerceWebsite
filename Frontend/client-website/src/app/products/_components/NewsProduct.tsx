"use client";

import React, { useMemo } from "react";
import ProductCarousel from "./ProductCarousel";
import { convertProductToItemProps } from "./ProductItem";
import { Product } from "@/stores/productStore";

interface NewsProductProps {
    products: Product[];
}

export default function NewsProduct({ products }: NewsProductProps) {
    // Get top 8 newest products
    const newsProducts = useMemo(() => {
        return products
            .filter(p => p.isPublished) // Chỉ lấy sản phẩm đã publish
            .map(convertProductToItemProps)
            .sort((a, b) => {
                return b.id - a.id;
            })
            .slice(0, 8);
    }, [products]);

    return (
        <section className="py-3 bg-white">
            <div className="w-full mx-auto">
                <ProductCarousel
                    products={newsProducts}
                    title="Sản phẩm mới nhất"
                    autoPlay={true}
                    showArrows={false}
                />
            </div>
        </section>
    );
}