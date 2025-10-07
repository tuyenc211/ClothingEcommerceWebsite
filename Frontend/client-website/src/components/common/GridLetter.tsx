"use client";

import Image from "next/image";

export default function GridLetter() {
  return (
    <div className="md:w-[85%] w-full mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Where Dreams Meet Couture */}
        <div className="h-[200px] md:h-[500px] md:col-span-1 md:row-span-3 bg-gradient-to-r from-gray-500 to-gray-200 rounded-lg overflow-hidden relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
          <div className="relative h-full flex flex-col justify-between p-6 z-20">
            <div>
              <p className="text-sm text-gray-600 mb-2">LỊCH LÃM</p>
              <h2 className="text-2xl  font-bold text-gray-900 mb-4">
                Where Dreams
                <br />
                Meet Couture
              </h2>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors w-fit">
              Shop Now
            </button>
          </div>
          {/* Placeholder for image */}
          <div className="absolute right-0 top-0 w-2/3 h-[95%] flex items-center justify-center">
            <Image src="/images/GridLetter/coat.png" alt="GridLetter" fill />
          </div>
        </div>

        {/* Enchanting Styles for Every Woman */}
        <div className="h-[200px] md:h-auto bg-gradient-to-r from-blue-900 to-blue-600 rounded-lg overflow-hidden relative group cursor-pointer">
          <div className="relative h-full flex flex-col justify-between p-6 text-white">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase">
                Quý phái
                <br />
                cho mọi nữ giới
              </h2>
            </div>
            <button className="bg-white text-blue-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors w-fit">
              Shop Now
            </button>
          </div>
          {/* Placeholder for image */}
          <div className="absolute right-0 top-0 w-1/3 h-full flex items-center justify-center">
            <Image
              src="/images/GridLetter/hero_image.png"
              alt="GridLetter"
              width={700}
              height={500}
            />
          </div>
        </div>

        {/* Chic Footwear for City Living */}
        <div className="h-[200px] md:h-auto bg-gray-50 rounded-lg overflow-hidden relative group cursor-pointer">
          <div className="relative h-full flex flex-col justify-between p-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 uppercase">
                Thời Trang
                <br />
                Giới trẻ
              </h2>
            </div>
            <button className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors w-fit">
              Shop Now
            </button>
          </div>
          {/* Placeholder for shoe image */}
          <div className="absolute bottom-0 right-0 w-2/3 h-2/3  flex items-center justify-center rounded-tl-lg">
            <Image
              src="/images/GridLetter/shoess.png"
              alt="GridLetter"
              width={700}
              height={500}
            />
          </div>
        </div>

        {/* Trending Bags for Her - 50% Off */}
        <div className="h-[200px] md:h-auto md:col-span-2 md:row-span-2 bg-gradient-to-r from-gray-900 to-gray-600 rounded-lg overflow-hidden relative group cursor-pointer">
          <div className="relative h-full flex items-center justify-between p-6 text-white">
            <div>
              <h3 className="text-xl  font-bold uppercase">
                Thời trang là cách bạn kể chuyện mà không cần lời nói
              </h3>
            </div>
            <button className="bg-white text-slate-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Second row */}
    </div>
  );
}
