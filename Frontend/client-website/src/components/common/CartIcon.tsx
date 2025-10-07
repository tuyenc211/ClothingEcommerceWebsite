import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";

export function CartIcon() {
  const itemCount = useCartStore((state) => state.getTotalItems());

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs">
          {itemCount}
        </Badge>
      )}
    </div>
  );
}
