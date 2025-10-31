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

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const { updateOrderStatus } = useOrderStore();

  const handleViewInvoice = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  const formatDate = (dateString: string) => {
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
                {formatDate(order.created_at)}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">
                    {order.customerName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail || "N/A"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={order.payment_method} />
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(order.grand_total)}
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
                >
                  <option value="NEW">Mới</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PACKING">Đang đóng gói</option>
                  <option value="SHIPPED">Đang giao</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="CANCELLED">Đã hủy</option>
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
