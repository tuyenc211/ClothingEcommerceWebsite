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
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "pos.nvncdn.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/address-kit/:path*",
        destination: "https://production.cas.so/address-kit/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination:
          "https://clothingecommercewebsite.onrender.com/api/v1/:path*",
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
