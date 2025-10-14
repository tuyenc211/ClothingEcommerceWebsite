"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColorStore } from "@/stores/colorStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomInput from "@/components/shared/CustomInput";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ColorForm {
  name: string;
  code: string;
}

export default function AddEditColorPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const { createColor, updateColor, getColor, fetchColors } = useColorStore();
  const id = Number(params?.id);
  const [formData, setFormData] = useState<ColorForm>({
    name: "",
    code: "#000000",
  });

  const [errors, setErrors] = useState<Partial<ColorForm>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch colors first to ensure we have data
    fetchColors();
  }, [fetchColors]);

  useEffect(() => {
    if (isEdit && id) {
      const existingColor = getColor(id);
      if (existingColor) {
        setFormData({
          name: existingColor.name,
          code: existingColor.code,
        });
      }
    }
  }, [isEdit, id, getColor]);

  const handleInputChange = (field: keyof ColorForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ColorForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên màu là bắt buộc";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Mã màu là bắt buộc";
    } else if (!/^#[0-9A-F]{6}$/i.test(formData.code)) {
      newErrors.code = "Mã màu phải có định dạng #RRGGBB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isEdit && id) {
        await updateColor(id, formData);
      } else {
        await createColor(formData);
      }

      router.push("/admin/colors");
    } catch (error) {
      console.error("Error saving color:", error);
      // Error handling is already done in the store with toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Chỉnh sửa màu" : "Thêm màu mới"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Cập nhật thông tin màu sắc"
              : "Tạo màu sắc mới cho sản phẩm"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 ">
          {/* Color Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin màu sắc</CardTitle>
              <CardDescription>Nhập tên và mã màu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomInput
                label="Tên màu"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ví dụ: Đỏ, Xanh dương, Vàng..."
                error={errors.name}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="value">Mã màu *</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="value"
                      name="value"
                      value={formData.code}
                      onChange={(e) =>
                        handleInputChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="#FF0000"
                      className={errors.code ? "border-destructive" : ""}
                    />
                  </div>
                  <Input
                    type="color"
                    value={formData.code}
                    onChange={(e) =>
                      handleInputChange("code", e.target.value.toUpperCase())
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                </div>
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Định dạng: #RRGGBB (ví dụ: #FF0000 cho màu đỏ)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/colors">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : isEdit ? "Cập nhật màu" : "Tạo màu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
