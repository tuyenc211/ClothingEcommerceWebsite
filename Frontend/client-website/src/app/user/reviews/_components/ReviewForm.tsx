"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { useCreateReview } from "@/services/reviewsService";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

interface ReviewFormProps {
  productId: number;
  orderId?: number;
}

interface ReviewFormValues {
  rating: number;
  title: string;
  content: string;
}

export default function ReviewForm({ productId, orderId }: ReviewFormProps) {
  const { authUser } = useAuthStore();
  const { mutate: addReview, isPending: isLoading } = useCreateReview();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
  } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 0,
      title: "",
      content: "",
    },
  });

  const onSubmit: SubmitHandler<ReviewFormValues> = async (data) => {
    try {
      addReview({
        user_id: authUser?.id,
        product_id: productId,
        order_id: orderId,
        rating: data.rating,
        title: data.title.trim() || undefined,
        content: data.content.trim(),
      });
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  if (!authUser) return null;
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="w-4 h-4" />
          Viết đánh giá
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Viết đánh giá</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>
              Đánh giá <span className="text-red-500">*</span>
            </Label>

            <Controller
              name="rating"
              control={control}
              rules={{
                required: "Vui lòng chọn số sao đánh giá",
                min: { value: 1, message: "Vui lòng chọn số sao đánh giá" },
              }}
              render={({ field }) => (
                <Rating
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-1"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <RatingButton
                      key={i}
                      size={32}
                      className="text-yellow-400"
                    />
                  ))}
                </Rating>
              )}
            />
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề (Tùy chọn)</Label>
            <Input
              id="title"
              placeholder="Tóm tắt đánh giá của bạn"
              maxLength={255}
              {...register("title")}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Nội dung <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với sản phẩm này..."
              rows={5}
              {...register("content", {
                required: "Vui lòng nhập nội dung đánh giá",
              })}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            {/* watch content to show length if needed, or remove character count if not critical */}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
