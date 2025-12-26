import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Ticket, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CartSummary } from "@/stores/cartStore";
import { EnrichedCartItem } from "@/types/cart";
import { Coupon } from "@/services/couponService";

interface OrderSummaryProps {
  items: EnrichedCartItem[];
  summary: CartSummary;
  appliedCoupon: Coupon | null;
  availableCoupons: Coupon[];
  showCouponList: boolean;
  isSubmitting: boolean;
  paymentMethod?: "COD" | "WALLET";
  onToggleCouponList: () => void;
  onApplyCoupon: (couponCode: string) => void;
  onRemoveCoupon: () => void;
  onSubmitOrder: (e?: any) => Promise<void>;
  onBackToCart: () => void;
}

export default function OrderSummary({
  items,
  summary,
  appliedCoupon,
  availableCoupons,
  showCouponList,
  isSubmitting,
  paymentMethod = "COD",
  onToggleCouponList,
  onApplyCoupon,
  onRemoveCoupon,
  onSubmitOrder,
  onBackToCart,
}: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Products List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => {
          if (!item || !item.product) return null;

          const productImage =
            item.product.images?.[0]?.image_url || "/images/placeholder.jpg";

          return (
            <div key={item.id} className="flex gap-3">
              <div className="relative flex-shrink-0">
                <Image
                  src={productImage}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="secondary"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2">
                  {item.product.name}
                </h4>
                <div className="text-xs text-gray-500 mt-1">
                  {item.color?.name && (
                    <span>
                      {item.color.name}
                      {item.size?.code && " / "}
                    </span>
                  )}
                  {item.size?.code && <span>{item.size.code}</span>}
                </div>
                <div className="text-sm font-medium mt-1">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Coupon Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          <Label>Mã giảm giá</Label>
        </div>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {appliedCoupon.code}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveCoupon}
              className="text-red-500 hover:text-red-700 h-8"
            >
              Hủy
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={onToggleCouponList}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Chọn mã giảm giá
          </Button>
        )}

        {/* Coupon List */}
        {showCouponList && !appliedCoupon && (
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
            {availableCoupons.length > 0 ? (
              availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onApplyCoupon(coupon.code)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {coupon.code}
                      </Badge>
                      <span className="text-sm font-medium">
                        Giảm {coupon.value}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {coupon.description || coupon.name}
                    </p>
                    {coupon.minOrderTotal && (
                      <p className="text-xs text-gray-400 mt-1">
                        Đơn tối thiểu: {formatPrice(coupon.minOrderTotal)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                Không có mã giảm giá khả dụng
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
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
            {formatPrice(summary.shippingFee)}
          </span>
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Tổng cộng:</span>
        <span className="text-primary">{formatPrice(summary.total)}</span>
      </div>

      {/* Checkout Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={onSubmitOrder}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
      </Button>

      <Button variant="ghost" className="w-full" onClick={onBackToCart}>
        Quay lại giỏ hàng
      </Button>
    </div>
  );
}
