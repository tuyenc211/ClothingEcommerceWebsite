"use client";
import { useEffect } from "react";
import { useOrderStore } from "@/stores/orderStore";
import { OrderTable } from "@/app/user/orders/_components/OrderTable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import UserLayout from "@/components/layouts/UserLayout";
import useAuthStore from "@/stores/useAuthStore";
export default function OrdersPage() {
  const {
    orders,
    isLoading,
    currentPage,
    itemsPerPage,
    setPage,
    fetchUserOrders,
  } = useOrderStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (authUser?.id) {
      fetchUserOrders(authUser.id);
    }
  }, [fetchUserOrders, authUser?.id]);

  // Sort orders by created_at (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Show 5 page numbers at most
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
      <div className="p-2 md:p-6  max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng</h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng</p>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="p-1 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng</h1>
          <p className="text-gray-600">
            Quản lý và theo dõi đơn hàng ({orders.length} tổng cộng)
          </p>
        </div>
        {/* Orders Table */}
        <OrderTable orders={paginatedOrders} />

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
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, sortedOrders.length)}{" "}
          trong {sortedOrders.length} đơn hàng
        </div>
      </div>
    </UserLayout>
  );
}
