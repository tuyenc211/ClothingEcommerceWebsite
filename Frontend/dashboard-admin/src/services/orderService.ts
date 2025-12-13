import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Product } from "@/stores/productStore";
export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "WALLET";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "PARTIAL";

export interface OrderItem {
  id: number;
  orderId: number;
  product: Product;
  variantId?: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Shipment {
  id: number;
  orderId: number;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  shippedAt?: string;
  deliveredAt?: string;
}
export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddressSnapshot?: Record<string, unknown>;
  placedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
  shipments?: Shipment[];
  userId?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    user?: {
        id: number;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
}

// API functions
export const orderService = {
  getALLOrders: async (): Promise<Order[]> => {
    const response = await privateClient.get(`/orders`);
    return response.data;
  },
  getOrderById: async (orderId: number): Promise<Order> => {
    const response = await privateClient.get(`/orders/${orderId}`);
    return response.data;
  },
  cancelOrder: async (userId: number, orderId: number): Promise<void> => {
    await privateClient.patch(`/orders/${userId}/${orderId}/cancel`);
  },
  updateOrderStatus: async (
    orderId: number,
    status: OrderStatus
  ): Promise<void> => {
    await privateClient.patch(`/orders/${orderId}/status?status=${status}`);
  },
};
export const useAllOrder = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getALLOrders(),
  });
};
export const useOrderById = (orderId: number) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, orderId }: { userId: number; orderId: number }) =>
      orderService.cancelOrder(userId, orderId),
    onSuccess: (_, variables) => {
      // Invalidate user orders
      queryClient.invalidateQueries({
        queryKey: ["orders", "user", variables.userId],
      });
      // Invalidate specific order
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.orderId],
      });
      // Invalidate products (to update stock)
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      toast.success("Đã hủy đơn hàng thành công!");
    },
    onError: (error) => {
      console.error("Failed to cancel order:", error);
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    },
  });
};
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
      toast.error(
        "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau."
      );
    },
  });
};
export default orderService;
