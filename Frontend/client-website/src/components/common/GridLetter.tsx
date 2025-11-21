"use client";

import Image from "next/image";
import { useCouponStore } from "@/stores/couponStore";
import { useMemo } from "react";
export default function GridLetter() {
  const { coupons } = useCouponStore();

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

  return (
    <div className="w-full px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto">
        {couponBanners.slice(0, 2).map((item, index) => (
          <div
            key={item.id || index}
            className={`h-[400px] lg:h-[500px] rounded-2xl overflow-hidden relative group cursor-pointer ${
              index === 0
                ? "bg-gradient-to-r from-slate-200 to-slate-100"
                : "bg-gradient-to-r from-green-200 to-green-100"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-8 z-10">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-wide">
                  {item.title}
                </h2>
                <p className="text-white/90 text-sm lg:text-base font-medium">
                  Nhập {item.code} Giảm {item.value}%
                </p>
              </div>
              <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 w-fit uppercase tracking-wide">
                KHÁM PHÁ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
