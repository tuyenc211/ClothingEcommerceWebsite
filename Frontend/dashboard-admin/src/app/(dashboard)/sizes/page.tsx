"use client";

import { useState, useEffect } from "react";
import { useSizeStore } from "@/stores/sizeStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomModal from "@/components/common/CustomModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2, Ruler } from "lucide-react";
import Link from "next/link";

export default function SizeListPage() {
  const { sizes, deleteSize, fetchSizes, isLoading } = useSizeStore();
  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    sizeId: number | null;
    sizeName: string;
  }>({
    open: false,
    sizeId: null,
    sizeName: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      open: true,
      sizeId: id,
      sizeName: name,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.sizeId) {
      deleteSize(deleteModal.sizeId);
      setDeleteModal({ open: false, sizeId: null, sizeName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, sizeId: null, sizeName: "" });
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const sortedSizes = [...sizes].sort((a, b) => a.sortOrder - b.sortOrder);

  // Pagination calculation
  const totalPages = Math.ceil(sortedSizes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSizes = sortedSizes.slice(startIndex, endIndex);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sizes</h1>
          <p className="text-muted-foreground">
            Quản lý kích thước cho sản phẩm
          </p>
        </div>
        <Button asChild>
          <Link href="/sizes/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm size
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng kích thước
            </CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sizes.length}</div>
            <p className="text-xs text-muted-foreground">
              Kích thước trong hệ thống
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sizes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách kích thước ({sizes.length})</CardTitle>
          <CardDescription>Tất cả kích thước trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã size</TableHead>
                  <TableHead>Tên size</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Không tìm thấy kích thước nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSizes.map((size) => (
                    <TableRow key={size.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {size.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{size.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{size.sortOrder}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/sizes/edit/${size.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(size.id, size.name)
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
          </div>
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
      {sizes.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, sortedSizes.length)}{" "}
          trong số {sortedSizes.length} kích thước
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        open={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Bạn có chắc chắn muốn xóa size "${deleteModal.sizeName}"?`}
        description="Hành động này không thể hoàn tác. Kích thước sẽ bị xóa vĩnh viễn."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
