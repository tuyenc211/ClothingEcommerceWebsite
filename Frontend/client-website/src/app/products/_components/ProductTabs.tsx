import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReviewForm from "@/app/user/reviews/_components/ReviewForm";
import ReviewList from "@/app/user/reviews/_components/ReviewList";
import {Review} from "@/types";

interface Product {
  id: number;
  description?: string;
}

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
  orderId: number;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export default function ProductTabs({
  product,
  reviews,
  orderId,
  activeTab,
  setActiveTab,
}: ProductTabsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex items-start w-full grid-cols-2 mx-auto">
          <TabsTrigger value="description" className="text-sm sm:text-base">
            Mô tả sản phẩm
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm sm:text-base">
            Đánh giá ({reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab mô tả */}
        <TabsContent value="description" className="mt-8">
          <div className="bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Chi tiết sản phẩm
            </h3>
            <div className="prose prose-gray">
              <p className="text-gray-600 leading-relaxed mb-4">
                {product.description ||
                  "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab đánh giá */}
        <TabsContent value="reviews" className="mt-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Đánh giá của khách hàng
              </h3>
              {orderId > 0 && (
                <ReviewForm productId={product.id} orderId={orderId} />
              )}
            </div>
            <ReviewList productId={product.id} reviews={reviews || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
