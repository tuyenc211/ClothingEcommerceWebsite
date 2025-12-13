"use client";
import { useParams, useRouter } from "next/navigation";
import { InvoiceTemplate } from "@/components/orders/InvoiceTemplate";
import { Button } from "@/components/ui/button";
import { ArrowLeft, } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {useOrderById} from "@/services/orderService";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);
const {data: order, isLoading} = useOrderById(orderId)
  const handleGoBack = () => {
    router.push("/orders");
  };
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng bạn tìm kiếm không tồn tại hoặc có thể đã bị xóa.
          </p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại đơn hàng
          </Button>
        </div>
      </div>
    );
  }

  // Normal view layout
  return (
    <div className="p-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleGoBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hóa đơn</h1>
              <p className="text-gray-600">Order #{order.code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <InvoiceTemplate order={order} />
    </div>
  );
}
