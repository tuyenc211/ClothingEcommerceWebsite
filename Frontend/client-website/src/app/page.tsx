import GridLetter from "@/components/common/GridLetter";
import Heroslide from "@/components/common/Heroslide";
import ListPolicy from "@/components/common/ListPolicy";
import OfferBanner from "@/components/common/OfferBanner";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import BestSellerProduct from "@/components/sections/BestSellerProduct";
import NewsProduct from "@/components/sections/NewsProduct";
export default function Home() {
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
