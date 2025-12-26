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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
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
=======
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
