"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCouponStore } from "@/stores/couponStore";
import { toast } from "sonner";

export default function CouponListPage() {
  const { coupons, deleteCoupon, getCouponStatus, fetchCoupons } =
    useCouponStore();
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    couponId: number | null;
    couponCode: string;
  }>({
    open: false,
    couponId: null,
    couponCode: "",
  });

  const handleDeleteClick = (id: number, code: string) => {
    setDeleteDialog({
      open: true,
      couponId: id,
      couponCode: code,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.couponId) {
      deleteCoupon(deleteDialog.couponId);
      toast.success("Xóa mã giảm giá thành công!");
      setDeleteDialog({ open: false, couponId: null, couponCode: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, couponId: null, couponCode: "" });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mã giảm giá</h1>
          <p className="text-muted-foreground">
            Quản lý mã giảm giá trong hệ thống
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupon-list/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mã giảm giá
          </Link>
        </Button>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã giảm giá ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Order Total</TableHead>
                <TableHead>Starts At</TableHead>
                <TableHead>Ends At</TableHead>
                <TableHead>Max Uses</TableHead>
                <TableHead>Max Uses Per User</TableHead>
                <TableHead>Is Active</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    Chưa có mã giảm giá nào
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.id}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {coupon.value}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {coupon.minOrderTotal
                        ? coupon.minOrderTotal.toLocaleString("vi-VN")
                        : "-"}
                    </TableCell>
                    <TableCell>{formatDate(coupon.startsAt)}</TableCell>
                    <TableCell>{formatDate(coupon.endsAt)}</TableCell>
                    <TableCell>{coupon.maxUses || "-"}</TableCell>
                    <TableCell>{coupon.maxUsesPerUser || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.isActive ? "default" : "secondary"}
                      >
                        {coupon.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/coupon-list/edit/${coupon.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(coupon.id, coupon.code)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá &ldquo;
              {deleteDialog.couponCode}&rdquo;?
              <br />
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
