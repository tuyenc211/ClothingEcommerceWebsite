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
import { useOrderStore, Order, OrderStatus } from "@/stores/orderStore";
import { OrderStatusBadge, PaymentMethodBadge } from "./StatusBadges";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
interface OrderTableProps {
  orders: Order[];
}
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
export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const { updateOrderStatus } = useOrderStore();

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
      NEW: "Mới",
      CONFIRMED: "Đã xác nhận",
      PACKING: "Đang đóng gói",
      SHIPPED: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const handleViewInvoice = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">No orders found</div>
        <div className="text-gray-400">
          Try adjusting your filters to see more results
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">
              INVOICE NO
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              ORDER TIME
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              CUSTOMER NAME
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              METHOD
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              AMOUNT
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              STATUS
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              ACTION
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              INVOICE
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">#{order.code}</TableCell>
              <TableCell className="text-gray-600">
                {order.createdAt ? formatDate(order.createdAt) : "N/A"}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">
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
              <TableCell className="font-medium">
                {formatCurrency(order.grandTotal)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="form-control border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleViewInvoice(order.id)}
                    title="View Invoice"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
