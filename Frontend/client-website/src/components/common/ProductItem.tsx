import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/stores/productStore";

// Interface cho props của ProductItem
export interface ProductItemProps {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  images?: { imageUrl: string; position: number }[];
  rating?: number;
  reviewCount?: number;
  onAddToCart?: (productId: number) => void;
}

// Helper function to convert Product to ProductItemProps
export const convertProductToItemProps = (
  product: Product
): ProductItemProps => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    base_price: product.base_price,
    images: product.images?.sort((a, b) => a.position - b.position) || [],
    rating:
      product?.reviews && product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0,
    reviewCount: product.reviews?.length || 0,
  };
};

const ProductItem: React.FC<ProductItemProps> = ({
  id,
  name,
  base_price,
  images = [],
  rating = 0,
  reviewCount = 0,
  onAddToCart,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get image URLs from images array
  const imageUrls = images.map((img) => img.imageUrl);
  const currentImage =
    imageUrls[currentImageIndex] || "/images/placeholder.jpg";

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ☆
        </span>
      );
    }

    return stars;
  };

  return (
    <div
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${id}`}>
          <Image
            src={currentImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Hover Overlay với Buttons - ĐÃ SỬA */}
        <div
          className={`absolute top-4 right-4 flex flex-col gap-4 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => {
              onAddToCart?.(id);
            }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-black p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
            title="Thêm vào giỏ hàng"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              // Handle wishlist
            }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-red-500 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
            title="Thêm vào yêu thích"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Image Navigation Dots */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4 text-center">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {name}
        </h3>

        {/* Price */}
        <div className="mb-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(base_price)}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1">
          <div className="flex text-yellow-400 text-sm">
            {renderStars(rating)}
          </div>
          <span className="text-xs text-gray-500">({reviewCount} Reviews)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
