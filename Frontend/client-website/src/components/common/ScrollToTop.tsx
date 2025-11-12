"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Component } from "../ui/button-rotate";
export default function ScrollToTopAndContactButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Hiện nút khi scroll xuống 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Hàm scroll về đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
        <Component />
        {isVisible && (
          <button
            onClick={scrollToTop}
            className=" bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 hover:scale-110 hover:shadow-xl group"
            aria-label="Quay về đầu trang"
          >
            <ChevronUp
              size={24}
              className="transition-transform duration-200 group-hover:-translate-y-0.5"
            />
          </button>
        )}
      </div>
    </>
  );
}
