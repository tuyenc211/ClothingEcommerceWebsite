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
