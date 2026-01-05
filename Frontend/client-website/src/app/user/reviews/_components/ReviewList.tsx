"use client";
import { Star, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {useDeleteReview} from "@/services/reviewsService";
import {Review} from "@/types";
interface ReviewListProps {
  productId: number;
  reviews?: Review[];
}

export default function ReviewList({ productId,reviews }: ReviewListProps) {
  const { authUser } = useAuthStore();
    const {mutate: deleteReview, isPending:isLoading} = useDeleteReview()
  const handleDelete = async (reviewId: number) => {
    try {
        deleteReview({ reviewId, userId: authUser?.id || 0} );
      toast.success("Đã xóa đánh giá");
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews?.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Chưa có đánh giá nào</p>
          <p className="text-sm text-gray-500 mt-1">
            Hãy là người đầu tiên đánh giá sản phẩm này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews?.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-white">
                  {review.user?.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">
                      {review.user?.fullName || "Người dùng"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions - Only show for review owner */}
                  {authUser && authUser.id === review.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Title */}
                {review.title && (
                  <h5 className="font-medium mt-3">{review.title}</h5>
                )}

                {/* Content */}
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                  {review.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
