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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Coupon, useCouponStore } from "@/stores/couponStore";
import CustomModal from "@/components/common/CustomModal";
<<<<<<< HEAD
import { formatDate } from "@/lib/utils";
=======
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c

export default function CouponListPage() {
  const { coupons, deleteCoupon, getCouponStatus, fetchCoupons, isLoading } =
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDeleteClick = (id: number, code: string) => {
    setDeleteDialog({
      open: true,
      couponId: id,
      couponCode: code,
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    const status = getCouponStatus(coupon);

    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-600">
            Đang hoạt động
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="bg-gray-400 text-gray-700">
            Hết hạn
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Sắp diễn ra
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
            Không hoạt động
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };
  const handleDeleteConfirm = () => {
    if (deleteDialog.couponId) {
      deleteCoupon(deleteDialog.couponId);
      setDeleteDialog({ open: false, couponId: null, couponCode: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, couponId: null, couponCode: "" });
  };

<<<<<<< HEAD
=======
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
  // Pagination calculation
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoupons = coupons.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const half = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }
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
          <Link href="/coupon-list/add">
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
                <TableHead>STT</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Đơn hàng tối thiểu</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Số lần sử dụng tối đa</TableHead>
                <TableHead>Số lần sử dụng tối đa mỗi người dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
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
                paginatedCoupons.map((coupon, index) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>
                      <span className="font-medium">{coupon.value}%</span>
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
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/coupon-list/edit/${coupon.id}`}>
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
                          disabled={getCouponStatus(coupon) === "expired"}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={pageNum === currentPage}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next Button */}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results info */}
      {coupons.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, coupons.length)} trong
          số {coupons.length} mã giảm giá
        </div>
      )}

      {/* Delete Confirmation Dialog */}
<<<<<<< HEAD
      <CustomModal
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, couponId: null, couponCode: "" })
        }
        onConfirm={handleDeleteConfirm}
        title={"Xo max giảm giá"}
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
=======
        <CustomModal open={deleteDialog.open} onClose={()=> setDeleteDialog({open:false, couponId: null,couponCode:""})} onConfirm={handleDeleteConfirm} title={"Xo max giảm giá"}  description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
                     confirmText="Xóa"
                     cancelText="Hủy"
                     variant="destructive"/>
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
    </div>
  );
}
