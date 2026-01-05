"use client";

import React, { useMemo } from "react";
import ProductCarousel from "./ProductCarousel";
import { convertProductToItemProps } from "./ProductItem";
import {Product} from "@/types";


interface BestSellerProductProps {
    products: Product[];
}

export default function BestSellerProduct({ products }: BestSellerProductProps) {
    const bestSellerProducts = useMemo(() => {
        return products
        .filter(p => p.isPublished)
            .map(convertProductToItemProps)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8);
    }, [products]);

    return (
        <section className="py-3 bg-white">
            <div className="w-full mx-auto">
                <ProductCarousel
                    products={bestSellerProducts}
                    title="Sản phẩm bán chạy"
                    autoPlay={true}
                    showArrows={false}
                />
            </div>
        </section>
    );
}