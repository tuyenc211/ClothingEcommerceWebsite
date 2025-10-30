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
import { Order } from "@/stores/orderStore";
import { OrderStatusBadge, PaymentMethodBadge } from "./StatusBadges";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();

  const handleViewInvoice = (orderId: number) => {
    router.push(`/user/orders/${orderId}`);
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
              METHOD
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              AMOUNT
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              STATUS
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
                {formatDate(order.createdAt || "")}
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={order.paymentMethod} />
              </TableCell>
              <TableCell className="font-medium">
                {formatPrice(order.grandTotal)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
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
