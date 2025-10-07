import { create } from "zustand";
import { persist } from "zustand/middleware";

// Review interface matching database schema
export interface Review {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  product_id: number; // BIGINT NOT NULL references products(id)
  user_id: number; // BIGINT NOT NULL references users(id)
  rating: number; // TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5)
  title?: string; // VARCHAR(255)
  content?: string; // TEXT
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
    review: Omit<Review, "id" | "createdAt" | "isApproved">
  ) => Promise<void>;
  updateReview: (id: number, review: Partial<Review>) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
  approveReview: (id: number) => Promise<void>;
  rejectReview: (id: number) => Promise<void>;

  // Fetching methods
  fetchReviews: () => Promise<void>;
  fetchReviewsByProduct: (product_id: number) => Promise<Review[]>;
  fetchReviewsByUser: (user_id: number) => Promise<Review[]>;
  getReview: (id: number) => Review | undefined;

  // Filtering and searching
  getApprovedReviews: () => Review[];
  getPendingReviews: () => Review[];
  getReviewsByRating: (rating: number) => Review[];

  // Statistics
  getAverageRating: (product_id: number) => number;
  getRatingDistribution: (product_id: number) => { [rating: number]: number };
  getTotalReviews: (product_id: number) => number;

  // State management
  setLoading: (loading: boolean) => void;
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
        set({ isLoading: true });
        try {
          // Mock API call - replace with actual API
          await new Promise((resolve) => setTimeout(resolve, 500));

          const newReview: Review = {
            ...reviewData,
            id: Date.now(),
            is_approved: true, // Reviews start as pending
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            reviews: [...state.reviews, newReview],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: "Không thể thêm đánh giá. Vui lòng thử lại.",
            isLoading: false,
          });
          throw error;
        }
      },

      updateReview: async (id, reviewData) => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          set((state) => ({
            reviews: state.reviews.map((review) =>
              review.id === id ? { ...review, ...reviewData } : review
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: "Không thể cập nhật đánh giá. Vui lòng thử lại.",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteReview: async (id) => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          set((state) => ({
            reviews: state.reviews.filter((review) => review.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: "Không thể xóa đánh giá. Vui lòng thử lại.",
            isLoading: false,
          });
          throw error;
        }
      },

      approveReview: async (id) => {
        await get().updateReview(id, { is_approved: true });
      },

      rejectReview: async (id) => {
        await get().updateReview(id, { is_approved: false });
      },

      // Fetching methods
      fetchReviews: async () => {
        set({ isLoading: true });
        try {
          // Mock API call - replace with actual API
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock data will be loaded from API
          set({ isLoading: false });
        } catch (error) {
          set({
            error: "Không thể tải đánh giá. Vui lòng thử lại.",
            isLoading: false,
          });
        }
      },

      fetchReviewsByProduct: async (product_id) => {
        const { reviews } = get();
        return reviews.filter(
          (review) => review.product_id === product_id && review.is_approved
        );
      },

      fetchReviewsByUser: async (user_id) => {
        const { reviews } = get();
        return reviews.filter((review) => review.user_id === user_id);
      },

      getReview: (id) => {
        const { reviews } = get();
        return reviews.find((review) => review.id === id);
      },

      // Filtering and searching
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
      // Statistics
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

      getRatingDistribution: (product_id) => {
        const { reviews } = get();
        const productReviews = reviews.filter(
          (review) => review.product_id === product_id && review.is_approved
        );

        const distribution: { [rating: number]: number } = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };

        productReviews.forEach((review) => {
          distribution[review.rating]++;
        });

        return distribution;
      },

      getTotalReviews: (product_id) => {
        const { reviews } = get();
        return reviews.filter(
          (review) => review.product_id === product_id && review.is_approved
        ).length;
      },

      // State management
      setLoading: (loading) => {
        set({ isLoading: loading });
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
