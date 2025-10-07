export default function OfferBanner() {
  return (
    <section className="relative h-[300px] md:h-[500px] lg:h-[600px]  md:max-w-7xl max-w-xl w-[90%]  mx-auto overflow-hidden rounded-xl my-10">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/images/Banners/OfferBanner.jpg)`,
        }}
      />

      {/* Content */}
      {/* <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-4">
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
              Extra <span className="text-red-200 font-bold">30% Off</span>{" "}
              Online
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Summer Season Sale
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-8 font-medium">
            Free shipping on orders over $99
          </p>

          <button className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform">
            Shop Now
          </button>
        </div>
      </div> */}

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent opacity-30"></div>
    </section>
  );
}
