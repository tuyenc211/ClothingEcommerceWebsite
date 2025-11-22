"use client";

import { useState, useEffect } from "react";
import { useColorStore } from "@/stores/colorStore";
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
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import Link from "next/link";

export default function ColorListPage() {
  const { colors, deleteColor, fetchColors, isLoading } = useColorStore();
  useEffect(() => {
    fetchColors();
  }, [fetchColors]);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    colorId: number | null;
    colorName: string;
  }>({
    open: false,
    colorId: null,
    colorName: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      open: true,
      colorId: id,
      colorName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.colorId) {
      await deleteColor(deleteModal.colorId);
      setDeleteModal({ open: false, colorId: null, colorName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, colorId: null, colorName: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Pagination calculation
  const totalPages = Math.ceil(colors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedColors = colors.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold">Colors</h1>
          <p className="text-muted-foreground">Quản lý màu sắc cho sản phẩm</p>
        </div>
        <Button asChild>
          <Link href="/colors/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm màu
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng màu sắc</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colors.length}</div>
            <p className="text-xs text-muted-foreground">
              Màu sắc trong hệ thống
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}

      {/* Colors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách màu sắc ({colors.length})</CardTitle>
          <CardDescription>Tất cả màu sắc trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mã màu</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Không tìm thấy màu sắc nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedColors.map((color, index) => (
                    <TableRow key={color.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: color.code }}
                          />
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: color.code + "20",
                              color:
                                color.code === "#FFFFFF"
                                  ? "#000000"
                                  : color.code,
                            }}
                          >
                            {color.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {color.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {color.code}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/colors/edit/${color.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(color.id, color.name)
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
      {colors.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, colors.length)} trong số{" "}
          {colors.length} màu sắc
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        open={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Bạn có chắc chắn muốn xóa màu "${deleteModal.colorName}"?`}
        description="Hành động này không thể hoàn tác. Màu sắc sẽ bị xóa vĩnh viễn."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
