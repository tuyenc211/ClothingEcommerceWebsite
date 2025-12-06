
import {useEffect, useMemo} from "react";
import {banner} from "@/data/banner";
import {useAllCoupons} from "@/services/couponService";

export default function OfferBanner() {
    const { data:coupons,  } = useAllCoupons()
    // Lấy các coupon active có ảnh
    const couponBanners = useMemo(() => {
        return coupons
            ?.filter((coupon) => coupon.imageUrl && coupon.isActive) // Chỉ lấy coupon có ảnh
            .map((coupon) => ({
                id: coupon.id,
                image: coupon.imageUrl,
                title: coupon.name,
                description: coupon.description || "",
                code: coupon.code,
                value: coupon.value,
            }));
    }, [coupons]);
    return (
    <section className="relative h-[300px] md:h-[500px] lg:h-[600px]  md:max-w-7xl max-w-xl w-[90%]  mx-auto overflow-hidden rounded-xl my-10">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `${couponBanners?.at(0)?.image ? `url(${couponBanners.at(0)?.image})` : `url(/images/Banners/OfferBanner.jpg)`}`,
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent opacity-30"></div>
    </section>
  );
}
