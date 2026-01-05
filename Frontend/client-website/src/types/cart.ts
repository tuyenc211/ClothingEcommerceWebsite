import { ProductVariant, ProductImage } from "./product";

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number;
  unitPrice: number;
  quantity: number;
  variant?: ProductVariant;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

export interface EnrichedCartItem extends CartItem {
  product?: {
    id: number;
    name: string;
    sku?: string;
    basePrice: number;
    images?: ProductImage[];
    inventories?: Array<{
      id: number;
      quantity: number;
      productVariant: ProductVariant;
    }>;
  };
  color?: {
    id: number;
    name: string;
    code: string;
  };
  size?: {
    id: number;
    code: string;
    name: string;
  };
  maxStock?: number;
}
