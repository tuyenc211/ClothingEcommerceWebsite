import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { Order } from "./orderStore";
import { AxiosError } from "axios";

// Review interface matching database schema
export interface Review {
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
}

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;

  // Review CRUD operations
  addReview: (
    review: Omit<Review, "id" | "createdAt" | "is_approved">
  ) => Promise<void>;
  updateReview: (id: number, review: Partial<Review>) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
  approveReview: (id: number) => Promise<void>;
  rejectReview: (id: number) => Promise<void>;

  // Fetching methods
  fetchReviewsByProduct: (product_id: number) => Promise<void>;
  fetchReviewsByUser: (user_id: number) => Promise<Review[]>;
  // Filtering and searching
  getApprovedReviews: () => Review[];
  getPendingReviews: () => Review[];
  getReviewsByRating: (rating: number) => Review[];

  // Statistics
  getAverageRating: (product_id: number) => number;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      isLoading: false,
      error: null,

      // Review CRUD operations
      addReview: async (reviewData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.post("/reviews", {
            userId: reviewData.user_id,
            productId: reviewData.product_id,
            orderId: reviewData.order_id,
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
          });

          const newReview: Review = {
            id: response.data.id,
            product_id: response.data.product.id,
            user_id: response.data.user.id,
            order_id: response.data.order?.id,
            rating: response.data.rating,
            title: response.data.title,
            content: response.data.content,
            is_approved: response.data.is_approved,
            createdAt: response.data.createdAt,
            user: {
              id: response.data.user.id,
              fullName: response.data.user.fullName,
              email: response.data.user.email,
            },
            product: {
              id: response.data.product.id,
              name: response.data.product.name,
              slug: response.data.product.slug,
            },
          };

          set((state) => ({
            reviews: [...state.reviews, newReview],
            isLoading: false,
          }));
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể thêm đánh giá. Vui lòng thử lại.";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateReview: async (id, reviewData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(`/reviews/${id}`, {
            userId: reviewData.user_id,
            productId: reviewData.product_id,
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
          });

          const updatedReview: Review = {
            id: response.data.id,
            product_id: response.data.product.id,
            user_id: response.data.user.id,
            order_id: response.data.order?.id,
            rating: response.data.rating,
            title: response.data.title,
            content: response.data.content,
            is_approved: response.data.is_approved,
            createdAt: response.data.createdAt,
            user: {
              id: response.data.user.id,
              fullName: response.data.user.fullName,
              email: response.data.user.email,
            },
            product: {
              id: response.data.product.id,
              name: response.data.product.name,
              slug: response.data.product.slug,
            },
          };

          set((state) => ({
            reviews: state.reviews.map((review) =>
              review.id === id ? updatedReview : review
            ),
            isLoading: false,
          }));
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể cập nhật đánh giá. Vui lòng thử lại.";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteReview: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const review = get().reviews.find((r) => r.id === id);
          if (!review) throw new Error("Review not found");

          await privateClient.delete(`/reviews/${id}`, {
            params: { userId: review.user_id },
          });

          set((state) => ({
            reviews: state.reviews.filter((review) => review.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể xóa đánh giá. Vui lòng thử lại.";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      approveReview: async (id) => {
        await get().updateReview(id, { is_approved: true });
      },

      rejectReview: async (id) => {
        await get().updateReview(id, { is_approved: false });
      },

      fetchReviewsByProduct: async (product_id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(
            `/reviews/product/${product_id}`
          );

          const reviews: Review[] = response.data.map((Review: Review) => ({
            id: Review.id,
            product_id: Review.product?.id,
            user_id: Review.user?.id,
            rating: Review.rating,
            title: Review.title,
            content: Review.content,
            is_approved: Review?.is_approved,
            createdAt: Review.createdAt,
            user: {
              id: Review.user?.id,
              fullName: Review.user?.fullName,
              email: Review.user?.email,
            },
            product: {
              id: Review.product?.id,
              name: Review.product?.name,
              slug: Review.product?.slug,
            },
          }));

          set({ isLoading: false, reviews });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMsg =
            axiosError?.response?.data?.message ||
            "Không thể tải đánh giá. Vui lòng thử lại.";
          set({ error: errorMsg, isLoading: false });
        }
      },

      fetchReviewsByUser: async (user_id) => {
        const { reviews } = get();
        return reviews.filter((review) => review.user_id === user_id);
      },

      getApprovedReviews: () => {
        const { reviews } = get();
        return reviews.filter((review) => review.is_approved);
      },

      getPendingReviews: () => {
        const { reviews } = get();
        return reviews.filter((review) => !review.is_approved);
      },

      getReviewsByRating: (rating) => {
        const { reviews } = get();
        return reviews.filter((review) => review.rating === rating);
      },
      getAverageRating: (product_id) => {
        const { reviews } = get();
        const productReviews = reviews.filter(
          (review) => review.product_id === product_id && review.is_approved
        );

        if (productReviews.length === 0) return 0;

        const totalRating = productReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        return totalRating / productReviews.length;
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "review-storage",
      partialize: (state) => ({
        reviews: state.reviews,
      }),
    }
  )
);
