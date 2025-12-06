"use client";

import { useState, useEffect } from "react";
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
import { useCreateReview, useReviewsByUser } from "@/services/reviewsService";

interface ReviewFormProps {
  productId: number;
  orderId?: number;
}

export default function ReviewForm({ productId, orderId }: ReviewFormProps) {
  const { authUser } = useAuthStore();
  const { mutate: addReview, isPending: isLoading } = useCreateReview();

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      addReview({
        user_id: authUser.id,
        product_id: productId,
        order_id: orderId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
  };

  if (!authUser) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars - dùng component Rating/RatingButton */}
          <div className="space-y-2">
            <Label>
              Đánh giá <span className="text-red-500">*</span>
            </Label>

            <Rating value={rating} onValueChange={setRating} className="gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <RatingButton key={i} size={32} className="text-yellow-400" />
              ))}
            </Rating>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề (Tùy chọn)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt đánh giá của bạn"
              maxLength={255}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Nội dung <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với sản phẩm này..."
              rows={5}
              required
            />
            <p className="text-xs text-gray-500">{content.length} ký tự</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
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
