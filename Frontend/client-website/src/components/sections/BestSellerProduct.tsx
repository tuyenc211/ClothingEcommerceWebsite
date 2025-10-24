"use client";

import React, { useMemo } from "react";
import ProductCarousel from "../common/ProductCarousel";
import { convertProductToItemProps } from "../common/ProductItem";
import { useProductStore } from "@/stores/productStore";

const BestSellerProduct: React.FC = () => {
  const { getPublishedProducts } = useProductStore();
  const bestSellerProducts = useMemo(() => {
    const publishedProducts = getPublishedProducts();
    return publishedProducts
      .map(convertProductToItemProps)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }, [getPublishedProducts]);
  return (
    <section className="py-3 bg-white">
      <div className="w-full mx-auto">
        <ProductCarousel
          products={bestSellerProducts}
          title="Best Selling Product"
          autoPlay={true}
          showArrows={false}
        />
      </div>
    </section>
  );
};

export default BestSellerProduct;
