"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Heart, ShoppingCart, Plus, Minus, CreditCard } from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import ProductImageGallery from "@/components/common/ThumnailGallery";
import { formatPrice } from "@/lib/utils";
import { Color } from "@/stores/colorStore";
import { Size } from "@/stores/sizeStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import ReviewForm from "@/app/user/reviews/_component/ReviewForm";
import ReviewList from "@/app/user/reviews/_component/ReviewList";
import { useReviewStore } from "@/stores/reviewStore";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stores
  const { getProduct } = useProductStore();
  const { addToCart, buyNow } = useCartStore();
  const { fetchReviewsByProduct, reviews } = useReviewStore();
  const product = useMemo(() => {
    if (typeof productId === "string") {
      const id = parseInt(productId, 10);
      if (!isNaN(id)) {
        return getProduct(id);
      }
    }
    return undefined;
  }, [productId, getProduct]);
  const orderId = parseInt(searchParams.get("orderId") || "0", 10);

  // Fetch reviews when product loads
  useEffect(() => {
    if (product?.id) {
      fetchReviewsByProduct(product.id);
    }
  }, [product?.id, fetchReviewsByProduct]);

  // Check if should open review tab
  useEffect(() => {
    const shouldReview = searchParams.get("review");
    if (shouldReview === "true") {
      setActiveTab("reviews");
    }
  }, [searchParams]);

  // Get product variants
  const variants = useMemo(() => {
    if (product) {
      return product.variants || [];
    }
    return [];
  }, [product]);
  const availableColors = useMemo(() => {
    return product?.colors || [];
  }, [product]);

  const availableSizes = useMemo(() => {
    return product?.sizes || [];
  }, [product]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const variantQuantityMap = useMemo(() => {
    const map: Record<number, number> = {};
    if (product?.inventories) {
      product.inventories.forEach((inv) => {
        map[inv.productVariant.id] = inv.quantity;
      });
    }
    return map;
  }, [product]);
  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find(
      (v) => v.color.id === selectedColor.id && v.size.id === selectedSize.id
    );
  }, [selectedColor, selectedSize, variants]);
  const selectedQuantity = useMemo(() => {
    if (!selectedVariant) return 0;
    return variantQuantityMap[selectedVariant.id] ?? 0;
  }, [selectedVariant, variantQuantityMap]);
  const maxQuantity = selectedQuantity;
  const getStockStatus = () => {
    if (!selectedVariant) return null;
    const qty = selectedQuantity;
    if (qty === 0)
      return { text: "Hết hàng", class: "bg-red-100 text-red-800" };
    if (qty <= 10)
      return {
        text: `Còn hàng: ${qty}`,
        class: "bg-yellow-100 text-yellow-800",
      };
    return { text: `Còn hàng: ${qty}`, class: "bg-green-100 text-green-800" };
  };

  const stockStatus = getStockStatus();
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handlers
  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment" && quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }
    if (!selectedVariant) {
      toast.error("Phiên bản sản phẩm không khả dụng");
      return;
    }

    // Check inventory
    if (selectedQuantity && selectedQuantity < quantity) {
      toast.error(`Chỉ còn ${selectedQuantity} sản phẩm`);
      return;
    }

    if (!selectedQuantity || selectedQuantity === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    addToCart(selectedVariant, quantity);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }
    if (!selectedVariant) {
      toast.error("Phiên bản sản phẩm không khả dụng");
      return;
    }

    // Check inventory
    if (selectedQuantity && selectedQuantity < quantity) {
      toast.error(`Chỉ còn ${selectedQuantity} sản phẩm`);
      return;
    }

    if (!selectedQuantity || selectedQuantity === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    try {
      // Use buyNow function which clears cart and adds only this item
      await buyNow(selectedVariant, quantity);

      // Navigate to checkout immediately
      router.push("/checkout");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi mua hàng");
      console.error("Buy now error:", error);
    }
  };
  const isOutOfStock = !selectedQuantity || selectedQuantity === 0;
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <Rating value={fullStars} readOnly>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton className="text-yellow-500" key={index} />
        ))}
      </Rating>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb - RESPONSIVE */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          {/* Breadcrumb using shadcn/ui */}
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/categories">Danh mục</BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/products?category=${product.category.id}`}
                    >
                      {product.category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{product.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back button */}
        </div>
      </div>

      {/* Main content - FIXED RESPONSIVE */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images - FIXED FOR MOBILE */}
          <div className="w-full">
            <ProductImageGallery
              images={product.images?.map((img) => img.image_url) || []}
              productName={product.name}
              className="w-full"
            />
          </div>

          {/* Product Info - RESPONSIVE SPACING */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  {" "}
                  {/* Prevent overflow */}
                  <p className="text-sm text-gray-600 font-medium mb-1 sm:mb-2">
                    {product.category?.name || "Không có danh mục"}
                  </p>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 pr-2 leading-tight">
                    {product.name}
                  </h1>
                </div>
                <button
                  onClick={() => toast.info("Chức năng đang phát triển")}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${"text-gray-400"}`}
                  />
                </button>
              </div>

              {/* Rating - RESPONSIVE */}
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <div className="flex">{renderStars(averageRating)}</div>
                <span className="font-medium text-sm sm:text-base">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">
                  ({reviews.length || 0} đánh giá)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">
                {formatPrice(product.basePrice)}
              </span>
              {stockStatus && (
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${stockStatus.class}`}
                >
                  {stockStatus.text}
                </span>
              )}
            </div>

            {/* Color Selection - RESPONSIVE */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Màu sắc: {selectedColor?.name || "Chưa chọn"}
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-1 transition-all ${
                      selectedColor?.id === color.id
                        ? "border-gray-900 border-2 ring-2 ring-gray-300"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection - RESPONSIVE GRID */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Kích cỡ: {selectedSize?.code || "Chưa chọn"}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 sm:py-3 px-3 sm:px-4 border rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      selectedSize?.id === size.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                    }`}
                  >
                    {size.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity - RESPONSIVE */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Số lượng
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => handleQuantityChange("decrement")}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 sm:px-4 py-2 sm:py-3 min-w-[50px] sm:min-w-[60px] text-center font-medium text-sm sm:text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increment")}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button - RESPONSIVE */}
            <div className="space-y-3 sm:space-y-4 pt-4 ">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="w-full bg-gray-900 text-white py-6 px-4 sm:px-6 rounded-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>
                  {isOutOfStock ? "Sản phẩm hết hàng" : "Thêm vào giỏ hàng"}
                </span>
              </Button>

              {/* Buy Now Button */}
              <Button
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedColor}
                className="w-full bg-red-600 text-white py-6 px-4 sm:px-6 rounded-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>
                  {isOutOfStock ? "Sản phẩm đã hết hàng" : "Mua ngay"}
                </span>
              </Button>
            </div>

            {/* Product Details - RESPONSIVE */}
          </div>
        </div>

        {/* Tabs Section - Description & Reviews */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex items-start w-full grid-cols-2 mx-auto">
              <TabsTrigger value="description" className="text-sm sm:text-base">
                Mô tả sản phẩm
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm sm:text-base">
                Đánh giá ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="bg-white  p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Chi tiết sản phẩm
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {product.description ||
                      "Chưa có mô tả chi tiết cho sản phẩm này."}
                  </p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Thông số kỹ thuật:
                      </h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>
                          <strong>Mã SKU:</strong> {product.sku}
                        </li>
                        <li>
                          <strong>Danh mục:</strong>{" "}
                          {product.category?.name || "Không có"}
                        </li>
                        <li>
                          <strong>Màu sắc:</strong>{" "}
                          {availableColors.map((c) => c.name).join(", ") ||
                            "Không có"}
                        </li>
                        <li>
                          <strong>Kích cỡ:</strong>{" "}
                          {availableSizes.map((s) => s.code).join(", ") ||
                            "Không có"}
                        </li>
                        <li>
                          <strong>Giá cơ bản:</strong>{" "}
                          {formatPrice(product.basePrice)}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Hướng dẫn sử dụng:
                      </h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>Giặt ở nhiệt độ dưới 30°C</li>
                        <li>Không sử dụng chất tẩy</li>
                        <li>Phơi trong bóng râm</li>
                        <li>Ủi ở nhiệt độ thấp</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Đánh giá của khách hàng
                  </h3>
                  <ReviewForm
                    productId={product.id}
                    orderId={orderId}
                    onSuccess={() => {
                      fetchReviewsByProduct(product.id);
                    }}
                  />
                </div>
                {/* Review List */}
                <ReviewList productId={product.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
