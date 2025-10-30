"use client";

import { useState, useMemo } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    getTotalItems,
    getCartSummary,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();
  const { getProduct } = useProductStore();
  const itemCount = getTotalItems();
  const summary = getCartSummary();

  // Enrich cart items with full product, color, and size info
  const enrichedItems = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;
        const product = getProduct(variant.product?.id || variant.product_id);
        let maxStock = Infinity; // fallback an toàn
        if (product?.inventories) {
          const inv = product.inventories.find(
            (inv) => inv.productVariant.id === variant.id
          );
          if (inv) {
            maxStock = inv.quantity;
          }
        }
        return {
          ...item,
          product,
          color: variant.color,
          size: variant.size,
          maxStock,
        };
      })
      .filter(Boolean);
  }, [items, getProduct]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="md:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 p-4">
            <ShoppingCart className="w-5 h-5" />
            Giỏ hàng của bạn
            {itemCount > 0 && (
              <Badge variant="outline">{itemCount} sản phẩm</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {enrichedItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa có sản phẩm nào trong giỏ hàng
              </p>
              <Button asChild onClick={() => setIsOpen(false)}>
                <Link href="/">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {enrichedItems.map((item) => {
                  if (!item || !item.product) return null;

                  const productImage =
                    item.product.images?.[0]?.image_url ||
                    "/images/placeholder.jpg";

                  return (
                    <div key={item.id} className="flex gap-3 p-3 bg-white">
                      <div className="flex-shrink-0">
                        <Image
                          src={productImage}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                          {item.color && (
                            <div className="flex items-center gap-2">
                              <span>Màu:</span>
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: item.color.code,
                                }}
                              />
                              <span>{item.color.name}</span>
                            </div>
                          )}
                          {item.size && <div>Kích thước: {item.size.code}</div>}
                        </div>
                        <div className="mt-2 font-medium text-sm">
                          {formatPrice(item.unitPrice)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.maxStock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(summary.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {summary.shipping === 0
                        ? "Miễn phí"
                        : formatPrice(summary.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thuế:</span>
                    <span>{formatPrice(summary.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">
                      {formatPrice(summary.total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-4">
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/cart">Xem giỏ hàng</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">Thanh toán</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-red-500"
                    onClick={() => {
                      clearCart();
                      setIsOpen(false);
                    }}
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
