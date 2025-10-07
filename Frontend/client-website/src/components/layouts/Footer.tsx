import Link from "next/link";
import { newsArticles } from "@/data/news";
export default function Footer() {
  const socialLinks = [
    {
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
      href: "https://github.com/JustTaiCorn",
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
          className="lucide lucide-github-icon lucide-github"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      ),
    },
  ];
  return (
    <footer className="bg-black w-full mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/*Thông tin công ty */}
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-4 text-white">
            {/*introduction*/}
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="font-bold text-lg uppercase">Fashion Shop</h3>

                <p className="text-sm text-gray-300">
                  Fashion Shop - một brand thời trang nam tại Hà Nội, được thành
                  lập vào năm 2024. Sau hơn chục năm phát triển, Fashion Shop
                  hiện đang hoạt động với 2 cở sở chính tại Hà Nội và các nền
                  tảng mạng xã hội. Fashion Shop coi trọng trải nghiệm khách
                  hàng, tinh thần của con người và đưa đến những sản phẩm giá
                  thành hợp lý hơn bất kì chiến dịch quảng bá nào khác.
                </p>
              </div>
            </div>

            {/* newsletter */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-bold text-lg uppercase">Newsletter</h3>
              <p className="text-sm text-gray-300">
                Hãy nhập email của bạn để nhận thông tin mới nhất
              </p>
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-white focus:outline-none"
                />
                <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-gray-200 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* social media */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white">
                Theo dõi chúng tôi
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((socialLink, index) => (
                  <a
                    key={index}
                    href={socialLink.href}
                    target="_blank"
                    className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
                  >
                    {socialLink.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/*  Về chúng tôi */}
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

        {/* Cột 4: Dịch vụ khách hàng & Quy định hoạt động */}
        <div className="text-white">
          <h3 className="font-bold text-lg uppercase mb-4">
            DỊCH VỤ KHÁCH HÀNG
          </h3>
          <div className="flex flex-col space-y-2 mb-6">
            <Link
              href="/support/contact"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Liên hệ hỗ trợ
            </Link>
            <Link
              href="/support/size-guide"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Hướng dẫn chọn size
            </Link>
            <Link
              href="/support/faq"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Câu hỏi thường gặp
            </Link>
          </div>

          <h3 className="font-bold text-lg uppercase mb-4">
            QUY ĐỊNH HOẠT ĐỘNG
          </h3>
          <div className="flex flex-col space-y-2 mb-6">
            <Link
              href="/regulations/terms"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href="/regulations/privacy"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Chính sách riêng tư
            </Link>
          </div>

          <h3 className="font-bold text-lg uppercase mb-4">THANH TOÁN</h3>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-gray-800 px-3 py-2 rounded text-sm font-semibold">
              COD
            </div>
            <div className="bg-blue-600 px-3 py-2 rounded text-sm font-semibold text-white">
              VISA
            </div>
            <div className="bg-red-500 px-3 py-2 rounded text-sm font-semibold text-white">
              MasterCard
            </div>
            <div className="bg-purple-600 px-3 py-2 rounded text-sm font-semibold text-white">
              E-WALLET
            </div>
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
