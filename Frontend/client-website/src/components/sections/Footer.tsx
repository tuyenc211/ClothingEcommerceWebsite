import Link from "next/link";
import { newsArticles } from "@/data/news";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/tai_corn.04/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-instagram-icon lucide-instagram"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/Taicorn2004",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-facebook-icon lucide-facebook"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@fashionshop",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-youtube"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5.19-3L10 9v6z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/fashionshop",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-twitter"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-black w-full mx-auto p-6 md:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Cột 1: Thông tin công ty */}
        <div className="text-white">
          <div className="flex items-center space-x-2 mb-4">
            <div>
              <h2 className="font-bold text-3xl uppercase p-2">Aristino</h2>
              <p className="text-sm text-gray-300">
                Fashion Shop - một brand thời trang nam tại Hà Nội, được thành
                lập vào năm 2024. Sau hơn chục năm phát triển, Fashion Shop hiện
                đang hoạt động với 2 cở sở chính tại Hà Nội và các nền tảng mạng
                xã hội.
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <form className="relative">
            <Input
              type="email"
              placeholder="Enter your email"
              className="p-5 backdrop-blur-sm text-white"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Subscribe</span>
            </Button>
          </form>
        </div>

        {/* Cột 2: Thông tin liên hệ */}
        <div className="text-white">
          <h3 className="font-bold text-lg uppercase mb-4">
            Thông tin liên hệ
          </h3>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-gray-300">
              Email: fashionshop@gmail.com
            </p>
            <p className="text-sm text-gray-300">Điện thoại: 0123456789</p>
            <p className="text-sm text-gray-300">
              Địa chỉ: 123 Đường ABC, Quận XYZ, TP.Hà Nội
            </p>
          </div>
        </div>

        {/* Cột 3: Chính sách bán hàng */}
        <div className="text-white">
          <h3 className="font-bold text-lg uppercase mb-4">
            CHÍNH SÁCH BÁN HÀNG
          </h3>
          <div className="flex flex-col space-y-2">
            {newsArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Cột 4: Theo dõi chúng tôi & Thanh toán */}
        <div className="text-white">
          <h3 className="font-bold text-lg uppercase mb-4">
            THEO DÕI CHÚNG TÔI
          </h3>
          <div className="flex  mb-6 gap-4">
            {socialLinks.map((socialLink, index) => (
              <a
                key={index}
                href={socialLink.href}
                target="_blank"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  {socialLink.icon}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p className="text-sm text-gray-400">
          © 2025 CÔNG TY CỔ PHẦN THỜI TRANG VIỆT NAM. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
}
