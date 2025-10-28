"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit2, Trash2, Star, Check } from "lucide-react";
import useAuthStore, { Address } from "@/stores/useAuthStore";
import { useAddress } from "@/hooks/useAddress";
import { toast } from "sonner";
import UserLayout from "@/components/layouts/UserLayout";

interface AddressFormData {
  line: string;
  ward: string;
  district?: string;
  province: string;
  isDefault: boolean;
}

export default function AddressManagementPage() {
  const {
    authUser,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuthStore();
  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  } = useAddress();

  // States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<AddressFormData>({
    line: "",
    ward: "",
    province: "",
    isDefault: false,
  });

  // Selected codes for API
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  const addresses = authUser?.addresses || [];

  // Fetch addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (authUser?.id) {
        setIsLoadingAddresses(true);
        try {
          await fetchAddresses();
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    // Only fetch if we haven't loaded addresses yet
    if (authUser?.id && addresses.length === 0) {
      loadAddresses();
    }
  }, [authUser?.id, fetchAddresses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form
  const resetForm = () => {
    setFormData({
      line: "",
      ward: "",
      province: "",
      isDefault: false,
    });
    setSelectedProvinceCode("");
    setSelectedWardCode("");
    clearWards();
    setEditingAddress(null);
  };

  // Handle open add dialog
  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle open edit dialog
  const handleOpenEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      line: address.line,
      ward: address.ward || "",
      province: address.province || "",
      isDefault: address.isDefault,
    });

    // Nếu cần load lại wards dựa trên province
    // (Lưu ý: không có provinceCode trong address hiện tại, nên không thể fetch lại)
    setIsDialogOpen(true);
  };

  // Handle province change
  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    if (selectedProvince) {
      setSelectedProvinceCode(provinceCode);
      setFormData((prev) => ({
        ...prev,
        province: selectedProvince.name,
        ward: "",
      }));
      setSelectedWardCode("");
      fetchWards(provinceCode);
    }
  };

  // Handle ward change
  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
    if (selectedWard) {
      setSelectedWardCode(wardCode);

      // Set ward name
      setFormData((prev) => ({
        ...prev,
        ward: selectedWard.name,
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.line.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return false;
    }

    if (!formData.province) {
      toast.error("Vui lòng chọn Tỉnh/Thành phố");
      return false;
    }

    if (!formData.ward) {
      toast.error("Vui lòng chọn Xã/Phường");
      return false;
    }

    // Validate phone number (Vietnamese format)
    // Note: This validation should be added if we have phone field in address

    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.id, formData);
      } else {
        // Add new address
        await addAddress(formData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    try {
      await deleteAddress(deletingAddressId);
      setIsDeleteDialogOpen(false);
      setDeletingAddressId(null);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  // Handle set default
  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý địa chỉ
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý địa chỉ giao hàng của bạn
            </p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm địa chỉ mới
          </Button>
        </div>

        {/* Address List */}
        {isLoadingAddresses ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">Đang tải địa chỉ...</p>
            </CardContent>
          </Card>
        ) : addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có địa chỉ nào
              </h3>
              <p className="text-gray-600 mb-4">
                Thêm địa chỉ giao hàng để thanh toán nhanh hơn
              </p>
              <Button onClick={handleOpenAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm địa chỉ đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={`relative ${
                  address.isDefault ? "border-primary border-2" : ""
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(address)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingAddressId(address.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={address.isDefault && addresses.length === 1}
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
                      {[address.ward, address.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Đặt làm mặc định
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? "Cập nhật thông tin địa chỉ giao hàng"
                  : "Nhập thông tin địa chỉ giao hàng mới"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Province & Ward */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedProvinceCode}
                    onValueChange={handleProvinceChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingProvinces
                            ? "Đang tải..."
                            : "Chọn tỉnh/thành phố"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
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
                    Xã/Phường <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedWardCode}
                    onValueChange={handleWardChange}
                    disabled={!selectedProvinceCode}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedProvinceCode
                            ? "Chọn tỉnh/thành phố trước"
                            : isLoadingWards
                            ? "Đang tải..."
                            : "Chọn xã/phường"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={ward.code}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line Address */}
              <div className="space-y-2">
                <Label htmlFor="line">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="line"
                  placeholder="Số nhà, tên đường..."
                  value={formData.line}
                  onChange={(e) =>
                    setFormData({ ...formData, line: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Ví dụ: Số 1, Ngõ 23, Đường Láng
                </p>
              </div>

              {/* Set Default */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Đang lưu..."
                    : editingAddress
                    ? "Cập nhật"
                    : "Thêm địa chỉ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể
                hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingAddressId(null);
                }}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </UserLayout>
  );
}
