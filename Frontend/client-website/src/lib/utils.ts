import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | undefined | null) {
  if (price === undefined || price === null || isNaN(price)) {
    return "0 ₫";
  }
  return price.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}
