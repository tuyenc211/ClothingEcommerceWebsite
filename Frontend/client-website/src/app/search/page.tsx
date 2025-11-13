"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import privateClient from "@/lib/axios";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Category } from "@/stores/categoryStore";
import { ProductImage } from "@/stores/productStore";
import ProductGrid from "@/components/common/ProductGrid";
import { useCartStore } from "@/stores/cartStore";

export interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  category: Category;
  images: ProductImage[];
  description?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await privateClient.get(
        `/products/search`,
        {
          params: { name: searchQuery },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert to ProductItemProps format and apply display limit
  const displayedProducts = useMemo(() => {
    return products
      .slice(0, displayCount)
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        images: product.images?.sort((a, b) => a.position - b.position) || [],
        rating: 0, // Search results don't have ratings
        reviewCount: 0,
      }));
  }, [products, displayCount]);

  // Handle load more
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 12, products.length));
      setIsLoadingMore(false);
    }, 1000);
  };

  // Handle add to cart
  const handleAddToCart = (productId: number) => {
    alert("Vui lòng vào trang chi tiết sản phẩm để chọn size và màu sắc!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/search">Tìm kiếm</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm cho: "{query}"
          </h1>
          <p className="text-gray-600">
            {isLoading
              ? "Đang tìm kiếm..."
              : `Tìm thấy ${products.length} sản phẩm`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy sản phẩm nào
            </h2>
            <p className="text-gray-600 mb-6">
              Thử tìm kiếm với từ khóa khác hoặc xem các sản phẩm khác
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <ProductGrid
            products={displayedProducts}
            showLoadMore={displayCount < products.length}
            onLoadMore={handleLoadMore}
            isLoading={isLoadingMore}
          />
        )}
      </div>
    </div>
  );
}
