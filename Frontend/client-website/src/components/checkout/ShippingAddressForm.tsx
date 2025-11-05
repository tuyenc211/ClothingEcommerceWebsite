import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/stores/useAuthStore";
import { Province, Ward } from "@/hooks/useAddress";

interface ShippingFormData {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  wardCode: string;
  province: string;
  provinceCode: string;
  note?: string;
}

interface ShippingAddressFormProps {
  authUser: User | null;
  formData: ShippingFormData;
  selectedAddressId: number | null;
  isNewAddress: boolean;
  provinces: Province[];
  wards: Ward[];
  isLoadingProvinces: boolean;
  isLoadingWards: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onProvinceChange: (provinceCode: string) => void;
  onWardChange: (wardCode: string) => void;
  onAddressSelect: (addressId: number) => void;
  onNewAddress: () => void;
}

export default function ShippingAddressForm({
  authUser,
  formData,
  selectedAddressId,
  isNewAddress,
  provinces,
  wards,
  isLoadingProvinces,
  isLoadingWards,
  onInputChange,
  onProvinceChange,
  onWardChange,
  onAddressSelect,
  onNewAddress,
}: ShippingAddressFormProps) {
  console.log("🏢 ShippingAddressForm - Provinces:", provinces.length);
  console.log(
    "🏢 ShippingAddressForm - isLoadingProvinces:",
    isLoadingProvinces
  );
  console.log("🏢 ShippingAddressForm - isNewAddress:", isNewAddress);

  return (
    <div className="space-y-4">
      {/* Customer Information (Editable) */}
      {authUser && (
        <div className="space-y-4 pb-4 border-b">
          <h3 className="font-medium text-gray-900">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={onInputChange}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address Selection */}
      {authUser && authUser.addresses && authUser.addresses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Chọn địa chỉ giao hàng</Label>
            <span className="text-xs text-gray-500">
              {authUser.addresses.length} địa chỉ
            </span>
          </div>
          <RadioGroup
            value={selectedAddressId?.toString() || "new"}
            onValueChange={(value: string) => {
              if (value === "new") {
                onNewAddress();
              } else {
                onAddressSelect(parseInt(value));
              }
            }}
          >
            {authUser.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedAddressId === addr.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onAddressSelect(addr.id)}
              >
                <RadioGroupItem
                  value={addr.id.toString()}
                  id={`addr-${addr.id}`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`addr-${addr.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {addr.line}
                    </Label>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {[addr.ward, addr.district, addr.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {/* New Address Option */}
            <div
              className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                isNewAddress
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={onNewAddress}
            >
              <RadioGroupItem value="new" id="addr-new" />
              <Label htmlFor="addr-new" className="font-medium cursor-pointer">
                Sử dụng địa chỉ mới
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
      {/* New Address Form */}
      {isNewAddress && authUser && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">
            Nhập địa chỉ giao hàng mới
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">
                Tỉnh/ Thành phố <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.provinceCode}
                onValueChange={onProvinceChange}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {provinces.map((province) => (
                    <SelectItem key={province.code} value={province.code}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">
                Xã/ Phường <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.wardCode}
                onValueChange={onWardChange}
                disabled={!formData.provinceCode}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.provinceCode
                        ? "Chọn tỉnh/thành phố trước"
                        : isLoadingWards
                        ? "Đang tải..."
                        : "Chọn xã/phường"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {wards.map((ward) => (
                    <SelectItem key={ward.code} value={ward.code}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              placeholder="Số nhà, tên đường..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
