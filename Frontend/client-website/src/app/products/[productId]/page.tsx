"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Heart, ShoppingCart, Plus, Minus, CreditCard } from "lucide-react";
import { Product, useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import ProductImageGallery from "@/components/features/images/ThumnailGallery";
import { formatPrice } from "@/lib/utils";
import { Color } from "@/stores/colorStore";
import { Size } from "@/stores/sizeStore";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  Link,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ColorSelector from "@/app/products/_components/ColorsSelector";
import SizeSelector from "@/app/products/_components/SizeSelector";
import ProductTabs from "@/app/products/_components/ProductTabs";
import {Review, useReviewsByProduct} from "@/services/reviewsService";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    data: product,
    isLoading,
  }: { data: Product | undefined; isLoading: boolean } = useQuery({
    queryKey: ["product", parseInt(productId as string)],
    queryFn: async () => {
      const response = await privateClient.get(`/products/${productId}`);
      return response.data?.data || response.data;
    },
    enabled: !!productId,
  });
  const { data: reviews }: { data: Review[] | undefined } = useReviewsByProduct(
    product ? product.id : 0
  );
  const { addToCart, buyNow, items } = useCartStore();
  const orderId = parseInt(searchParams.get("orderId") || "0", 10);
  useEffect(() => {
    const shouldReview = searchParams.get("review");
    if (shouldReview === "true") {
      setActiveTab("reviews");
    }
  }, [searchParams]);
  const variants = product?.variants || [];
  const availableColors = product?.colors || [];
  const availableSizes = product?.sizes || [];
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

  // Tính số lượng đã có trong giỏ cho variant này
  const quantityInCart = useMemo(() => {
    if (!selectedVariant) return 0;

    const cartItem = items.find(
      (item) => item.variant?.id === selectedVariant.id
    );
    return cartItem ? cartItem.quantity : 0;
  }, [selectedVariant, items]);

  // maxQuantity = tồn kho - số lượng đã trong giỏ
  const maxQuantity = useMemo(() => {
    const stock = selectedQuantity || 0;
    const remaining = stock - quantityInCart;
    return Math.max(0, remaining);
  }, [selectedQuantity, quantityInCart]);

  const getStockStatus = () => {
    if (!selectedVariant) return null;

    const stock = selectedQuantity || 0;

    if (stock === 0) {
      return { text: "Hết hàng", class: "bg-red-100 text-red-800" };
    }

    if (stock <= 10) {
      return {
        text: `Còn hàng: ${stock}`,
        class: "bg-yellow-100 text-yellow-800",
      };
    }

    return {
      text: `Còn hàng: ${stock}`,
      class: "bg-green-100 text-green-800",
    };
  };

  const stockStatus = getStockStatus();

  // Handlers
  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment" && quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: Size) => {
    setSelectedSize(size);
  };

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
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

    // Check nếu đã thêm hết vào giỏ
    if (maxQuantity === 0) {
      toast.error("Bạn đã thêm hết số lượng có sẵn vào giỏ hàng");
      return;
    }

    // Check số lượng muốn thêm
    if (quantity > maxQuantity) {
      toast.error(
        `Chỉ có thể thêm tối đa ${maxQuantity} sản phẩm${
          quantityInCart > 0 ? ` (đã có ${quantityInCart} trong giỏ)` : ""
        }`
      );
      return;
    }

    if (!selectedQuantity || selectedQuantity === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    addToCart(selectedVariant, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);

    // Reset quantity về 1 sau khi thêm
    setQuantity(1);
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

    // Check inventory (buy now dùng selectedQuantity vì sẽ clear cart)
    if (selectedQuantity && selectedQuantity < quantity) {
      toast.error(`Chỉ còn ${selectedQuantity} sản phẩm`);
      return;
    }

    if (!selectedQuantity || selectedQuantity === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    try {
      await buyNow(selectedVariant, quantity);
      router.push("/checkout");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi mua hàng");
    }
  };
  const isOutOfStock = selectedVariant && selectedQuantity === 0;
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
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb - RESPONSIVE */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          {/* Breadcrumb using shadcn/ui */}
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link href="/categories">Danh mục</Link>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <Link href={`/products?category=${product.category.id}`}>
                      {product.category.name}
                    </Link>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link>{product.name}</Link>
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
                  ({reviews?.length || 0} đánh giá)
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
            <ColorSelector
              availableColors={availableColors}
              selectedColor={selectedColor}
              onSelectColor={handleColorSelect}
            />
            {/* Size Selection */}
            <SizeSelector
              availableSizes={availableSizes}
              selectedSize={selectedSize}
              onSelectSize={handleSizeSelect}
            />
            // Quantity
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
                  <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= maxQuantity) {
                        setQuantity(value);
                      } else if (value > maxQuantity) {
                        setQuantity(maxQuantity);
                        toast.warning(`Chỉ còn ${maxQuantity} sản phẩm`);
                      } else {
                        setQuantity(1);
                      }
                    }}
                    className="w-24 text-center"
                  />
                  <button
                    onClick={() => handleQuantityChange("increment")}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Warning message when cart is full */}
              {maxQuantity === 0 && quantityInCart > 0 && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Bạn đã thêm hết số lượng có sẵn vào giỏ hàng (
                    {quantityInCart}/{selectedQuantity})
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Vui lòng xóa bớt trong giỏ hàng nếu muốn điều chỉnh số lượng
                  </p>
                </div>
              )}

              {/* Info message when some items in cart */}
              {maxQuantity > 0 && quantityInCart > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Đã có {quantityInCart} sản phẩm trong giỏ. Có thể thêm
                    tối đa {maxQuantity} sản phẩm nữa.
                  </p>
                </div>
              )}
            </div>
            {/* Add to Cart Button */}
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
            {/* Product Details */}
          </div>
        </div>

        {/* Tabs Section - Description & Reviews */}
        <ProductTabs
          product={product}
          reviews={reviews || []}
          orderId={orderId}
          activeTab={activeTab}
          setActiveTab={handleActiveTab}
        />
      </div>
    </div>
  );
}
