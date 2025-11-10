"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
  showPages?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  showPages = 5,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Nếu totalItems đổi làm currentPage vượt quá totalPages -> kéo về trang cuối
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const half = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + showPages - 1);
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages, showPages]);

  const setPage = useCallback(
    (p: number) => {
      if (p < 1 || p > totalPages) return;
      setCurrentPage(p);
    },
    [totalPages]
  );

  const next = useCallback(
    () => setPage(currentPage + 1),
    [currentPage, setPage]
  );
  const prev = useCallback(
    () => setPage(currentPage - 1),
    [currentPage, setPage]
  );

  const slice = useCallback(
    <T>(arr: T[]) => arr.slice(startIndex, endIndex),
    [startIndex, endIndex]
  );

  return {
    currentPage,
    setPage,
    next,
    prev,
    canNext: currentPage < totalPages,
    canPrev: currentPage > 1,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    itemsPerPage,
    slice,
  };
}
