"use client";
import { OrderTable } from "@/app/(dashboard)/orders/_components/OrderTable";
import {CheckCircle, Clock, DollarSign, ShoppingBag} from "lucide-react";
import {formatCurrency} from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import {usePagination} from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";
import { useAllOrder} from "@/services/orderService";
export default function OrdersPage() {
  const {
   data: orders =[],
    isLoading,
  } = useAllOrder();
    const totalOrders = orders.length;
    const totalRevenue = orders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + o.grandTotal, 0);
    const pendingOrders = orders.filter((o) => o.status === "NEW").length;
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
    const statscard = [
        {
            title: "Tổng đơn hàng",
            value: totalOrders.toString(),
            icon: ShoppingBag,
        },
        {
            title: "Tổng doanh thu",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
        },
        {
            title: "Đơn chờ xử lý",
            value: pendingOrders.toLocaleString(),
            icon: Clock,
        },
        {
            title: "Đơn hoàn thành",
            value: deliveredOrders.toLocaleString(),
            icon: CheckCircle,
        },
    ];
    const {
        currentPage,
        setPage,
        totalPages,
        startIndex,
        endIndex,
        pageNumbers,
        slice,
    } = usePagination({
        totalItems: orders.length,
        itemsPerPage: 10,
        showPages: 5,
    });
  const paginatedOrders = slice(orders);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng</h1>
        <p className="text-gray-600">
          Quản lý và theo dõi đơn hàng ({orders.length} tổng cộng)
        </p>
      </div>

      {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
            {statscard.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
      {/* Orders Table */}
      <OrderTable orders={paginatedOrders || []} />

      {/* Pagination */}
      {totalPages > 1 && (
          <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setPage}
          />
      )}

      {/* Results info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Hiển thị {startIndex + 1}-{Math.min(endIndex, orders.length)} trong{" "}
        {orders.length} đơn hàng
      </div>
    </div>
  );
}
