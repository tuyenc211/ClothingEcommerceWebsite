import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { CartItem } from "@/stores/cartStore";
import { toast } from "sonner";
import useAuthStore from "@/stores/useAuthStore";
import { AxiosError } from "axios";
import { queryClient } from "@/lib/react-query";

export const useCartQuery = () => {
  const userId = useAuthStore((state) => state.authUser?.id);

  return useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await privateClient.get(`/carts/${userId}`);
      return (response.data?.data || response.data || []) as CartItem[];
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useAddToCart = () => {
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
      return await privateClient.post(
        `/carts/${userId}/add?variantId=${variantId}&quantity=${quantity}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
    },
  });
};

export const useRemoveFromCart = () => {
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async (itemId: number) => {
      if (!userId) throw new Error("User not authenticated");
      return await privateClient.delete(`/carts/${userId}/remove/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
      toast.success("Đã xóa khỏi giỏ hàng");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    },
  });
};

export const useUpdateCartQuantity = () => {
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
      return await privateClient.put(
        `/carts/${userId}/update?itemId=${itemId}&quantity=${quantity}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    },
  });
};

export const useClearCart = () => {
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      return await privateClient.delete(`/carts/${userId}/clear`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa giỏ hàng");
    },
  });
};
