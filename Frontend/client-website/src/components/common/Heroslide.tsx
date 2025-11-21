"use client";

import { banner } from "@/data/banner";
import AutoSwiper from "./AutoSwiper";
import { SwiperSlide } from "swiper/react";
import Image from "next/image";
import {useCouponStore} from "@/stores/couponStore";
import {useEffect, useMemo} from "react";

export default function Heroslide() {
    const { coupons, fetchCoupons  } = useCouponStore();
    useEffect(() => {
        // Fetch coupons khi component mount
        fetchCoupons();
    }, [fetchCoupons]);

    // Lấy các coupon active có ảnh
    const couponBanners = useMemo(() => {
        return coupons
            .filter((coupon) => coupon.imageUrl && coupon.isActive) // Chỉ lấy coupon có ảnh
            .map((coupon) => ({
                id: coupon.id,
                image: coupon.imageUrl!,
                title: coupon.name,
                description: coupon.description || "",
                code: coupon.code,
                value: coupon.value,
            }));
    }, [coupons]);

    // Sử dụng coupon banners nếu có, không thì dùng banner mặc định
    const displayBanners = couponBanners.length > 0 ? couponBanners : banner;

    return (
    <AutoSwiper className="px-8 py-2 rounded-md">
      {displayBanners.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="relative w-full h-[250px] md:h-[700px] sm:h-[350px]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="w-full h-full object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </AutoSwiper>
  );
}
