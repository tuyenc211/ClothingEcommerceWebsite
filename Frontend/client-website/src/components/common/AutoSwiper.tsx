"use client";

import { Swiper } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// Scrollbar CSS is included in the main swiper CSS in newer versions

interface AutoSwiperProps {
  children: React.ReactNode;
  autoplay?: boolean;
  loop?: boolean;
  pagination?: boolean;
  navigation?: boolean;
  className?: string;
}

const AutoSwiper = ({
  children,
  autoplay = true,
  loop = true,
  navigation = false,
  className = "",
}: AutoSwiperProps) => {
  const swiperModules = [];

  if (autoplay) swiperModules.push(Autoplay);
  if (navigation) swiperModules.push(Navigation);

  return (
    <div className={`swiper-container relative ${className}`}>
      <Swiper
        modules={swiperModules}
        slidesPerView={1}
        loop={loop}
        autoplay={
          autoplay
            ? {
                delay: 4000,
                disableOnInteraction: false,
              }
            : false
        }
        navigation={navigation}
        grabCursor={true}
        centeredSlides={true}
        style={{ width: "100%", height: "max-content" }}
        className="!pb-1"
      >
        {children}
      </Swiper>
    </div>
  );
};

export default AutoSwiper;
