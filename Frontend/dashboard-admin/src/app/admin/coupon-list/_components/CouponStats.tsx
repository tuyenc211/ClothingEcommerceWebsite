import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Gift, Users } from "lucide-react";
import { Coupon } from "@/stores/couponStore";
import { CouponStatus } from "@/stores/couponStore";

export default function CouponStats({
  coupons,
  getCouponStatus,
}: {
  coupons: Coupon[];
  getCouponStatus: (coupon: Coupon) => CouponStatus;
}) {
  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => getCouponStatus(c) === "active").length,
    expired: coupons.filter((c) => getCouponStatus(c) === "expired").length,
    upcoming: coupons.filter((c) => getCouponStatus(c) === "upcoming").length,
  };
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng mã giảm giá
          </CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Tất cả mã giảm giá</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang áp dụng</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <p className="text-xs text-muted-foreground">Đang có hiệu lực</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sắp diễn ra</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.upcoming}
          </div>
          <p className="text-xs text-muted-foreground">Chưa bắt đầu</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hết hạn</CardTitle>
          <Calendar className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">
            {stats.expired}
          </div>
          <p className="text-xs text-muted-foreground">Đã kết thúc</p>
        </CardContent>
      </Card>
    </div>
  );
}
