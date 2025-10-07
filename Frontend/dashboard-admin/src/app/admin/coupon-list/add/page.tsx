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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useCouponStore, Coupon } from "@/stores/couponStore";

type FormValues = {
  code: string;
  name: string;
  description?: string;
  value: number;
  min_order_total?: number;
  max_uses?: number;
  max_uses_per_user?: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
};

export default function AddCouponPage() {
  const router = useRouter();
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
      min_order_total: undefined,
      max_uses: undefined,
      max_uses_per_user: undefined,
      starts_at: "",
      ends_at: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  const onSubmit = async (data: FormValues) => {
    // Validate coupon code uniqueness
    if (!validateCouponCode(data.code)) {
      toast.error("Mã giảm giá đã tồn tại");
      return;
    }

    // Validate dates if provided
    if (data.starts_at && data.ends_at) {
      if (new Date(data.ends_at) <= new Date(data.starts_at)) {
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
        min_order_total: data.min_order_total || undefined,
        max_uses: data.max_uses || undefined,
        max_uses_per_user: data.max_uses_per_user || undefined,
        starts_at: data.starts_at || undefined,
        ends_at: data.ends_at || undefined,
        is_active: data.is_active,
      };

      addCoupon(couponData);
      toast.success("Thêm mã giảm giá thành công!");
      router.push("/admin/coupon-list");
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
          <Link href="/admin/coupon-list">
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
                <Label htmlFor="value">Giá trị giảm *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...register("value", {
                    required: "Giá trị giảm không được để trống",
                    min: { value: 0, message: "Giá trị phải lớn hơn 0" },
                  })}
                  placeholder="VD: 10000"
                  className={errors.value ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
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
                  {...register("min_order_total", {
                    min: {
                      value: 0,
                      message: "Giá trị phải lớn hơn hoặc bằng 0",
                    },
                  })}
                  placeholder="VD: 200000"
                  className={errors.min_order_total ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.min_order_total && (
                  <p className="text-sm text-red-500">
                    {errors.min_order_total.message}
                  </p>
                )}
              </div>

              {/* Max Uses */}
              <div className="space-y-2">
                <Label htmlFor="max_uses">Số lần sử dụng tối đa</Label>
                <Input
                  id="max_uses"
                  type="number"
                  {...register("max_uses", {
                    min: { value: 1, message: "Số lần sử dụng phải lớn hơn 0" },
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
                  {...register("max_uses_per_user", {
                    min: { value: 1, message: "Số lần sử dụng phải lớn hơn 0" },
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
                  {...register("starts_at")}
                  disabled={isSubmitting}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="ends_at">Ngày kết thúc</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  {...register("ends_at")}
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

            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
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
                <Link href="/admin/coupon-list">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
