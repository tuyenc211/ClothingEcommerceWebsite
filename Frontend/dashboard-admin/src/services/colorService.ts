import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface Color {
  id: number;
  name: string;
  code: string;
}

export type ColorFormData = Omit<Color, "id">;

export const colorService = {
  getAllColors: async (): Promise<Color[]> => {
    const response = await privateClient.get("/colors");
    return response.data;
  },
  getColorById: async (id: number): Promise<Color> => {
    const response = await privateClient.get(`/colors/${id}`);
    return response.data;
  },
  createColor: async (data: ColorFormData): Promise<Color> => {
    const response = await privateClient.post("/colors", data);
    return response.data;
  },
  updateColor: async (id: number, data: ColorFormData): Promise<Color> => {
    const response = await privateClient.put(`/colors/${id}`, data);
    return response.data;
  },
  deleteColor: async (id: number): Promise<void> => {
    await privateClient.delete(`/colors/${id}`);
  },
};

export const useColors = () => {
  return useQuery({
    queryKey: ["colors"],
    queryFn: () => colorService.getAllColors(),
  });
};

export const useColorById = (id: number) => {
  return useQuery({
    queryKey: ["colors", id],
    queryFn: () => colorService.getColorById(id),
    enabled: !!id,
  });
};

export const useCreateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ColorFormData) => colorService.createColor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      toast.success("Thêm màu thành công");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Lỗi khi thêm màu");
    },
  });
};

export const useUpdateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ColorFormData }) =>
      colorService.updateColor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      toast.success("Cập nhật màu thành công");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Lỗi khi cập nhật màu");
    },
  });
};

export const useDeleteColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => colorService.deleteColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      toast.success("Xóa màu thành công");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Lỗi khi xóa màu");
    },
  });
};
