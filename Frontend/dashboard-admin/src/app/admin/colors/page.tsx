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
import CustomModal from "@/components/shared/CustomModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import Link from "next/link";

export default function ColorListPage() {
  const { colors, deleteColor, fetchColors, isLoading, error } =
    useColorStore();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    colorId: number | null;
    colorName: string;
  }>({
    open: false,
    colorId: null,
    colorName: "",
  });
  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      open: true,
      colorId: id,
      colorName: name,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.colorId) {
      deleteColor(deleteModal.colorId);
      setDeleteModal({ open: false, colorId: null, colorName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, colorId: null, colorName: "" });
  };

  // Fetch colors when component mounts
  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lỗi: {error}</p>
          <Button onClick={() => fetchColors()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colors</h1>
          <p className="text-muted-foreground">Quản lý màu sắc cho sản phẩm</p>
        </div>
        <Button asChild>
          <Link href="/admin/colors/add">
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
                  colors.map((color) => (
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
                            <Link href={`/admin/colors/edit/${color.id}`}>
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
