import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useEffect } from "react";
import {Product} from "@/types";
import {useProductStore} from "@/stores/productStore";

// Query key factory
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

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
export const useProductQuery = (productId: number | null) => {
  return useQuery({
    queryKey: productKeys.detail(productId!),
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const response = await privateClient.get(`/products/${productId}`);
      return (response.data?.data || response.data) as Product;
    },
    enabled: !!productId,
    refetchOnWindowFocus: false,
  });
};

export const useCreateProduct = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (productData: Omit<Product, "id">) => {
      const response = await privateClient.post("/products", productData);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: productKeys.lists() });
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
  const client = useQueryClient();
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
      client.invalidateQueries({ queryKey: productKeys.lists() });
      client.invalidateQueries({
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
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      return await privateClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: productKeys.lists() });
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
  const client = useQueryClient();
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
      client.invalidateQueries({
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
  const client = useQueryClient();
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
      client.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Xóa ảnh thành công");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa ảnh");
    },
  });
};
