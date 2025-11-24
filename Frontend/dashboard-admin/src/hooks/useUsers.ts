import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { User } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useUserStore } from "@/stores/userStore";
export const useUsers = () => {
  const { users: storeUsers } = useUserStore();

  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await privateClient.get("/users");
      const data = response.data?.data || response.data || [];

      useUserStore.setState({ users: data });

      return data;
    },
    initialData: storeUsers.length > 0 ? storeUsers : undefined,
    staleTime: 5 * 60 * 1000,
  });
};

// Toggle user status mutation
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      // Get current users from cache to determine the endpoint
      const users = queryClient.getQueryData<User[]>(["users"]) || [];
      const currentUser = users.find((user) => user.id === userId);

      if (!currentUser) {
        throw new Error("Không tìm thấy người dùng");
      }

      const endpoint = currentUser.isActive
        ? `/users/${userId}/lock`
        : `/users/${userId}/unlock`;

      await privateClient.put(endpoint);

      return { userId, wasActive: currentUser.isActive };
    },
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      // Optimistically update the cache
      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old) return old;
        return old.map((user) =>
          user.id === userId ? { ...user, isActive: !user.isActive } : user
        );
      });

      return { previousUsers };
    },
    onError: (error, userId, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }

      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi thay đổi trạng thái";

      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      const newStatus = data.wasActive ? "không hoạt động" : "hoạt động";
      toast.success(`Đã thay đổi trạng thái tài khoản thành ${newStatus}`);
    },
    onSettled: () => {
      // Refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await privateClient.delete(`/users/${userId}`);
      return userId;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      // Optimistically remove the user
      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old) return old;
        return old.filter((user) => user.id !== userId);
      });

      return { previousUsers };
    },
    onError: (error, userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }

      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa tài khoản";

      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Xóa tài khoản thành công!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: number;
      userData: Partial<User>;
    }) => {
      await privateClient.put(`/users/change/${userId}`, {
        fullName: userData.fullName,
        phone: userData.phone,
      });
      return { userId, userData };
    },
    onMutate: async ({ userId, userData }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      // Optimistically update the user
      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old) return old;
        return old.map((user) =>
          user.id === userId
            ? {
                ...user,
                fullName: userData.fullName || user.fullName,
                phone: userData.phone || user.phone,
              }
            : user
        );
      });

      return { previousUsers };
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }

      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi cập nhật tài khoản";

      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Cập nhật tài khoản thành công!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
