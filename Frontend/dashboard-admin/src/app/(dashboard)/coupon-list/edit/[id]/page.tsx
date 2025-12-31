"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ImageIcon, Save, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import {Coupon, useAllCoupons, useCouponById, useUpdateCoupon} from "@/services/couponService";

type FormValues = {
  code: string;
  name: string;
  description?: string;
  value: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderTotal?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
};

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = parseInt(params.id as string);
  const { data: coupon, isLoading} = useCouponById(couponId);
  const { data: allCoupons = [] } = useAllCoupons();
  const { mutate: updateCoupon, } = useUpdateCoupon();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const isActive = watch("isActive", true);

  useEffect(() => {
    if (coupon) {
      const formatDateForInput = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || "",
        value: coupon.value,
        minOrderTotal: coupon.minOrderTotal || undefined,
        maxUses: coupon.maxUses || undefined,
        maxUsesPerUser: coupon.maxUsesPerUser || undefined,
        startsAt: formatDateForInput(coupon.startsAt),
        endsAt: formatDateForInput(coupon.endsAt),
        isActive: coupon.isActive,
      });
    }
  }, [coupon, reset]);
  const validateCouponCode = (code: string): boolean => {
    const existing = allCoupons.find(
      (c) => c.code.toLowerCase() === code.toLowerCase() && c.id !== couponId
    );
    return !existing;
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setRemoveCurrentImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveNewImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);
  };
  const handleRemoveCurrentImage = () => {
    setCurrentImageUrl(null);
    setRemoveCurrentImage(true);
  };
  const onSubmit = async (data: FormValues) => {
    if (!validateCouponCode(data.code)) {
      toast.error("Mã giảm giá đã tồn tại");
      return;
    }
    if (data.startsAt && data.endsAt) {
      if (new Date(data.endsAt) <= new Date(data.startsAt)) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }
    }

    try {
      const couponData: Partial<Coupon> = {
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

      updateCoupon({
        id: couponId,
        couponData,
        image: selectedImage || undefined,
      });
      router.push("/coupon-list");
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const displayImage =
    imagePreview ||
    (currentImageUrl && !removeCurrentImage ? currentImageUrl : null);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/coupon-list">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa mã giảm giá</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin mã giảm giá
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
                <Label htmlFor="minOrderTotal">Đơn hàng tối thiểu</Label>
                <Input
                  id="minOrderTotal"
                  type="number"
                  {...register("minOrderTotal", {
                    min: {
                      value: 0,
                      message: "Giá trị phải lớn hơn hoặc bằng 0",
                    },
                    required: "Giắ trị không được để trống",
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
                    required: "Giắ trị không được để trống",
                  })}
                  placeholder="VD: 1000"
                  disabled={isSubmitting}
                />
              </div>

              {/* Max Uses Per User */}
              <div className="space-y-2">
                <Label htmlFor="max_uses_per_user">Số lần sử dụng/người</Label>
                <Input
                  id="max_uses_per_user"
                  type="number"
                  {...register("maxUsesPerUser", {
                    min: { value: 1, message: "Số lần sử dụng phải lớn hơn 0" },
                    required: "Giá trị không được để trống",
                  })}
                  placeholder="VD: 1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="starts_at">Ngày bắt đầu</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  {...register("startsAt")}
                  disabled={isSubmitting}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="ends_at">Ngày kết thúc</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  {...register("endsAt")}
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
                {/* Image Preview/Display */}
                {displayImage ? (
                  <div className="relative w-48 h-48 border-2 border-dashed rounded-lg overflow-hidden">
                    <Image
                      src={displayImage}
                      alt="Coupon Image"
                      fill
                      className="object-cover"
                      unoptimized={displayImage.includes("cloudinary")}
                    />
                    <button
                      type="button"
                      onClick={
                        imagePreview
                          ? handleRemoveNewImage
                          : handleRemoveCurrentImage
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title={imagePreview ? "Hủy ảnh mới" : "Xóa ảnh hiện tại"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {imagePreview && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Ảnh mới
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Chọn ảnh</span>
                    <span className="text-xs text-gray-400 mt-1">Max 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                )}
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
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật mã giảm giá
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
