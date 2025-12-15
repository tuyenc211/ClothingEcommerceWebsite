import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface Size {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

export type SizeFormData = Omit<Size, "id">;

export const sizeService = {
  getAllSizes: async (): Promise<Size[]> => {
    const response = await privateClient.get("/sizes");
    return response.data;
  },
  getSizeById: async (id: number): Promise<Size> => {
    const response = await privateClient.get(`/sizes/${id}`);
    return response.data;
  },
  createSize: async (data: SizeFormData): Promise<Size> => {
    const response = await privateClient.post("/sizes", data);
    return response.data;
  },
  updateSize: async (id: number, data: SizeFormData): Promise<Size> => {
    const response = await privateClient.put(`/sizes/${id}`, data);
    return response.data;
  },
  deleteSize: async (id: number): Promise<void> => {
    await privateClient.delete(`/sizes/${id}`);
  },
};

export const useSizes = () => {
  return useQuery({
    queryKey: ["sizes"],
    queryFn: () => sizeService.getAllSizes(),
  });
};

export const useSizeById = (id: number) => {
  return useQuery({
    queryKey: ["sizes", id],
    queryFn: () => sizeService.getSizeById(id),
    enabled: !!id,
  });
};

export const useCreateSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SizeFormData) => sizeService.createSize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
      toast.success("Thêm kích thước thành công");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Lỗi khi thêm kích thước"
      );
    },
  });
};

export const useUpdateSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SizeFormData }) =>
      sizeService.updateSize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
      toast.success("Cập nhật kích thước thành công");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Lỗi khi cập nhật kích thước"
      );
    },
  });
};

export const useDeleteSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sizeService.deleteSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
      toast.success("Xóa kích thước thành công");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Lỗi khi xóa kích thước"
      );
    },
  });
};
