"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AddSubcategoryPage() {
  const router = useRouter();
  const { addChildCategory, getRootCategories } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: "",
    parentId: null,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lấy danh sách danh mục cha
  const parentCategories = getRootCategories().filter((cat) => cat.isActive);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục con không được để trống";
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
      addChildCategory(formData.parentId!, {
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
        isActive: formData.isActive,
      });

      toast.success("Thêm danh mục con thành công!");
      router.push("/admin/subcategories");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm danh mục con");
      console.error("Error adding subcategory:", error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/subcategories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm danh mục con</h1>
          <p className="text-muted-foreground">
            Tạo danh mục con mới trong hệ thống
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin danh mục con</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Danh mục cha */}
            <div className="space-y-2">
              <Label htmlFor="parentId">Danh mục cha *</Label>
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
                  {parentCategories.map((category) => (
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
              <Label htmlFor="name">Tên danh mục con *</Label>
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
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu danh mục con
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/subcategories">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
