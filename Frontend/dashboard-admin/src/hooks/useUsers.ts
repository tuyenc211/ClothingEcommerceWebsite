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
    onError: (error, userId, context) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi thay đổi trạng thái";
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success('Đã thay đổi trạng thái tài khoản thành công');
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
      onSuccess: (_, variables) =>{

        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Xóa tài khoản thành công!");
      },
    onError: (error, userId, context) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa tài khoản";
      toast.error(errorMessage);
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
    onError: (error, variables, context) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi cập nhật tài khoản";
      toast.error(errorMessage);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Cập nhật tài khoản thành công!");
    },
  });
};
