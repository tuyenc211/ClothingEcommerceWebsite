"use client";

import React, { useMemo } from "react";
import ProductCarousel from "../common/ProductCarousel";
import { convertProductToItemProps } from "../common/ProductItem";
import { useProductStore } from "@/stores/productStore";

const NewsProduct: React.FC = () => {
  // Get products from store
  const { getPublishedProducts } = useProductStore();

  // Get top 8 newest products
  const newssProducts = useMemo(() => {
    const publishedProducts = getPublishedProducts();
    return publishedProducts
      .map(convertProductToItemProps)
      .sort((a, b) => b.id - a.id) // Sắp xếp theo id giảm dần (mới nhất)
      .slice(0, 8); // Lấy top 8 sản phẩm
  }, [getPublishedProducts]);

  const handleAddToCart = (productId: number) => {
    const product = newssProducts.find((p) => p.id === productId);
    if (product) {
      alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
  };

  return (
    <section className="py-3 bg-white">
      <div className="w-full mx-auto">
        <ProductCarousel
          products={newssProducts}
          title="News Product"
          onAddToCart={handleAddToCart}
          autoPlay={true}
          showArrows={false}
        />
      </div>
    </section>
  );
};

export default NewsProduct;
