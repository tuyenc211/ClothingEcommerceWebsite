"use client";

import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const {
    items,
    getTotalItems,
    getCartSummary,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  // Get stores to populate variant info
  const { getProduct } = useProductStore();
  const { colors } = useColorStore();
  const { sizes } = useSizeStore();

  const itemCount = getTotalItems();
  const summary = getCartSummary();
  const router = useRouter();

  // Enrich cart items with full product, color, and size info
  const enrichedItems = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;

        const product = getProduct(variant.product_id);
        const color = colors.find((c) => c.id === variant.color_id);
        const size = sizes.find((s) => s.id === variant.size_id);

        return {
          ...item,
          product,
          color,
          size,
        };
      })
      .filter(Boolean); // Remove null items
  }, [items, getProduct, colors, sizes]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Giỏ hàng</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-6 h-6" />
          <h1 className="text-xl md:text-2xl font-semibold">
            Giỏ hàng của bạn
          </h1>
          {itemCount > 0 && (
            <Badge variant="outline" className="ml-2">
              {itemCount} sản phẩm
            </Badge>
          )}
        </div>

        {/* Main Content */}
        {enrichedItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa có sản phẩm nào trong giỏ hàng
              </p>
              <Button asChild>
                <Link href="/">Tiếp tục mua sắm</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items - Takes 2/3 on large screens */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Sản phẩm trong giỏ</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={clearCart}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa tất cả
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {enrichedItems.map((item) => {
                      if (!item || !item.product) return null;

                      const productImage =
                        item.product.images?.[0]?.imageUrl ||
                        "/images/placeholder.jpg";

                      return (
                        <div key={item.id} className="p-4 sm:p-6">
                          <div className="flex gap-3 items-start">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <Image
                                src={productImage}
                                alt={item.product.name}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover w-16 h-16 sm:w-20 sm:h-20"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                                {item.product.name}
                              </h4>

                              <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                {item.color && (
                                  <div className="flex items-center gap-2">
                                    <span>Màu:</span>
                                    <div
                                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: item.color.code,
                                      }}
                                    />
                                    <span>{item.color.name}</span>
                                  </div>
                                )}
                                {item.size && (
                                  <div>Kích thước: {item.size.code}</div>
                                )}
                                {item.variant?.sku && (
                                  <div className="text-gray-400">
                                    SKU: {item.variant.sku}
                                  </div>
                                )}
                              </div>

                              <div className="font-semibold text-sm sm:text-base text-gray-900">
                                {formatPrice(item.unit_price)}
                              </div>

                              {/* Stock status */}
                              {item.variant?.inventory && (
                                <div className="mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      item.variant.inventory.quantity > 10
                                        ? "bg-green-100 text-green-800"
                                        : item.variant.inventory.quantity > 0
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {item.variant.inventory.quantity > 0
                                      ? `Còn ${item.variant.inventory.quantity} sản phẩm`
                                      : "Hết hàng"}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500 p-1 h-8 w-8"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>

                              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-white"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity === 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-6 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-white"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={
                                    item.variant?.inventory
                                      ? item.quantity >=
                                        item.variant.inventory.quantity
                                      : false
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Item total */}
                              <div className="text-sm font-semibold text-gray-900 mt-2">
                                {formatPrice(item.unit_price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Takes 1/3 on large screens, full width on mobile */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                  <CardDescription>
                    {enrichedItems.length} sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">
                        {formatPrice(summary.subtotal)}
                      </span>
                    </div>
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span className="font-medium">
                          -{formatPrice(summary.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">
                        {summary.shipping === 0
                          ? "Miễn phí"
                          : formatPrice(summary.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thuế (VAT 10%):</span>
                      <span className="font-medium">
                        {formatPrice(summary.tax)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {formatPrice(summary.total)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Bạn có thể nhập mã giảm giá ở trang thanh toán
                  </p>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => router.push("/checkout")}
                    >
                      Tiếp tục đến thanh toán
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full hover:bg-black hover:text-white"
                      size="lg"
                      onClick={() => router.push("/")}
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
