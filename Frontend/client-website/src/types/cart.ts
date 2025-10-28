import { CartItem } from "@/stores/cartStore";
import { ProductImage, ProductVariant } from "@/stores/productStore";

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
