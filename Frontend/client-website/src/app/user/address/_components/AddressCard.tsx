import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit2, Trash2, Star, Check } from "lucide-react";
import { Address } from "@/stores/useAuthStore";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isOnlyAddress: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isOnlyAddress,
}: AddressCardProps) {
  return (
    <Card
      className={`relative ${
        address.isDefault ? "border-primary border-1" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {address.isDefault && (
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Mặc định
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address.id)}
              disabled={address.isDefault && isOnlyAddress}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-gray-900">{address.line}</p>
          <p className="text-gray-600 text-sm mt-1">
            {[address.ward, address.province].filter(Boolean).join(", ")}
          </p>
        </div>

        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onSetDefault(address.id)}
          >
            <Check className="h-4 w-4 mr-2" />
            Đặt làm mặc định
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
