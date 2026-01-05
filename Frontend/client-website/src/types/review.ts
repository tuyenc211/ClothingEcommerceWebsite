import { Order } from "./order";
export interface CreateReviewData {
  user_id: number | undefined;
  product_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  content?: string;
}

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
