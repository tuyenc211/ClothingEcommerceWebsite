import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
<<<<<<< HEAD
import { format } from "date-fns";
import { vi } from "date-fns/locale";
=======
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c

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
<<<<<<< HEAD

export const formatDate = (
  dateString: string | undefined
): string | undefined => {
  if (!dateString) return dateString;
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
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
=======
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
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
