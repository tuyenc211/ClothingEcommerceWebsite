"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import UserLayout from "@/components/layouts/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Package, MessageSquare } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";

import { formatPrice } from "@/lib/utils";
import {useReviewsByUser} from "@/services/reviewsService";
import {Order, useUserOrders} from "@/services/orderService";
interface ReviewableProduct {
  orderId: number;
  orderCode: string;
  productId: number;
  productName: string;
  variantId?: number;
  sku: string;
  unitPrice: number;
  quantity: number;
  hasReviewed: boolean;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { authUser } = useAuthStore();
    const {data: orders, }:{ data: Order[] | undefined } =useUserOrders({ userId: authUser?.id });
    const {data:userReviews = [], isLoading} = useReviewsByUser(authUser?.id);
  const reviewableProducts = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const products: ReviewableProduct[] = [];

    // Filter only DELIVERED orders
    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    );
    console.log("Delivered Orders:", deliveredOrders);

    deliveredOrders.forEach((order) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          // Skip if product data is missing
          if (!item.product?.id) return;

          // Check if user has already reviewed this product for this order
          const hasReviewed = userReviews.some(
            (review) =>
              review.product?.id === item.product.id &&
              review.order?.id === order.id
          );

          products.push({
            orderId: order.id,
            orderCode: order.code,
            productId: item.product.id,
            productName: item.productName,
            variantId: item.variantId,
            sku: item.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            hasReviewed,
          });
        });
      }
    });

    return products;
  }, [orders, userReviews]);

  const handleReviewClick = (productId: number, orderId: number) => {
    router.push(`/products/${productId}?review=true&orderId=${orderId}`);
  };

  if (isLoading) {
    return (
      <UserLayout>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Đang tải...</span>
            </div>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <CardTitle>Đánh Giá Của Tôi</CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Đánh giá sản phẩm từ các đơn hàng đã hoàn thành
          </p>
        </CardHeader>
        <CardContent>
          {reviewableProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có sản phẩm nào để đánh giá
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa có đơn hàng nào hoàn thành hoặc đã đánh giá tất cả sản
                phẩm
              </p>
              <Button onClick={() => router.push("/")}>Tiếp tục mua sắm</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewableProducts.map((product, index) => (
                <div
                  key={`${product.orderId}-${product.productId}-${index}`}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {product.productName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Mã đơn: {product.orderCode}</span>
                            <span>•</span>
                            <span>SKU: {product.sku}</span>
                          </div>
                          <div className="text-sm text-gray-900 mt-1">
                            {formatPrice(product.unitPrice)} x{" "}
                            {product.quantity}
                          </div>
                        </div>

                        {/* Review Status & Action */}
                        <div className="flex flex-col items-end gap-2">
                          {product.hasReviewed ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Đã đánh giá
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleReviewClick(
                                  product.productId,
                                  product.orderId
                                )
                              }
                              className="gap-2"
                            >
                              <Star className="w-4 h-4" />
                              Đánh giá ngay
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </UserLayout>
  );
}
