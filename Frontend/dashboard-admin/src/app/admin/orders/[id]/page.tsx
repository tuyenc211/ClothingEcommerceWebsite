"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrderStore } from "@/stores/orderStore";
import { InvoiceTemplate } from "@/components/orders/InvoiceTemplate";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);

  const { currentOrder, isLoading, fetchOrderById } = useOrderStore();

  useEffect(() => {
    if (orderId && !isNaN(orderId)) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);
  const handleGoBack = () => {
    router.push("/admin/orders");
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

  if (!currentOrder) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The order you&apos;re looking for doesn&apos;t exist or may have
            been deleted.
          </p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleGoBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
              <p className="text-gray-600">Order #{currentOrder.code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <InvoiceTemplate order={currentOrder} />
    </div>
  );
}
