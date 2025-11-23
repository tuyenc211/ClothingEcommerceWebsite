"use client";
import React, { useState } from "react";
import ProductGrid from "../common/ProductGrid";
import { convertProductToItemProps } from "../common/ProductItem";
import { Product } from "@/stores/productStore";

interface FeaturedProductsProps {
    products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
    const [displayCount, setDisplayCount] = useState(8);
    const [isLoading, setIsLoading] = useState(false);

    // Convert products to ProductItemProps format
    const allProducts = products.map(convertProductToItemProps);
    const displayedProducts = allProducts.slice(0, displayCount);

    const handleLoadMore = () => {
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + 8, allProducts.length));
            setIsLoading(false);
        }, 500);
    };

    return (
        <section className="py-6">
            <div className="w-full mx-auto px-4 md:px-10 lg:px-12">
                <ProductGrid
                    products={displayedProducts}
                    title="Sản Phẩm Nổi Bật"
                    showLoadMore={displayCount < allProducts.length}
                    onLoadMore={handleLoadMore}
                    isLoading={isLoading}
                />
            </div>
        </section>
    );
}