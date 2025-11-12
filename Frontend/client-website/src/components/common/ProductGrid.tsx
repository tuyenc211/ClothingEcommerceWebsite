import React from "react";
import ProductItem, { ProductItemProps } from "./ProductItem";

interface ProductGridProps {
  products: ProductItemProps[];
  title?: string;
  subtitle?: string;
  onAddToCart?: (productId: number) => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onAddToCart,
  showLoadMore = false,
  onLoadMore,
  isLoading = false,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9M16 13h2m-6 0h2m0 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v4.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Không có sản phẩm nào
        </h3>
        <p className="text-gray-500">
          Hiện tại chưa có sản phẩm nào trong danh mục này.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center w-full gap-4 px-8 max-w-6xl mx-auto my-10">
          <div className="h-[2px] bg-gradient-to-r from-[#111111] to-[#EEEEEE] flex-1" />
          {title && (
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          <div className="h-[2px] bg-gradient-to-r from-[#EEEEEE] to-[#111111] flex-1" />
        </div>
      )}

      {/* Products Grid */}
      <div className=" grid grid-cols-2 md:grid-cols-4  gap-6">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            {...product}
          />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Load More Button */}
      {showLoadMore && !isLoading && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Xem thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
