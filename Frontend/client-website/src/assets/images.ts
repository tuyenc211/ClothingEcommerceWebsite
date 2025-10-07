// Cách 2: Tạo file assets chuyên nghiệp (Tùy chọn)

// Import static images (nếu muốn sử dụng dynamic imports)
import dieuKhoanChungImg from '../../public/images/news/Dieu-khoan-chung.png';
import chinhSachThanhVienImg from '../../public/images/news/Chinh-sach-thanh-vien.png';
import chinhSachGiaoHangImg from '../../public/images/news/Chinh-sach-giao-hang.png';
import chinhSachDoiTraImg from '../../public/images/news/Chinh-sach-doi-tra.png';

// Export để sử dụng với Next.js Image component
export const newsImages = {
  // Cách 1: Đường dẫn tĩnh (được Next.js tối ưu tự động)
  static: {
    dieuKhoanChung: "/images/news/Dieu-khoan-chung.png",
    chinhSachThanhVien: "/images/news/Chinh-sach-thanh-vien.png", 
    chinhSachGiaoHang: "/images/news/Chinh-sach-giao-hang.png",
    chinhSachDoiTra: "/images/news/Chinh-sach-doi-tra.png"
  },
  
  // Cách 2: Import động (tối ưu hơn cho performance)
  dynamic: {
    dieuKhoanChung: dieuKhoanChungImg,
    chinhSachThanhVien: chinhSachThanhVienImg,
    chinhSachGiaoHang: chinhSachGiaoHangImg,
    chinhSachDoiTra: chinhSachDoiTraImg
  }
};

// Helper function để get image by slug
export const getNewsImageBySlug = (slug: string): string => {
  const imageMap: { [key: string]: string } = {
    'dieu-khoan-chung': newsImages.static.dieuKhoanChung,
    'chinh-sach-thanh-vien': newsImages.static.chinhSachThanhVien,
    'chinh-sach-van-chuyen': newsImages.static.chinhSachGiaoHang,
    'chinh-sach-doi-tra-hoan-tien': newsImages.static.chinhSachDoiTra
  };
  
  return imageMap[slug] || '/images/news/default-news.jpg';
};

export default newsImages;
