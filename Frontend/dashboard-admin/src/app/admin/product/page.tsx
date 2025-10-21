"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { Category } from "@/stores/categoryStore";
interface ProductFormValues {
  name: string;
  sku: string;
  description: string;
  basePrice: number;
  category:Category;
  colors: number[];
  sizes: number[];
  isPublished: boolean;
  images?: File[];
}

interface ImagePreview {
  file: File;
  url: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const { colors } = useColorStore();
  const { sizes } = useSizeStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { addProductWithVariants, updateProduct, getProduct } =
    useProductStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const subcategories = categories.filter((c) => c.parentId);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      basePrice: 0,
      category:{},
      colors: [],
      sizes: [],
      isPublished: true,
      images: [],
    },
  });

  // State cho image previews
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

  // Load product when editing
  useEffect(() => {
    if (
      isEdit &&
      params?.id &&
      categories.length > 0 &&
      colors.length > 0 &&
      sizes.length > 0
    ) {
      const existingProduct = getProduct(Number(params.id));
      console.log("Loading product for edit:", existingProduct);

      if (existingProduct) {
        // Extract unique color IDs và size IDs từ variants
        const productColors = Array.from(
          new Set(
            existingProduct.variants
              ?.map((v) => v.color_id)
              .filter((id): id is number => id !== undefined) || []
          )
        );

        const productSizes = Array.from(
          new Set(
            existingProduct.variants
              ?.map((v) => v.size_id)
              .filter((id): id is number => id !== undefined) || []
          )
        );

        console.log("Extracted colors:", productColors);
        console.log("Extracted sizes:", productSizes);

        // Add timeout to ensure Select components are fully rendered
        setTimeout(() => {
          const formValues = {
            name: existingProduct.name,
            sku: existingProduct.sku,
            description: existingProduct.description || "",
            basePrice: existingProduct.basePrice,
            category: existingProduct.category,
            colors: productColors,
            sizes: productSizes,
            isPublished: existingProduct.isPublished,
            images: [] as File[],
          };
          reset(formValues);

          // Reset image previews khi chỉnh sửa sản phẩm
          setImagePreviews([]);
        }, 100);
      }
    }
  }, [isEdit, params?.id, getProduct, reset, categories, colors, sizes]);
  const onSubmit = async (data: ProductFormValues) => {
    console.log("Form data:", data);

    // Validate required fields
    if (
      !data.category ||
      data.colors.length === 0 ||
      data.sizes.length === 0
    ) {
      console.error("Missing required fields");
      return;
    }

    try {
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        basePrice: data.basePrice,
        category: data.category,
        isPublished: data.isPublished,
      };

      if (isEdit && params?.id) {
        await updateProduct(Number(params.id), productData);
      } else {
        await addProductWithVariants(
          productData,
          data.sizes,
          data.colors,
          data.images || []
        );
      }

      router.push("/admin/list-product");
    } catch (error) {
      console.error("Error saving product:", error);
      // Error already handled by store with toast
    }
  };

  // handle manual image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Tạo preview URLs cho các ảnh mới
    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // Cập nhật state previews và form
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setValue("images", [...(watch("images") || []), ...files]);
  };

  // Xóa ảnh khỏi preview
  const removeImage = (index: number) => {
    const currentImages = watch("images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);

    // Cleanup URL để tránh memory leak
    URL.revokeObjectURL(imagePreviews[index].url);

    // Cập nhật state và form
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setValue("images", newImages);
  };

  // Cleanup URLs khi component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/list-product">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Cập nhật thông tin sản phẩm thời trang"
              : "Tạo sản phẩm mới cho cửa hàng thời trang"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên Sản Phẩm *</Label>
                <Input
                  {...register("name", {
                    required: "Tên sản phẩm là bắt buộc",
                  })}
                  placeholder="Điền tên sản phẩm"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input
                  {...register("sku", {
                    required: "SKU là bắt buộc",
                  })}
                  placeholder="Điền mã SKU sản phẩm"
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">
                    {errors.sku.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mô tả *</Label>
                <Textarea
                  {...register("description", {
                    required: "Mô tả sản phẩm là bắt buộc",
                  })}
                  rows={4}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Giá Gốc *</Label>
                <Input
                  type="number"
                  {...register("basePrice", {
                    required: "Giá gốc sản phẩm là bắt buộc",
                    valueAsNumber: true,
                  })}
                  placeholder="Điền giá gốc sản phẩm"
                  className={errors.basePrice ? "border-destructive" : ""}
                />
                {errors.basePrice && (
                  <p className="text-sm text-destructive">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="isPublished"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span>Đăng bán</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Options */}
          <Card>
            <CardHeader>
              <CardTitle>Categories & Options</CardTitle>
              <CardDescription>
                Select brand, category and colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Danh Mục *</Label>
                <Controller
                  control={control}
                  name="category"
                  rules={{ required: "Danh mục sản phẩm là bắt buộc" }}
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        className={
                          errors.category ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Màu Sắc *</Label>
                <Controller
                  control={control}
                  name="colors"
                  rules={{
                    validate: (v) =>
                      v.length > 0 || "Ít nhất một màu là bắt buộc",
                  }}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      {colors.map((color) => {
                        const checked = field.value.includes(color.id);
                        return (
                          <div
                            key={color.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                const isChecked = c as boolean;
                                field.onChange(
                                  isChecked
                                    ? [...field.value, color.id]
                                    : field.value.filter(
                                        (id: number) => id !== color.id
                                      )
                                );
                              }}
                            />
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.code }}
                              />
                              <Label className="text-sm">{color.name}</Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.colors && (
                  <p className="text-sm text-destructive">
                    {errors.colors.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Kích Thước *</Label>
                <Controller
                  control={control}
                  name="sizes"
                  rules={{
                    validate: (v) =>
                      v.length > 0 || "Ít nhất một kích thước là bắt buộc",
                  }}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-3">
                      {sizes.map((size) => {
                        const checked = field.value.includes(size.id);
                        return (
                          <div
                            key={size.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                const isChecked = c as boolean;
                                field.onChange(
                                  isChecked
                                    ? [...field.value, size.id]
                                    : field.value.filter(
                                        (s: number) => s !== size.id
                                      )
                                );
                              }}
                            />
                            <Label className="text-sm font-medium">
                              {size.code} - {size.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.sizes && (
                  <p className="text-sm text-destructive">
                    {errors.sizes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ảnh Sản Phẩm</CardTitle>
              <CardDescription>
                Tải lên hình ảnh sản phẩm ({imagePreviews.length} ảnh đã chọn)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Kéo thả hình ảnh vào đây hoặc nhấp để chọn
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Chọn Tập Tin
                  </label>
                </Button>
              </div>

              {/* Preview Grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3">Xem trước ảnh:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                          <Image
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            unoptimized={true}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/list-product">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu..."
              : isEdit
              ? "Cập Nhật Sản Phẩm"
              : "Tạo Sản Phẩm"}
          </Button>
        </div>
      </form>
    </div>
  );
}
