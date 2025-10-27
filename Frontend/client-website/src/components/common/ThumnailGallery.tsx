"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Lens } from "@/components/ui/lens";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  className = "",
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Main Image Swiper */}
      <div className="relative group">
        <Swiper
          style={
            {
              "--swiper-navigation-color": "#fff",
              "--swiper-navigation-size": "24px",
            } as React.CSSProperties
          }
          spaceBetween={10}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container w-full h-full relative">
                <Lens hovering={hovering} setHovering={setHovering}>
                  <Image
                    src={image}
                    alt={`${productName} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    unoptimized={image.includes("cloudinary")}
                  />
                </Lens>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Swiper */}
      {images.length > 1 && (
        <div className="relative">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={12}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="thumbnail-swiper"
            breakpoints={{
              320: {
                slidesPerView: 3,
              },
              480: {
                slidesPerView: 4,
              },
              768: {
                slidesPerView: 5,
              },
              1024: {
                slidesPerView: 6,
              },
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="!w-auto">
                <div
                  className={`
                    relative aspect-square w-16 md:w-20 cursor-pointer  overflow-hidden border-2 transition-all duration-300
                    ${
                      activeIndex === index
                        ? "border-gray-900 ring-2 ring-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {activeIndex === index && (
                    <div className="absolute inset-0"></div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};
export default ProductImageGallery;
