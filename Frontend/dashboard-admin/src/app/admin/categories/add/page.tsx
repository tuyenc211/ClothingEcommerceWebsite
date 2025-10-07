"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import { toast } from "sonner";

interface CategoryFormData {
  name: string;
  isActive: boolean;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const { addCategory } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      addCategory({
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
        isActive: formData.isActive,
      });

      toast.success("Thêm danh mục cha thành công!");
      router.push("/admin/categories");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm danh mục");
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CategoryFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm danh mục chính</h1>
          <p className="text-muted-foreground">
            Tạo danh mục chính mới trong hệ thống
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin danh mục chính</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên danh mục */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên danh mục cha"
                className={errors.name ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Trạng thái */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
                disabled={loading}
              />
              <Label htmlFor="isActive">Kích hoạt danh mục</Label>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu danh mục
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/categories">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
