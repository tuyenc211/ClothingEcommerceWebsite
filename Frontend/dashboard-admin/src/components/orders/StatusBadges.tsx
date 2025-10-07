import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentMethod } from "@/stores/orderStore";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusConfig: Record<
    OrderStatus,
    {
      label: string;
      variant: "secondary";
      className: string;
    }
  > = {
    NEW: {
      label: "Mới",
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      variant: "secondary" as const,
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    },
    PACKING: {
      label: "Đang đóng gói",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    SHIPPED: {
      label: "Đang giao",
      variant: "secondary" as const,
      className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    },
    DELIVERED: {
      label: "Đã giao",
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    CANCELLED: {
      label: "Đã hủy",
      variant: "secondary" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  className?: string;
}

export function PaymentMethodBadge({
  method,
  className,
}: PaymentMethodBadgeProps) {
  const methodConfig: Record<
    PaymentMethod,
    {
      label: string;
      className: string;
    }
  > = {
    COD: {
      label: "Tiền mặt",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    WALLET: {
      label: "Ví điện tử",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

  const config = methodConfig[method];

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
