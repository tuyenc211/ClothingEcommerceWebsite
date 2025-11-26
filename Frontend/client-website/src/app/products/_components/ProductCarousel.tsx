"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductItem, { ProductItemProps } from "./ProductItem";

interface ProductCarouselProps {
  products: ProductItemProps[];
  title?: string;
  subtitle?: string;
  onAddToCart?: (productId: number) => void;
  autoPlay?: boolean;
  showArrows?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  onAddToCart,
  autoPlay = true,
  showArrows = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAddToCart = (productId: number) => {
    console.log("Adding to cart:", productId);
    onAddToCart?.(productId);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9M16 13h2m-6 0h2m0 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v4.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Không có sản phẩm nào
        </h3>
        <p className="text-gray-500">
          Hiện tại chưa có sản phẩm nào trong danh mục này.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      {title && (
        <div className="flex items-center w-full gap-4 px-4 md:px-8 max-w-6xl mx-auto my-12">
          <div className="h-[2px] bg-gradient-to-r from-[#111111] to-[#EEEEEE] flex-1" />
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
              {title}
            </h2>
          )}
          <div className="h-[2px] bg-gradient-to-r from-[#EEEEEE] to-[#111111] flex-1" />
        </div>
      )}

      {/* Carousel */}
      <div className="relative px-4 md:px-12">
        <Carousel
          opts={{
            align: "start",
            loop: autoPlay,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:pl-4  md:basis-1/4 basis-1/2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="p-1">
                  <ProductItem 
                    {...product} 
                    isHovered={hoveredIndex === index}
                    isFocused={hoveredIndex !== null && hoveredIndex !== index}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          {showArrows && (
            <>
              <CarouselPrevious className="hidden md:flex -left-6 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
              <CarouselNext className="hidden md:flex -right-6 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default ProductCarousel;
