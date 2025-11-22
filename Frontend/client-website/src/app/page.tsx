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
export default function Home() {
  const { fetchProducts } = useProductStore();
  const { fetchColors } = useColorStore();
  const { fetchSizes } = useSizeStore();

  useEffect(() => {
    fetchProducts();
    fetchColors();
    fetchSizes();
  }, []);
  return (
    <div className=" mx-auto">
      <Heroslide />
      <FeaturedProducts />
      <GridLetter />
      <BestSellerProduct />
      <OfferBanner />
      <NewsProduct />
      <ListPolicy />
    </div>
  );
}
