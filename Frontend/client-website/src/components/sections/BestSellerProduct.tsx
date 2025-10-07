"use client";

import React, { useMemo } from "react";
import ProductCarousel from "../common/ProductCarousel";
import { convertProductToItemProps } from "../common/ProductItem";
import { useProductStore } from "@/stores/productStore";

const BestSellerProduct: React.FC = () => {
  // Get products from store
  const { getPublishedProducts } = useProductStore();

  // Get top 8 products with highest rating
  const bestSellerProducts = useMemo(() => {
    const publishedProducts = getPublishedProducts();
    return publishedProducts
      .map(convertProductToItemProps)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sắp xếp theo rating giảm dần
      .slice(0, 8); // Lấy top 8 sản phẩm
  }, [getPublishedProducts]);

  const handleAddToCart = (productId: number) => {
    const product = bestSellerProducts.find((p) => p.id === productId);
    if (product) {
      alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
      // Here you would typically dispatch to cart state or call an API
    }
  };

  return (
    <section className="py-3 bg-white">
      <div className="w-full mx-auto">
        <ProductCarousel
          products={bestSellerProducts}
          title="Best Selling Product"
          onAddToCart={handleAddToCart}
          autoPlay={true}
          showArrows={false}
        />
      </div>
    </section>
  );
};

export default BestSellerProduct;
