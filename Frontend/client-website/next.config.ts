import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 🚀 Cho phép build dù có lỗi ESLint
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  }, async rewrites() {
    return [
      {
        source: "/address-kit/:path*",
        destination: "https://production.cas.so/address-kit/:path*",
      },
    ];
  },
  // rewrites: async () => [
  //   {
  //     source: "/api/:path*",
  //     destination: "http://localhost:3000/api/:path*",
  //   },
  // ],
};

export default nextConfig;
