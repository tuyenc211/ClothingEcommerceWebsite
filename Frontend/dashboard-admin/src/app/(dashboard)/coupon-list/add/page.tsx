"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ImageIcon, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useCouponStore, Coupon } from "@/stores/couponStore";
import { useState } from "react";
import Image from "next/image";

type FormValues = {
  code: string; // VARCHAR(50) NOT NULL UNIQUE
  name: string; // VARCHAR(255) NOT NULL
  description?: string; // TEXT
  value: number; // DECIMAL(12,2) NOT NULL
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderTotal?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
};

export default function AddCouponPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { addCoupon, validateCouponCode } = useCouponStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      value: 0,
      minOrderTotal: undefined,
      maxUses: undefined,
      maxUsesPerUser: undefined,
      startsAt: "",
      endsAt: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };
  const onSubmit = async (data: FormValues) => {
    // Validate coupon code uniqueness
    if (!validateCouponCode(data.code)) {
      toast.error("Mã giảm giá đã tồn tại");
      return;
    }

    // Validate dates if provided
    if (data.startsAt && data.endsAt) {
      if (new Date(data.endsAt) <= new Date(data.startsAt)) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }
    }

    try {
      // Convert empty strings to undefined for optional fields
      const couponData: Omit<Coupon, "id"> = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || undefined,
        value: data.value,
        minOrderTotal: data.minOrderTotal || undefined,
        maxUses: data.maxUses || undefined,
        maxUsesPerUser: data.maxUsesPerUser || undefined,
        startsAt: data.startsAt || undefined,
        endsAt: data.endsAt || undefined,
        isActive: data.isActive,
      };

      await addCoupon(couponData, selectedImage || undefined);
      toast.success("Thêm mã giảm giá thành công!");
      router.push("/coupon-list");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm mã giảm giá");
      console.error("Error adding coupon:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/coupon-list">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm mã giảm giá</h1>
          <p className="text-muted-foreground">
            Tạo mã giảm giá mới cho khách hàng
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin mã giảm giá</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Mã giảm giá *</Label>
                <Input
                  id="code"
                  {...register("code", {
                    required: "Mã giảm giá không được để trống",
                    pattern: {
                      value: /^[A-Z0-9]+$/,
                      message: "Mã chỉ được chứa chữ cái in hoa và số",
                    },
                  })}
                  placeholder="VD: WELCOME10"
                  className={errors.code ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên mã giảm giá *</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Tên mã giảm giá không được để trống",
                  })}
                  placeholder="VD: Giảm giá chào mừng"
                  className={errors.name ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor="value">Giá trị giảm (%) *</Label>
                <Input
                  id="value"
                  type="number"
                  {...register("value", {
                    required: "Giá trị giảm không được để trống",
                    min: { value: 0, message: "Giá trị phải lớn hơn 0" },
                    max: {
                      value: 100,
                      message: "Giá trị không được vượt quá 100%",
                    },
                  })}
                  placeholder="VD: 10"
                  className={errors.value ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập giá trị từ 0-100 (phần trăm)
                </p>
                {errors.value && (
                  <p className="text-sm text-red-500">{errors.value.message}</p>
                )}
              </div>

              {/* Min Order Total */}
              <div className="space-y-2">
                <Label htmlFor="min_order_total">Đơn hàng tối thiểu</Label>
                <Input
                  id="min_order_total"
                  type="number"
                  {...register("minOrderTotal", {
                    min: {
                      value: 0,
                      message: "Giá trị phải lớn hơn hoặc bằng 0",
                    },
                    required: "Giá trị không được để trống",
                  })}
                  placeholder="VD: 200000"
                  className={errors.minOrderTotal ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.minOrderTotal && (
                  <p className="text-sm text-red-500">
                    {errors.minOrderTotal.message}
                  </p>
                )}
              </div>

              {/* Max Uses */}
              <div className="space-y-2">
                <Label htmlFor="maxUses">Số lần sử dụng tối đa</Label>
                <Input
                  id="maxUses"
                  type="number"
                  {...register("maxUses", {
                    min: { value: 1, message: "Số lần sử dụng phải lớn hơn 0" },
                    required: "Giá trị không được để trống",
                  })}
                  placeholder="VD: 1000"
                  disabled={isSubmitting}
                />
              </div>
              {errors.maxUses && (
                <p className="text-sm text-red-500">{errors.maxUses.message}</p>
              )}

              {/* Max Uses Per User */}
              <div className="space-y-2">
                <Label htmlFor="maxUsesPerUser">Số lần sử dụng/người</Label>
                <Input
                  id="maxUsesPerUser"
                  type="number"
                  {...register("maxUsesPerUser", {
                    min: { value: 1, message: "Số lần sử dụng phải lớn hơn 0" },
                    required: "Giá trị không được để trống",
                  })}
                  placeholder="VD: 1"
                  disabled={isSubmitting}
                />
              </div>
              {errors.maxUsesPerUser && (
                <p className="text-sm text-red-500">
                  {errors.maxUsesPerUser.message}
                </p>
              )}

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startsAt">Ngày bắt đầu</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  {...register("startsAt", {
                    required: "Ngày bắt đầu không được để trống",
                  })}
                  disabled={isSubmitting}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endsAt">Ngày kết thúc</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  {...register("endsAt", {
                    required: "Ngày kết thúc không được để trống",
                  })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Mô tả chi tiết về mã giảm giá..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Hình ảnh mã giảm giá</Label>
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative w-48 h-48 border-2 border-dashed rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Chọn ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                )}

                {/* Upload Instructions */}
              </div>
            </div>
            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active">Kích hoạt mã giảm giá</Label>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu mã giảm giá
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/coupon-list">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
