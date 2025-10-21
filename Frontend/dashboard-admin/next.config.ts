import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  eslint: {
    // 🚀 Cho phép build dù có lỗi ESLint
    ignoreDuringBuilds: true,
  },
  // async rewrites() {
  //   return process.env.NODE_ENV === "development"
  //     ? [
  //         {
  //           source: "/api/v1/:path*",
  //           destination: "http://localhost:8088/api/v1/:path*",
  //         },
  //       ]
  //     : [
  //         {
  //           source: "/api/v1/:path*",
  //           destination:
  //             "https://clothingecommercewebsite.onrender.com/api/v1/:path*",
  //         },
  //       ];
  // },
};

export default nextConfig;
