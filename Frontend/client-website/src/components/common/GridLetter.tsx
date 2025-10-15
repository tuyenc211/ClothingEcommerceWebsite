"use client";

import Image from "next/image";

export default function GridLetter() {
  return (
    <div className="w-full px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4  mx-auto">
        {/* MEN WEAR */}
        <div className="h-[400px] lg:h-[500px] bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer">
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/Banners/Banner1.jpg"
              alt="Men running"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-8 z-10">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-wide">
                MEN WEAR
              </h2>
              <p className="text-white/90 text-sm lg:text-base font-medium">
                Nhập COOLNEW Giảm 50K đơn đầu tiên từ 299K
              </p>
            </div>
            <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 w-fit uppercase tracking-wide">
              KHÁM PHÁ
            </button>
          </div>
        </div>

        {/* WOMEN ACTIVE */}
        <div className="h-[400px] lg:h-[500px] bg-gradient-to-r from-green-200 to-green-100 rounded-2xl overflow-hidden relative group cursor-pointer">
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/Banners/Banner2.jpg"
              alt="Women playing sports"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-8 z-10">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-wide">
                WOMEN ACTIVE
              </h2>
              <p className="text-white/90 text-sm lg:text-base font-medium">
                Nhập OMVSEAMLESS Giảm 50K cho BST Seamless
              </p>
            </div>
            <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 w-fit uppercase tracking-wide">
              KHÁM PHÁ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
