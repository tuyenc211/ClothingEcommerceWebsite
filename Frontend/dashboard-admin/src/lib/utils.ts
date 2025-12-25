import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

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
