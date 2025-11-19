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
export const formatDate = (dateString: string | undefined) => {
        if(!dateString) return dateString;
    try {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
};
 export const priceRanges = [
    { label: "Tất cả giá", value: [0, 5000000] as [number, number] },
    { label: formatPrice(500000), value: [0, 500000] as [number, number] },
    {
        label: formatPrice(500000) + " - " + formatPrice(1000000),
        value: [500000, 1000000] as [number, number],
    },
    {
        label: formatPrice(1000000) + " - " + formatPrice(2000000),
        value: [1000000, 2000000] as [number, number],
    },
    {
        label: formatPrice(2000000) + " - " + formatPrice(5000000),
        value: [2000000, 5000000] as [number, number],
    },
];