import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { compareDesc } from "date-fns";

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  value: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderTotal?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  imageUrl?: string;
}

export const couponService = {
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await privateClient.get("/coupons");
    const data = response.data.data || response.data;

    return data.sort((a: Coupon, b: Coupon) => {
      if (!a.startsAt || !b.startsAt) return 0;
      return compareDesc(new Date(a.startsAt), new Date(b.startsAt));
    });
  },

  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await privateClient.get(`/coupons/${id}`);
    return response.data.data || response.data;
  },

  addCoupon: async (
    couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt">,
    image?: File
  ): Promise<Coupon> => {
    const response = await privateClient.post("/coupons", couponData);
    const newCoupon = response.data.data || response.data;

    if (image && newCoupon.id) {
      const formData = new FormData();
      formData.append("file", image);
      await privateClient.post(
        `/coupons/${newCoupon.id}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    return newCoupon;
  },

  updateCoupon: async (
    id: number,
    couponData: Partial<Coupon>,
    image?: File
  ): Promise<Coupon> => {
    const response = await privateClient.put(`/coupons/${id}`, couponData);
    const updatedCoupon = response.data.data || response.data;

    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      await privateClient.post(`/coupons/${id}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return updatedCoupon;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await privateClient.delete(`/coupons/${id}`);
  },
};
export const useAllCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: () => couponService.getAllCoupons(),
  });
};

export const useCouponById = (id: number) => {
  return useQuery({
    queryKey: ["coupons", id],
    queryFn: () => couponService.getCouponById(id),
    enabled: !!id,
  });
};
export const useAddCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      couponData,
      image,
    }: {
      couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt">;
      image?: File;
    }) => couponService.addCoupon(couponData, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Thêm mã giảm giá thành công");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể thêm mã giảm giá";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      couponData,
      image,
    }: {
      id: number;
      couponData: Partial<Coupon>;
      image?: File;
    }) => couponService.updateCoupon(id, couponData, image),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupons", variables.id] });
      toast.success("Cập nhật mã giảm giá thành công");
    },
    onError: (error:any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể cập nhật mã giảm giá";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Xóa mã giảm giá thành công");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể xóa mã giảm giá";
      toast.error(errorMessage);
    },
  });
};

export default couponService;
