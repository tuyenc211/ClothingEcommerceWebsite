import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
<<<<<<< HEAD
import { Order } from "@/services/orderService";
interface CreateReviewData {
  user_id: number | undefined;
=======
import {Order} from "@/services/orderService";
interface CreateReviewData {
  user_id: number;
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
  product_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  content?: string;
}

export interface Review {
<<<<<<< HEAD
  id: number;
  product_id: number;
  user_id: number;
  order?: Order;
  order_id?: number;
  rating: number;
  title?: string;
  content?: string;
  is_approved: boolean;
  createdAt: string;

  // Populated fields from joins
  user?: {
    id: number;
    fullName: string;
    email?: string;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
=======
    id: number;
    product_id: number;
    user_id: number;
    order?: Order;
    order_id?: number;
    rating: number;
    title?: string;
    content?: string;
    is_approved: boolean;
    createdAt: string;

    // Populated fields from joins
    user?: {
        id: number;
        fullName: string;
        email?: string;
    };
    product?: {
        id: number;
        name: string;
        slug: string;
    };
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
}
export const reviewService = {
  getReviewsByProduct: async (productId: number): Promise<Review[]> => {
    const response = await privateClient.get(`/reviews/product/${productId}`);
    return response.data;
  },

<<<<<<< HEAD
  getReviewsByUser: async (userId: number | undefined): Promise<Review[]> => {
=======
  getReviewsByUser: async (userId: number| undefined): Promise<Review[]> => {
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
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
