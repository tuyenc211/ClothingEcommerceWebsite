"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSizeStore } from "@/stores/sizeStore";
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

interface SizeForm {
  code: string;
  name: string;
  sortOrder: number;
}

export default function EditSizePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const { updateSize, getSize, sizes } = useSizeStore();

  const [formData, setFormData] = useState<SizeForm>({
    code: "",
    name: "",
    sortOrder: 1,
  });

  const [errors, setErrors] = useState<
    Record<keyof SizeForm, string | undefined>
  >({} as Record<keyof SizeForm, string | undefined>);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const existingSize = getSize(id);
      if (existingSize) {
        setFormData({
          code: existingSize.code,
          name: existingSize.name,
          sortOrder: existingSize.sortOrder,
        });
      } else {
        // Size not found, redirect to sizes list
        router.push("/admin/sizes");
      }
    }
  }, [id, getSize, router]);

  const handleInputChange = (field: keyof SizeForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<keyof SizeForm, string | undefined> = {} as Record<
      keyof SizeForm,
      string | undefined
    >;

    if (!formData.code.trim()) {
      newErrors.code = "Mã size là bắt buộc";
    } else if (formData.code.length > 10) {
      newErrors.code = "Mã size không được quá 10 ký tự";
    } else if (
      sizes.some(
        (s) =>
          s.id !== id && s.code.toLowerCase() === formData.code.toLowerCase()
      )
    ) {
      newErrors.code = "Mã size đã tồn tại";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên size là bắt buộc";
    } else if (formData.name.length > 50) {
      newErrors.name = "Tên size không được quá 50 ký tự";
    }

    if (formData.sortOrder < 1) {
      newErrors.sortOrder = "Thứ tự phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (id) {
        updateSize(id, {
          code: formData.code.toUpperCase(),
          name: formData.name,
          sortOrder: formData.sortOrder,
        });
      }

      router.push("/admin/sizes");
    } catch (error) {
      console.error("Error updating size:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/sizes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa size</h1>
          <p className="text-muted-foreground">Cập nhật thông tin kích thước</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Size Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin kích thước</CardTitle>
              <CardDescription>Nhập mã, tên và thứ tự hiển thị</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomInput
                label="Mã size"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                placeholder="Ví dụ: XS, S, M, L, XL..."
                error={errors.code}
                required
                maxLength={10}
              />

              <CustomInput
                label="Tên size"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ví dụ: Extra Small, Small, Medium..."
                error={errors.name}
                required
                maxLength={50}
              />

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị *</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="1"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    handleInputChange(
                      "sortOrder",
                      parseInt(e.target.value) || 1
                    )
                  }
                  placeholder="1"
                  className={errors.sortOrder ? "border-destructive" : ""}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-destructive">{errors.sortOrder}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Số nhỏ hơn sẽ hiển thị trước trong danh sách
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/sizes">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật size"}
          </Button>
        </div>
      </form>
    </div>
  );
}
