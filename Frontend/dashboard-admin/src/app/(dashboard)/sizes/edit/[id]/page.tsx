"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSizeById, useSizes, useUpdateSize } from "@/services/sizeService";
import { useForm } from "react-hook-form";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SizeForm {
  code: string;
  name: string;
  sortOrder: number;
}

export default function EditSizePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const { data: sizes = [] } = useSizes();
  const { data: sizeData, isLoading: isLoadingSize } = useSizeById(id);
  const updateSizeMutation = useUpdateSize();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SizeForm>({
    defaultValues: {
      code: "",
      name: "",
      sortOrder: 1,
    },
  });

  useEffect(() => {
    if (sizeData) {
      reset({
        code: sizeData.code,
        name: sizeData.name,
        sortOrder: sizeData.sortOrder,
      });
    }
  }, [sizeData, reset]);

  const onSubmit = async (data: SizeForm) => {
    try {
      if (id) {
        await updateSizeMutation.mutateAsync({
          id,
          data: {
            code: data.code.toUpperCase(),
            name: data.name,
            sortOrder: Number(data.sortOrder),
          },
        });
      }

      toast.success("Cập nhật size thành công!");
      router.push("/sizes");
    } catch (error) {
      console.error("Error updating size:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật size.");
    }
  };

  const isLoading = isLoadingSize || updateSizeMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sizes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa kích thước</h1>
          <p className="text-muted-foreground">Cập nhật thông tin kích thước</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6 ">
          {/* Size Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin kích thước</CardTitle>
              <CardDescription>Nhập mã, tên và thứ tự sắp xếp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã kích thước</Label>
                <Input
                  id="code"
                  placeholder="Ví dụ: S, M, L, XL..."
                  {...register("code", {
                    required: "Mã size là bắt buộc",
                    maxLength: {
                      value: 10,
                      message: "Mã size không được quá 10 ký tự",
                    },
                    validate: (value) => {
                      if (
                        sizes.some(
                          (s) =>
                            s.id !== id &&
                            s.code.toLowerCase() === value.toLowerCase()
                        )
                      ) {
                        return "Mã size đã tồn tại";
                      }
                      return true;
                    },
                  })}
                  className={errors.code ? "border-destructive" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên kích thước</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Small, Medium, Large..."
                  {...register("name", {
                    required: "Tên size là bắt buộc",
                    maxLength: {
                      value: 50,
                      message: "Tên size không được quá 50 ký tự",
                    },
                  })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register("sortOrder", {
                    required: "Thứ tự là bắt buộc",
                    min: {
                      value: 1,
                      message: "Thứ tự phải lớn hơn 0",
                    },
                    valueAsNumber: true,
                  })}
                  className={errors.sortOrder ? "border-destructive" : ""}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-destructive">
                    {errors.sortOrder.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/sizes">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Cập nhật kích thước"}
          </Button>
        </div>
      </form>
    </div>
  );
}
