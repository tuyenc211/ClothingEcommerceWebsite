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
import {useProductsQuery} from "@/services/productService";
export default function Home() {
    const { data: products = [], isLoading, error } = useProductsQuery();
  const { fetchColors } = useColorStore();
  const { fetchSizes } = useSizeStore();

  useEffect(() => {

    fetchColors();
    fetchSizes();
  }, [ fetchColors, fetchSizes]);
  return (
    <div className=" mx-auto">
      <Heroslide />
      <FeaturedProducts  products={products}/>
      <GridLetter />
      <BestSellerProduct   products={products}/>
      <OfferBanner />
      <NewsProduct   products={products}/>
      <ListPolicy />
    </div>
  );
}
