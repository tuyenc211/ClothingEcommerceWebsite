"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { SearchProduct } from "@/app/search/page";
import privateClient from "@/lib/axios";


interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SearchBar({ className, isMobile = false, onClose }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchProducts = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await privateClient.get(
        `/products/search`,
        {
          params: { name: searchQuery },
        }
      );
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleProductClick = () => {
    setShowResults(false);
    setSearchQuery("");
    if (onClose) onClose();
  };
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="TÌM KIẾM SẢN PHẨM"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${
            isMobile ? "w-full" : "w-80"
          } pl-10 pr-10 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-transparent text-sm`}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Đang tìm kiếm...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm uppercase">
                  SẢN PHẨM ({searchResults.length})
                </h3>
              </div>
              <div className="divide-y">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={handleProductClick}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].image_url}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 mb-1">
                        {product.category?.name || "Chưa phân loại"}
                      </p>
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {product.name}
                      </h4>
                      <p className="text-sm font-semibold text-red-600">
                        {formatPrice(product.basePrice)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-3 border-t bg-gray-50 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={handleProductClick}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Xem thêm {searchResults.length} sản phẩm →
                </Link>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Không tìm thấy sản phẩm nào</p>
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
