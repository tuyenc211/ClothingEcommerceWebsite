import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {Product} from "@/stores/productStore";
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

export interface OrderStatusHistory {
    id: number;
    orderId: number;
    fromStatus?: string;
    toStatus: string;
    changedBy?: number;
    changedAt: string;
    note?: string;
}

export interface CreateOrderRequest {
    paymentMethod: PaymentMethod;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        province: string;
    };
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
    statusHistory?: OrderStatusHistory[];
}

// API functions
export const orderService = {
  getUserOrders: async (userId: { userId: number | undefined }): Promise<Order[]> => {
    const response = await privateClient.get(`/orders/user/${userId}`);
    return response.data;
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    const response = await privateClient.get(`/orders/${orderId}`);
    return response.data;
  },

  createOrder: async (
    userId: number,
    request: CreateOrderRequest
  ): Promise<Order> => {
    const response = await privateClient.post(`/orders/${userId}`, request);
    return response.data;
  },

  cancelOrder: async (userId: number, orderId: number): Promise<void> => {
    await privateClient.patch(`/orders/${userId}/${orderId}/cancel`);
  },
};

// React Query Hooks
export const useUserOrders = (userId: { userId: number | undefined }) => {
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => orderService.getUserOrders(userId!),
    enabled: !!userId,
  });
};

export const useOrderById = (orderId: number) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: number;
      request: CreateOrderRequest;
    }) => orderService.createOrder(userId, request),
    onSuccess: (data, variables) => {
      // Invalidate user orders
      queryClient.invalidateQueries({
        queryKey: ["orders", "user", variables.userId],
      });
      // Invalidate cart
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
      toast.success("Đặt hàng thành công!");
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
      toast.error("Không thể đặt hàng. Vui lòng thử lại sau.");
    },
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

export default orderService;
