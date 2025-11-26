"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Product, useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import ProductGrid from "@/app/products/_components/ProductGrid";
import { productKeys, useProductsQuery } from "@/services/productService";
import { convertProductToItemProps } from "@/app/products/_components/ProductItem";
import {
  Breadcrumb,
  BreadcrumbItem,
  Link,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { priceRanges } from "@/lib/utils";
// Filter interface
interface Filters {
  categoryId?: number;
  priceRange: [number, number];
  colorIds: number[];
  sizeIds: number[];
  sortBy: "name" | "price" | "rating" | "newest";
  sortOrder: "asc" | "desc";
}
export default function ParentCategoryPage() {
  const { data: products = [] } = useProductsQuery();
  const { parentcategory } = useParams();
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Stores
  const { getPublishedProducts } = useProductStore();
  const { getCategoryBySlug, getChildCategories } = useCategoryStore();
  const { colors } = useColorStore();
  const { sizes } = useSizeStore();

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 5000000],
    colorIds: [],
    sizeIds: [],
    sortBy: "newest",
    sortOrder: "desc",
  });

  // Get parent category from slug
  const parentCategory = useMemo(() => {
    if (typeof parentcategory === "string") {
      return getCategoryBySlug(parentcategory);
    }
    return null;
  }, [parentcategory, getCategoryBySlug]);

  const categoryTitle = parentCategory?.name || "Danh mục";

  // Get child categories
  const childCategories = useMemo(() => {
    if (parentCategory) {
      return getChildCategories(parentCategory.id).filter(
        (cat) => cat.isActive
      );
    }
    return [];
  }, [parentCategory, getChildCategories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (parentCategory) {
      const categoryIds = [
        parentCategory.id,
        ...childCategories.map((c) => c.id),
      ];
      filtered = filtered.filter(
        (product) =>
          product.category.id && categoryIds.includes(product.category.id)
      );
    }

    // Apply category filter (specific child category)
    if (filters.categoryId) {
      filtered = filtered.filter(
        (product) => product.category.id === filters.categoryId
      );
    }

    // Apply price range filter (using base_price or variant prices)
    filtered = filtered.filter((product) => {
      return (
        product.basePrice >= filters.priceRange[0] &&
        product.basePrice <= filters.priceRange[1]
      );
    });

    // Apply color filter (check variants)
    if (filters.colorIds.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some(
          (v) => v.color?.id && filters.colorIds.includes(v.color.id)
        )
      );
    }

    // Apply size filter (check variants)
    if (filters.sizeIds.length > 0) {
      filtered = filtered.filter((product) =>
        product.variants?.some(
          (v) => v.size?.id && filters.sizeIds.includes(v.size.id)
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
  }, [
    getPublishedProducts,
    parentCategory,
    childCategories,
    filters,
    products,
  ]);

  // Convert to ProductItemProps format and apply display limit
  const displayedProducts = useMemo(() => {
    return filteredProducts
      .slice(0, displayCount)
      .map(convertProductToItemProps);
  }, [filteredProducts, displayCount]);

  // Handle load more
  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 12, filteredProducts.length));
      setIsLoading(false);
    }, 1000);
  };
  // Handle filter changes
  const handleCategoryFilter = (categoryId: number) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
    setDisplayCount(12);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{categoryTitle}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryTitle}
          </h1>
          <p className="text-gray-600">{filteredProducts.length} sản phẩm</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div
            className={`w-64 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Danh mục con
                </h3>
                <div className="space-y-2">
                  {childCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        filters.categoryId === category.id
                          ? "bg-blue-100 text-blue-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

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
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorFilter(color.id)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        filters.colorIds.includes(color.id)
                          ? "border-blue-500 ring-2 ring-blue-200"
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
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeFilter(size.id)}
                      className={`py-2 px-3 border rounded-md text-xs font-medium transition-colors ${
                        filters.sizeIds.includes(size.id)
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
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
