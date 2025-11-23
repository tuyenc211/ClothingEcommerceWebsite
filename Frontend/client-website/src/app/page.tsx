"use client";
import GridLetter from "@/components/common/GridLetter";
import Heroslide from "@/components/common/Heroslide";
import ListPolicy from "@/components/common/ListPolicy";
import OfferBanner from "@/components/common/OfferBanner";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import BestSellerProduct from "@/components/sections/BestSellerProduct";
import NewsProduct from "@/components/sections/NewsProduct";
import { useProductStore } from "@/stores/productStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useEffect } from "react";
import { useProductsQuery } from "@/services/productService";
export default function Home() {
  const { fetchColors } = useColorStore();
  const { fetchSizes } = useSizeStore();
  useEffect(() => {
    fetchColors();
    fetchSizes();
  }, [fetchColors, fetchSizes]);
  const { data: products = [], isLoading, error } = useProductsQuery();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }
  return (
    <div className=" mx-auto">
      <Heroslide />
      <FeaturedProducts products={products} />
      <GridLetter />
      <BestSellerProduct products={products} />
      <OfferBanner />
      <NewsProduct products={products} />
      <ListPolicy />
    </div>
  );
}
