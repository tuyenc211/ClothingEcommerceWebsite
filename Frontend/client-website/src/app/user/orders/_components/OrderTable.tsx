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
import { formatDate, formatPrice } from "@/lib/utils";
import {Order} from "@/services/orderService";
interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();

  const handleViewInvoice = (orderId: number) => {
    router.push(`/user/orders/${orderId}`);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">
          Không tìm thấy đơn hàng
        </div>
        <div className="text-gray-400">
          Thử điều chỉnh bộ lọc để xem thêm kết quả
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
              MÃ ĐƠN HÀNG
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              THỜI GIAN ĐẶT
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              PHƯƠNG THỨC
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              SỐ TIỀN
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              TRẠNG THÁI
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              HÓA ĐƠN
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
                    title="Xem hóa đơn"
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
