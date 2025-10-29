import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";

// Review interface matching database schema
export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  content?: string;
  is_approved: boolean;
  created_at: string;

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
    review: Omit<Review, "id" | "created_at" | "is_approved">
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
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
          });

          const newReview: Review = {
            id: response.data.id,
            product_id: response.data.product.id,
            user_id: response.data.user.id,
            rating: response.data.rating,
            title: response.data.title,
            content: response.data.content,
            is_approved: response.data.is_approved,
            created_at: response.data.created_at,
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
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || "Không thể thêm đánh giá. Vui lòng thử lại.";
          set({ error: errorMsg, isLoading: false });
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
            rating: response.data.rating,
            title: response.data.title,
            content: response.data.content,
            is_approved: response.data.is_approved,
            created_at: response.data.created_at,
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
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || "Không thể cập nhật đánh giá. Vui lòng thử lại.";
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      deleteReview: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const review = get().reviews.find(r => r.id === id);
          if (!review) throw new Error("Review not found");

          await privateClient.delete(`/reviews/${id}`, {
            params: { userId: review.user_id }
          });

          set((state) => ({
            reviews: state.reviews.filter((review) => review.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || "Không thể xóa đánh giá. Vui lòng thử lại.";
          set({ error: errorMsg, isLoading: false });
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
          const response = await privateClient.get(`/reviews/product/${product_id}`);
          
          const reviews: Review[] = response.data.map((r: any) => ({
            id: r.id,
            product_id: r.product.id,
            user_id: r.user.id,
            rating: r.rating,
            title: r.title,
            content: r.content,
            is_approved: r.isApproved,
            created_at: r.createdAt,
            user: {
              id: r.user.id,
              fullName: r.user.fullName,
              email: r.user.email,
            },
            product: {
              id: r.product.id,
              name: r.product.name,
              slug: r.product.slug,
            },
          }));

          set({ isLoading: false, reviews });
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || "Không thể tải đánh giá. Vui lòng thử lại.";
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
