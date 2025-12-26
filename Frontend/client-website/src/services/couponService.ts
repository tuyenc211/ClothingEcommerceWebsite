import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
<<<<<<< HEAD
import { compareDesc } from "date-fns";
=======
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c

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
<<<<<<< HEAD

    return data.sort((a: Coupon, b: Coupon) => {
      if (!a.startsAt || !b.startsAt) return 0;
      return compareDesc(new Date(a.startsAt), new Date(b.startsAt));
=======
    return data.sort((a: Coupon, b: Coupon) => {
      if (!a.startsAt || !b.startsAt) return 0;
      return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
    });
  },

  getAvailableCoupons: async (
    userId: number,
    orderTotal: number
  ): Promise<Coupon[]> => {
    const response = await privateClient.get("/coupons/available", {
      params: { userId, orderTotal },
    });
    const data = response.data || [];
    return data.sort((a: Coupon, b: Coupon) => {
      if (!a.startsAt || !b.startsAt) return 0;
<<<<<<< HEAD
      return compareDesc(new Date(a.startsAt), new Date(b.startsAt));
    });
  },
};
=======
      return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
    });
  },};
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
export const useAllCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: () => couponService.getAllCoupons(),
  });
};

export const useAvailableCoupons = (
  userId: number | undefined,
  orderTotal: number
) => {
  return useQuery({
    queryKey: ["coupons", "available", userId, orderTotal],
    queryFn: () => couponService.getAvailableCoupons(userId!, orderTotal),
    enabled: !!userId && orderTotal > 0,
  });
};
export default couponService;
