"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColorById, useUpdateColor } from "@/services/colorService";
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

interface ColorForm {
  name: string;
  code: string;
}

export default function EditColorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const { data: colorData, isLoading: isLoadingColor } = useColorById(id);
  const updateColorMutation = useUpdateColor();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ColorForm>({
    defaultValues: {
      name: "",
      code: "#000000",
    },
  });

  useEffect(() => {
    if (colorData) {
      reset({
        name: colorData.name,
        code: colorData.code,
      });
    }
  }, [colorData, reset]);

  const onSubmit = async (data: ColorForm) => {
    try {
      if (id) {
        await updateColorMutation.mutateAsync({ id, data });
      }
      router.push("/colors");
    } catch (error) {
      console.error("Error saving color:", error);
    }
  };

  const isLoading = isLoadingColor || updateColorMutation.isPending;
  const watchedColor = watch("code");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa màu</h1>
          <p className="text-muted-foreground">Cập nhật thông tin màu sắc</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6 ">
          {/* Color Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin màu sắc</CardTitle>
              <CardDescription>Nhập tên và mã màu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên màu</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Đỏ, Xanh dương, Vàng..."
                  {...register("name", { required: "Tên màu là bắt buộc" })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Mã màu *</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="code"
                      placeholder="#FF0000"
                      {...register("code", {
                        required: "Mã màu là bắt buộc",
                        pattern: {
                          value: /^#[0-9A-F]{6}$/i,
                          message: "Mã màu phải có định dạng #RRGGBB",
                        },
                      })}
                      className={errors.code ? "border-destructive" : ""}
                      onChange={(e) => {
                        setValue("code", e.target.value.toUpperCase(), {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                  <Input
                    type="color"
                    value={watchedColor}
                    onChange={(e) =>
                      setValue("code", e.target.value.toUpperCase(), {
                        shouldValidate: true,
                      })
                    }
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                </div>
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
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
            <Link href="/colors">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Cập nhật màu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
