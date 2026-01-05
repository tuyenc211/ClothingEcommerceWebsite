import { Category } from "./category";
import { Review } from "./review";

export interface Color {
  id: number;
  name: string;
  code: string;
}

export interface Size {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  position: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size: Size;
  color: Color;
  price: number;
  product?: Product;
  inventory?: Inventory;
}

export interface Inventory {
  id: number;
  variant_id: number;
  productVariant: ProductVariant;
  quantity: number;
}

// Product interface matching products table
export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  category: Category;
  isPublished: boolean;

  // Relationships (populated from joins)
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  colors?: Array<{ id: number; name: string; code: string }>;
  sizes?: Array<{ id: number; name: string; code: string; sortOrder: number }>;
  inventories?: Inventory[];
  // Computed fields
  totalQuantity?: number;
}
