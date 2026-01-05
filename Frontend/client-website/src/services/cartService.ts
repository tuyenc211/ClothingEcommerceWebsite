import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import useAuthStore from "@/stores/useAuthStore";
import { AxiosError } from "axios";
import {CartItem} from "@/types";

export const cartService = {
  getCartItems: async (userId: number): Promise<CartItem[]> => {
    if (!userId) return [];
    const response = await privateClient.get(`/carts/${userId}`);
    return (response.data?.data || response.data || []) as CartItem[];
  },

  addToCart: async (userId: number, variantId: number, quantity: number) => {
    return await privateClient.post(
      `/carts/${userId}/add?variantId=${variantId}&quantity=${quantity}`
    );
  },

  removeFromCart: async (userId: number, itemId: number) => {
    return await privateClient.delete(`/carts/${userId}/remove/${itemId}`);
  },

  updateQuantity: async (userId: number, itemId: number, quantity: number) => {
    return await privateClient.put(
      `/carts/${userId}/update?itemId=${itemId}&quantity=${quantity}`
    );
  },

  clearCart: async (userId: number) => {
    return await privateClient.delete(`/carts/${userId}/clear`);
  },
};

export const useCartQuery = () => {
  const userId = useAuthStore((state) => state.authUser?.id);

  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => cartService.getCartItems(userId!),
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useAddToCart = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: number;
      quantity: number;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      return await cartService.addToCart(userId, variantId, quantity);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
    },
  });
};

export const useRemoveFromCart = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async (itemId: number) => {
      if (!userId) throw new Error("User not authenticated");
      return await cartService.removeFromCart(userId, itemId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Đã xóa khỏi giỏ hàng");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    },
  });
};

export const useUpdateCartQuantity = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      return await cartService.updateQuantity(userId, itemId, quantity);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    },
  });
};

export const useClearCart = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      return await cartService.clearCart(userId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa giỏ hàng");
    },
  });
};

export default cartService;
