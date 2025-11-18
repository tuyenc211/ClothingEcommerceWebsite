"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import { toast } from "sonner";

interface SubcategoryFormData {
  name: string;
  parentId: number | null;
  isActive: boolean;
}

export default function EditSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);
  const { getCategory, updateCategory, categories, fetchCategories } =
    useCategoryStore();
  const parentCategories = categories.filter((cat) => !cat.parentId);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: "",
    parentId: null,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lấy danh sách danh mục cha

  useEffect(() => {
    const category = getCategory(categoryId);
    if (category && category.parentId) {
      setFormData({
        name: category.name,
        parentId: category.parentId?.id,
        isActive: category.isActive,
      });
    } else {
      toast.error("Không tìm thấy danh mục con");
      router.push("/subcategories");
    }
    setInitialLoading(false);
  }, [categoryId, getCategory, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục con không được để trống";
    }
    const nameRegex = /^[a-zA-Z0-9\sÀ-ỹ]+$/;
    if (formData.name && !nameRegex.test(formData.name)) {
      newErrors.name =
        "Tên chỉ được chứa chữ, số và khoảng trắng (không có ký tự đặc biệt)";
    }
    if (!formData.parentId) {
      newErrors.parentId = "Vui lòng chọn danh mục cha";
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
      await updateCategory(categoryId, {
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
        parentId: categories.find((cat) => cat.id === formData.parentId),
        isActive: formData.isActive,
      });
      router.push("/subcategories");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật danh mục con");
      console.error("Error updating subcategory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof SubcategoryFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/subcategories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa danh mục con</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin danh mục con
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin danh mục nhỏ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Danh mục cha */}
            <div className="space-y-2">
              <Label htmlFor="parentId">Danh mục chính *</Label>
              <Select
                value={formData.parentId?.toString() || ""}
                onValueChange={(value) =>
                  handleInputChange("parentId", parseInt(value))
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={errors.parentId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parentId && (
                <p className="text-sm text-red-500">{errors.parentId}</p>
              )}
            </div>

            {/* Tên danh mục con */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục nhỏ *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên danh mục con"
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
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật danh mục nhỏ
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/subcategories">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
