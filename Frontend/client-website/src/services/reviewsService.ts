import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Review, CreateReviewData } from "@/types";
export const reviewService = {
  getReviewsByProduct: async (productId: number): Promise<Review[]> => {
    const response = await privateClient.get(`/reviews/product/${productId}`);
    return response.data;
  },

  getReviewsByUser: async (userId: number | undefined): Promise<Review[]> => {
    const response = await privateClient.get(`/reviews/user/${userId}`);
    return response.data;
  },
  createReview: async (reviewData: CreateReviewData): Promise<Review> => {
    const response = await privateClient.post("/reviews", reviewData);
    return response.data;
  },

  deleteReview: async (reviewId: number, userId: number): Promise<void> => {
    await privateClient.delete(`/reviews/${reviewId}`, {
      params: { userId },
    });
  },
};
export const useReviewsByProduct = (productId: number) => {
  return useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: () => reviewService.getReviewsByProduct(productId),
    enabled: !!productId,
  });
};

export const useReviewsByUser = (userId: number | undefined) => {
  return useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: () => reviewService.getReviewsByUser(userId),
    enabled: !!userId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: CreateReviewData) =>
      reviewService.createReview(reviewData),
    onSuccess: (_, variables) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", variables.product_id],
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({
        queryKey: ["reviews", "user", variables.user_id],
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, userId }: { reviewId: number; userId: number }) =>
      reviewService.deleteReview(reviewId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
      });
    },
  });
};

export default reviewService;
