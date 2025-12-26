"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { OrderStatusBadge, PaymentMethodBadge } from "./StatusBadges";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Order,
  OrderStatus,
  useUpdateOrderStatus,
} from "@/services/orderService";
=======
import { formatCurrency } from "@/lib/utils";
import {Order, OrderStatus, useUpdateOrderStatus} from "@/services/orderService";
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c

interface OrderTableProps {
  orders: Order[];
}

<<<<<<< HEAD
=======
export const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  // Get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      NEW: ["NEW", "CONFIRMED", "CANCELLED"],
      CONFIRMED: ["CONFIRMED", "PACKING", "CANCELLED"],
      PACKING: ["PACKING", "SHIPPED"],
      SHIPPED: ["SHIPPED", "DELIVERED"],
      DELIVERED: ["DELIVERED"],
      CANCELLED: ["CANCELLED"],
    };
    return statusFlow[currentStatus] || [currentStatus];
  };

  // Get status label in Vietnamese
  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      NEW: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PACKING: "Đang đóng gói",
      SHIPPED: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  // Get status color classes for select
  const getStatusSelectClass = (status: OrderStatus): string => {
    const colorClasses: Record<OrderStatus, string> = {
      NEW: "bg-gray-100 text-gray-800 border-gray-300",
      CONFIRMED: "bg-yellow-100 text-yellow-800 border-yellow-300",
      PACKING: "bg-purple-100 text-purple-800 border-purple-300",
      SHIPPED: "bg-green-100 text-green-800 border-green-300",
      DELIVERED: "bg-blue-100 text-blue-800 border-blue-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    };
    return colorClasses[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const handleViewInvoice = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg font-medium">
          Không tìm thấy đơn hàng
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Thử điều chỉnh bộ lọc để xem thêm kết quả
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Thời gian đặt</TableHead>
            <TableHead>Tên khách hàng</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
            <TableHead>Hóa đơn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.code}</TableCell>
              <TableCell>
                {order.createdAt ? formatDate(order.createdAt) : "N/A"}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {order.user?.fullName || order.customerName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.user?.email || order.customerEmail || "N/A"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={order.paymentMethod} />
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(order.grandTotal)}
              </TableCell>
              <TableCell>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus({
                      orderId: order.id,
                      status: e.target.value as OrderStatus,
                    })
                  }
                  className={`rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${getStatusSelectClass(
                    order.status
                  )}`}
                  disabled={
                    order.status === "DELIVERED" || order.status === "CANCELLED"
                  }
                >
                  {getValidNextStatuses(order.status).map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewInvoice(order.id)}
                  title="Xem hóa đơn"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
