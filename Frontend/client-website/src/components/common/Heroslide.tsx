"use client";

import { banner } from "@/data/banner";
import AutoSwiper from "./AutoSwiper";
import { SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function Heroslide() {
  return (
    <AutoSwiper className="px-8 py-2 rounded-md">
      {banner.map((item) => (
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
