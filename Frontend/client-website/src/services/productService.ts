import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { Product, useProductStore } from "@/stores/productStore";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { queryClient } from "@/lib/react-query";
import { useEffect } from "react";

// Query key factory
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

// ============= QUERIES =============

/**
 * Hook để lấy danh sách tất cả sản phẩm (không có filter)
 * GET /products - Lấy tất cả sản phẩm
 */
export const useProductsQuery = () => {
  const { setProducts } = useProductStore();
  const query = useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const response = await privateClient.get("/products");
      return (response.data?.data || response.data || []) as Product[];
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setProducts(query.data);
    }
  }, [query.isSuccess, query.data, setProducts]);

  return query;
};

/**
 * Hook để lấy chi tiết sản phẩm theo ID
 */
export const useProductQuery = (productId: number | null) => {
  return useQuery({
    queryKey: productKeys.detail(productId!),
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const response = await privateClient.get(`/products/${productId}`);
      return (response.data?.data || response.data) as Product;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ============= MUTATIONS (Chỉ dành cho admin) =============

/**
 * Hook để tạo sản phẩm mới
 */
export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (productData: Omit<Product, "id">) => {
      const response = await privateClient.post("/products", productData);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Tạo sản phẩm thành công");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi tạo sản phẩm");
    },
  });
};

/**
 * Hook để cập nhật sản phẩm
 */
export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({
      productId,
      productData,
    }: {
      productId: number;
      productData: Partial<Product>;
    }) => {
      const response = await privateClient.put(
        `/products/${productId}`,
        productData
      );
      return response.data?.data || response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Cập nhật sản phẩm thành công");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
    },
  });
};

/**
 * Hook để xóa sản phẩm
 */
export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (productId: number) => {
      return await privateClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Xóa sản phẩm thành công");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    },
  });
};

/**
 * Hook để upload ảnh sản phẩm
 */
export const useUploadProductImages = () => {
  return useMutation({
    mutationFn: async ({
      productId,
      images,
    }: {
      productId: number;
      images: File[];
    }) => {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await privateClient.post(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Upload ảnh thành công");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi upload ảnh");
    },
  });
};

/**
 * Hook để xóa ảnh sản phẩm
 */
export const useDeleteProductImage = () => {
  return useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: number;
      imageId: number;
    }) => {
      return await privateClient.delete(
        `/products/${productId}/images/${imageId}`
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Xóa ảnh thành công");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa ảnh");
    },
  });
};
