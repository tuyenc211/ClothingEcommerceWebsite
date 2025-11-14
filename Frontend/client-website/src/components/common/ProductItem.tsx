import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/stores/productStore";
import { formatPrice } from "@/lib/utils";
import { Rating, RatingButton } from "../ui/shadcn-io/rating";
import { toast } from "sonner";
export interface ProductItemProps {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  images?: { image_url: string; position: number }[];
  rating?: number;
  reviewCount?: number;
  isHovered?: boolean;
  isFocused?: boolean;
}

export const convertProductToItemProps = (
  product: Product
): ProductItemProps => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: product.basePrice,
    images: product.images?.sort((a, b) => a.position - b.position) || [],
  };
};

const ProductItem: React.FC<ProductItemProps> = ({
  id,
  name,
  basePrice,
  images = [],
  isHovered: isHoveredFromParent,
  isFocused = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // Get image URLs from images array
  const imageUrls = images.map((img) => img.image_url);
  const currentImage =
    imageUrls[currentImageIndex] || "/images/placeholder.jpg";

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <Rating value={fullStars} readOnly>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton className="text-yellow-500" key={index} />
        ))}
      </Rating>
    );
  };

  return (
    <div
      className={`group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative ${
        isFocused ? "blur-sm scale-[0.98]" : ""
      }`}
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
            loading={"eager"}
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
              toast.info("Chức năng chưa được phát triển");
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
            {formatPrice(basePrice)}
          </span>
        </div>

        {/* Rating
        <div className="flex items-center justify-center gap-1">
          <div className="flex text-yellow-400 text-sm">
            {renderStars(rating)}
          </div>
          <span className="text-xs text-gray-500">({reviewCount} Reviews)</span>
        </div> */}
      </div>
    </div>
  );
};

export default ProductItem;
