"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useCartStore } from "@/stores/cartStore";
import ProductGrid from "@/components/common/ProductGrid";
import { convertProductToItemProps } from "@/components/common/ProductItem";
import { formatPrice } from "@/lib/utils";

// Filter interface
interface Filters {
  priceRange: [number, number];
  colorIds: number[];
  sizeIds: number[];
  sortBy: "name" | "price" | "rating" | "newest";
  sortOrder: "asc" | "desc";
}

export default function SubCategoryPage() {
  const { parentcategory, subcategory } = useParams();
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Stores
  const { getPublishedProducts } = useProductStore();
  const { getCategoryBySlug } = useCategoryStore();
  const { colors } = useColorStore();
  const { sizes } = useSizeStore();
  const { addToCart } = useCartStore();

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 5000000],
    colorIds: [],
    sizeIds: [],
    sortBy: "newest",
    sortOrder: "desc",
  });

  // Get parent and sub category from slugs
  const parentCategory = useMemo(() => {
    if (typeof parentcategory === "string") {
      return getCategoryBySlug(parentcategory);
    }
    return null;
  }, [parentcategory, getCategoryBySlug]);

  const subCategory = useMemo(() => {
    if (typeof subcategory === "string") {
      return getCategoryBySlug(subcategory);
    }
    return null;
  }, [subcategory, getCategoryBySlug]);

  const categoryTitle = subCategory?.name || "Danh mục";

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // Start with published products
    let filtered = getPublishedProducts();

    // Filter by subcategory
    if (subCategory) {
      filtered = filtered.filter(
        (product) => product.category.id === subCategory.id
      );
    }

    // Apply price range filter (using base_price or variant prices)
    filtered = filtered.filter((product) => {
      // Check if product base price is in range
      if (
        product.basePrice >= filters.priceRange[0] &&
        product.basePrice <= filters.priceRange[1]
      ) {
        return true;
      }
      // Or check if any variant price is in range
      if (product.variants && product.variants.length > 0) {
        return product.variants.some(
          (v) =>
            v.price >= filters.priceRange[0] && v.price <= filters.priceRange[1]
        );
      }
      return false;
    });

    // Apply color filter (check variants)
    if (filters.colorIds.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some(
          (v) => v.color.id && filters.colorIds.includes(v.color.id)
        )
      );
    }

    // Apply size filter (check variants)
    if (filters.sizeIds.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some(
          (v) => v.size.id && filters.sizeIds.includes(v.size.id)
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.basePrice - b.basePrice;
          break;
        case "rating":
          // @ts-expect-error - rating is optional in Product type
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "newest":
          comparison = b.id - a.id; // Higher ID = newer
          break;
        default:
          break;
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [getPublishedProducts, subCategory, filters]);

  // Convert to ProductItemProps format and apply display limit
  const displayedProducts = useMemo(() => {
    return filteredProducts
      .slice(0, displayCount)
      .map(convertProductToItemProps);
  }, [filteredProducts, displayCount]);
  // Get available colors and sizes from filtered products
  const availableColors = useMemo(() => {
    const colorIds = new Set<number>();
    filteredProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.color.id) colorIds.add(variant.color.id);
      });
    });
    return colors.filter((c) => colorIds.has(c.id));
  }, [filteredProducts, colors]);

  const availableSizes = useMemo(() => {
    const sizeIds = new Set<number>();
    filteredProducts.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.size.id) sizeIds.add(variant.size.id);
      });
    });
    return sizes.filter((s) => sizeIds.has(s.id));
  }, [filteredProducts, sizes]);

  // Handle load more
  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 12, filteredProducts.length));
      setIsLoading(false);
    }, 1000);
  };

  // Handle add to cart
  const handleAddToCart = (productId: number) => {
    const product = filteredProducts.find((p) => p.id === productId);
    if (!product || !product.variants || product.variants.length === 0) {
      alert("Sản phẩm không có biến thể!");
      return;
    }

    // Use first available variant
    const firstVariant = product.variants[0];
    addToCart(firstVariant, 1);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleColorFilter = (colorId: number) => {
    setFilters((prev) => ({
      ...prev,
      colorIds: prev.colorIds.includes(colorId)
        ? prev.colorIds.filter((id) => id !== colorId)
        : [...prev.colorIds, colorId],
    }));
    setDisplayCount(12);
  };

  const handleSizeFilter = (sizeId: number) => {
    setFilters((prev) => ({
      ...prev,
      sizeIds: prev.sizeIds.includes(sizeId)
        ? prev.sizeIds.filter((id) => id !== sizeId)
        : [...prev.sizeIds, sizeId],
    }));
    setDisplayCount(12);
  };

  const handlePriceRangeFilter = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
    setDisplayCount(12);
  };

  const handleSortChange = (
    sortBy: Filters["sortBy"],
    sortOrder: Filters["sortOrder"]
  ) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 5000000],
      colorIds: [],
      sizeIds: [],
      sortBy: "newest",
      sortOrder: "desc",
    });
    setDisplayCount(12);
  };

  // Price range options
  const priceRanges = [
    { label: "Tất cả giá", value: [0, 5000000] as [number, number] },
    { label: formatPrice(500000), value: [0, 500000] as [number, number] },
    {
      label: formatPrice(500000) + " - " + formatPrice(1000000),
      value: [500000, 1000000] as [number, number],
    },
    {
      label: formatPrice(1000000) + " - " + formatPrice(2000000),
      value: [1000000, 2000000] as [number, number],
    },
    {
      label: formatPrice(2000000) + " - " + formatPrice(5000000),
      value: [2000000, 5000000] as [number, number],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Trang chủ
                </Link>
              </li>
              {parentCategory && (
                <li>
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <Link
                      href={`/categories/${parentCategory.slug}`}
                      className="text-gray-500 hover:text-gray-700 ml-1 md:ml-2"
                    >
                      {parentCategory.name}
                    </Link>
                  </div>
                </li>
              )}
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-500 ml-1 md:ml-2">
                    {categoryTitle}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryTitle}
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div
            className={`w-64 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeFilter(range.value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        filters.priceRange[0] === range.value[0] &&
                        filters.priceRange[1] === range.value[1]
                          ? "bg-blue-100 text-blue-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Màu sắc</h3>
                <div className="grid grid-cols-6 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorFilter(color.id)}
                      className={`w-8 h-8 rounded-full border ${
                        filters.colorIds.includes(color.id)
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Kích cỡ</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeFilter(size.id)}
                      className={`px-4 py-2 border rounded-sm text-sm font-medium transition-colors ${
                        filters.sizeIds.includes(size.id)
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {size.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gray-100 p-2 rounded-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
                <span className="text-gray-600">
                  Hiển thị {Math.min(displayCount, filteredProducts.length)} /{" "}
                  {filteredProducts.length} sản phẩm
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    handleSortChange(
                      sortBy as Filters["sortBy"],
                      sortOrder as Filters["sortOrder"]
                    );
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest-desc">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                  <option value="name-desc">Tên: Z-A</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={displayedProducts}
              onAddToCart={handleAddToCart}
              showLoadMore={displayCount < filteredProducts.length}
              onLoadMore={handleLoadMore}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
